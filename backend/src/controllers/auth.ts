import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../lib/prisma';
import redis from '../lib/redis';
import { config } from '../config/env';
import { AuthRequest } from '../middleware/auth';
import { registerSchema, loginSchema } from '../validators';

function generateAccessToken(user: { id: string; email: string; roleId: string | null; permissions: string[] }): string {
  return jwt.sign(
    { userId: user.id, email: user.email, roleId: user.roleId, permissions: user.permissions },
    config.jwt.secret,
    { expiresIn: config.jwt.accessExpiry as any }
  );
}

function generateRefreshToken(): string {
  return uuidv4();
}

export async function register(req: AuthRequest, res: Response): Promise<void> {
  try {
    const parsed = registerSchema.parse(req.body);
    const existing = await prisma.user.findUnique({ where: { email: parsed.email } });
    if (existing) {
      res.status(409).json({ error: 'Email already registered' });
      return;
    }
    const passwordHash = await bcrypt.hash(parsed.password, 12);
    const user = await prisma.user.create({
      data: {
        email: parsed.email,
        passwordHash,
        firstName: parsed.firstName,
        lastName: parsed.lastName,
      },
    });
    res.status(201).json({ message: 'User registered successfully', userId: user.id });
  } catch (err: any) {
    if (err.name === 'ZodError') {
      res.status(400).json({ error: 'Validation error', details: err.errors });
      return;
    }
    console.error('Register error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function login(req: AuthRequest, res: Response): Promise<void> {
  try {
    const parsed = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({
      where: { email: parsed.email },
      include: { role: { include: { permissions: true } } },
    });
    if (!user || user.status !== 'ACTIVE') {
      res.status(401).json({ error: 'Invalid credentials or account inactive' });
      return;
    }
    const valid = await bcrypt.compare(parsed.password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }
    const permissions = user.role?.permissions.map(p => `${p.resource}:${p.action}`) || [];
    if (user.twoFactorEnabled) {
      const loginId = uuidv4();
      await redis.set(`2fa:${loginId}`, user.id, 'EX', 300);
      res.json({ require2FA: true, loginId });
      return;
    }
    const accessToken = generateAccessToken({
      id: user.id,
      email: user.email,
      roleId: user.roleId,
      permissions,
    });
    const refreshToken = generateRefreshToken();
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
    res.json({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatarUrl: user.avatarUrl,
        role: user.role?.name,
        permissions,
      },
    });
  } catch (err: any) {
    if (err.name === 'ZodError') {
      res.status(400).json({ error: 'Validation error', details: err.errors });
      return;
    }
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function refreshToken(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { refreshToken: token } = req.body;
    if (!token) {
      res.status(400).json({ error: 'Refresh token required' });
      return;
    }
    const stored = await prisma.refreshToken.findUnique({ where: { token } });
    if (!stored || stored.expiresAt < new Date()) {
      res.status(401).json({ error: 'Invalid or expired refresh token' });
      return;
    }
    const user = await prisma.user.findUnique({
      where: { id: stored.userId },
      include: { role: { include: { permissions: true } } },
    });
    if (!user || user.status !== 'ACTIVE') {
      res.status(401).json({ error: 'User not found or inactive' });
      return;
    }
    await prisma.refreshToken.delete({ where: { id: stored.id } });
    const permissions = user.role?.permissions.map(p => `${p.resource}:${p.action}`) || [];
    const accessToken = generateAccessToken({
      id: user.id,
      email: user.email,
      roleId: user.roleId,
      permissions,
    });
    const newRefreshToken = generateRefreshToken();
    await prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
    res.json({ accessToken, refreshToken: newRefreshToken });
  } catch (err) {
    console.error('Refresh error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function logout(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { refreshToken: token } = req.body;
    if (token) {
      await prisma.refreshToken.deleteMany({ where: { token } });
    }
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    console.error('Logout error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getMe(req: AuthRequest, res: Response): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: { role: { include: { permissions: true } } },
    });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    const permissions = user.role?.permissions.map(p => `${p.resource}:${p.action}`) || [];
    res.json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      avatarUrl: user.avatarUrl,
      role: user.role?.name,
      permissions,
      twoFactorEnabled: user.twoFactorEnabled,
    });
  } catch (err) {
    console.error('GetMe error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function setup2FA(req: AuthRequest, res: Response): Promise<void> {
  try {
    const secret = speakeasy.generateSecret({ name: `${config.appName}:${req.user!.email}` });
    const qrCode = await qrcode.toDataURL(secret.otpauth_url!);
    res.json({ secret: secret.base32, qrCode });
  } catch (err) {
    console.error('Setup 2FA error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function verify2FA(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { token, secret } = req.body;
    const verified = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
    });
    if (!verified) {
      res.status(400).json({ error: 'Invalid 2FA token' });
      return;
    }
    await prisma.user.update({
      where: { id: req.user!.id },
      data: { twoFactorSecret: secret, twoFactorEnabled: true },
    });
    res.json({ message: '2FA enabled successfully' });
  } catch (err) {
    console.error('Verify 2FA error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function verify2FALogin(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { loginId, token } = req.body;
    const userId = await redis.get(`2fa:${loginId}`);
    if (!userId) {
      res.status(400).json({ error: 'Invalid or expired login session' });
      return;
    }
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: { include: { permissions: true } } },
    });
    if (!user || !user.twoFactorSecret) {
      res.status(400).json({ error: '2FA not configured' });
      return;
    }
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
    });
    if (!verified) {
      res.status(400).json({ error: 'Invalid 2FA token' });
      return;
    }
    await redis.del(`2fa:${loginId}`);
    const permissions = user.role?.permissions.map(p => `${p.resource}:${p.action}`) || [];
    const accessToken = generateAccessToken({
      id: user.id,
      email: user.email,
      roleId: user.roleId,
      permissions,
    });
    const refreshToken = generateRefreshToken();
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
    res.json({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role?.name,
        permissions,
      },
    });
  } catch (err) {
    console.error('2FA login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
