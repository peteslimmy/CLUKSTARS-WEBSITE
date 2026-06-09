import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS'];

export function csrfProtection(req: Request, res: Response, next: NextFunction): void {
  if (SAFE_METHODS.includes(req.method)) {
    next();
    return;
  }

  const token = req.headers['x-csrf-token'];
  const cookie = req.cookies?.['_csrf'];

  if (!token || !cookie || token !== cookie) {
    res.status(403).json({ error: 'Invalid CSRF token' });
    return;
  }

  next();
}

export function csrfTokenMiddleware(req: Request, res: Response, next: NextFunction): void {
  if (!req.cookies?.['_csrf']) {
    const token = crypto.randomBytes(32).toString('hex');
    res.cookie('_csrf', token, {
      httpOnly: false,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 86400000,
    });
  }
  next();
}