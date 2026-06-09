import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';
import { navbarSettingsSchema } from '../validators';

export async function getNavbarSettings(_req: AuthRequest, res: Response): Promise<void> {
  try {
    let settings = await prisma.navbarSettings.findFirst();
    if (!settings) {
      settings = await prisma.navbarSettings.create({ data: {} });
    }
    res.json(settings);
  } catch (err) {
    console.error('Get navbar settings error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updateNavbarSettings(req: AuthRequest, res: Response): Promise<void> {
  try {
    const parsed = navbarSettingsSchema.parse(req.body);
    let settings = await prisma.navbarSettings.findFirst();
    if (!settings) {
      settings = await prisma.navbarSettings.create({ data: {} });
    }
    const updated = await prisma.navbarSettings.update({
      where: { id: settings.id },
      data: parsed,
    });
    res.json(updated);
  } catch (err: any) {
    if (err.name === 'ZodError') {
      res.status(400).json({ error: 'Validation error', details: err.errors });
      return;
    }
    console.error('Update navbar settings error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
