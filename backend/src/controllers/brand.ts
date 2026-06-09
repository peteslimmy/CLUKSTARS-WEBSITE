import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';
import { brandSettingsSchema } from '../validators';

export async function getBrandSettings(_req: AuthRequest, res: Response): Promise<void> {
  try {
    let brand = await prisma.brandSettings.findFirst();
    if (!brand) {
      brand = await prisma.brandSettings.create({
        data: {},
      });
    }
    res.json(brand);
  } catch (err) {
    console.error('Get brand settings error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updateBrandSettings(req: AuthRequest, res: Response): Promise<void> {
  try {
    const parsed = brandSettingsSchema.parse(req.body);
    let brand = await prisma.brandSettings.findFirst();
    if (!brand) {
      brand = await prisma.brandSettings.create({ data: {} });
    }
    const updated = await prisma.brandSettings.update({
      where: { id: brand.id },
      data: parsed,
    });
    res.json(updated);
  } catch (err: any) {
    if (err.name === 'ZodError') {
      res.status(400).json({ error: 'Validation error', details: err.errors });
      return;
    }
    console.error('Update brand settings error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
