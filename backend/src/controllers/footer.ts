import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';
import { footerSettingsSchema } from '../validators';

export async function getFooterSettings(_req: AuthRequest, res: Response): Promise<void> {
  try {
    let settings = await prisma.footerSettings.findFirst();
    if (!settings) {
      settings = await prisma.footerSettings.create({ data: {} });
    }
    res.json(settings);
  } catch (err) {
    console.error('Get footer settings error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updateFooterSettings(req: AuthRequest, res: Response): Promise<void> {
  try {
    const parsed = footerSettingsSchema.parse(req.body);
    let settings = await prisma.footerSettings.findFirst();
    if (!settings) {
      settings = await prisma.footerSettings.create({ data: {} });
    }
    const updated = await prisma.footerSettings.update({
      where: { id: settings.id },
      data: parsed,
    });
    res.json(updated);
  } catch (err: any) {
    if (err.name === 'ZodError') {
      res.status(400).json({ error: 'Validation error', details: err.errors });
      return;
    }
    console.error('Update footer settings error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
