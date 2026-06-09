import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';
import { seoSettingsSchema } from '../validators';

export async function getSeoSettings(_req: AuthRequest, res: Response): Promise<void> {
  try {
    let settings = await prisma.sEOSettings.findFirst();
    if (!settings) {
      settings = await prisma.sEOSettings.create({ data: {} });
    }
    res.json(settings);
  } catch (err) {
    console.error('Get SEO settings error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updateSeoSettings(req: AuthRequest, res: Response): Promise<void> {
  try {
    const parsed = seoSettingsSchema.parse(req.body);
    let settings = await prisma.sEOSettings.findFirst();
    if (!settings) {
      settings = await prisma.sEOSettings.create({ data: {} });
    }
    const updated = await prisma.sEOSettings.update({
      where: { id: settings.id },
      data: parsed,
    });
    res.json(updated);
  } catch (err: any) {
    if (err.name === 'ZodError') {
      res.status(400).json({ error: 'Validation error', details: err.errors });
      return;
    }
    console.error('Update SEO settings error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
