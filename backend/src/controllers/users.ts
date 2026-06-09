import { Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';
import { userSchema } from '../validators';

export async function listUsers(_req: AuthRequest, res: Response): Promise<void> {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        status: true,
        twoFactorEnabled: true,
        role: { select: { id: true, name: true } },
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(users);
  } catch (err) {
    console.error('List users error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getUser(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        status: true,
        twoFactorEnabled: true,
        role: { select: { id: true, name: true } },
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json(user);
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function createUser(req: AuthRequest, res: Response): Promise<void> {
  try {
    const parsed = userSchema.parse(req.body);
    if (!parsed.password) {
      res.status(400).json({ error: 'Password is required' });
      return;
    }
    const existing = await prisma.user.findUnique({ where: { email: parsed.email } });
    if (existing) {
      res.status(409).json({ error: 'Email already in use' });
      return;
    }
    const passwordHash = await bcrypt.hash(parsed.password, 12);
    const user = await prisma.user.create({
      data: {
        email: parsed.email,
        passwordHash,
        firstName: parsed.firstName,
        lastName: parsed.lastName,
        roleId: parsed.roleId,
        status: parsed.status || 'ACTIVE',
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        status: true,
        role: { select: { id: true, name: true } },
        createdAt: true,
      },
    });
    res.status(201).json(user);
  } catch (err: any) {
    if (err.name === 'ZodError') {
      res.status(400).json({ error: 'Validation error', details: err.errors });
      return;
    }
    console.error('Create user error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updateUser(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    const parsed = userSchema.parse(req.body);
    const data: any = {
      email: parsed.email,
      firstName: parsed.firstName,
      lastName: parsed.lastName,
      roleId: parsed.roleId,
      status: parsed.status,
    };
    if (parsed.password) {
      data.passwordHash = await bcrypt.hash(parsed.password, 12);
    }
    const user = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        status: true,
        role: { select: { id: true, name: true } },
        updatedAt: true,
      },
    });
    res.json(user);
  } catch (err: any) {
    if (err.name === 'ZodError') {
      res.status(400).json({ error: 'Validation error', details: err.errors });
      return;
    }
    if ((err as any).code === 'P2025') {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    console.error('Update user error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function deleteUser(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    if (id === req.user!.id) {
      res.status(400).json({ error: 'Cannot delete yourself' });
      return;
    }
    await prisma.user.delete({ where: { id } });
    res.json({ message: 'User deleted' });
  } catch (err: any) {
    if ((err as any).code === 'P2025') {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    console.error('Delete user error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
