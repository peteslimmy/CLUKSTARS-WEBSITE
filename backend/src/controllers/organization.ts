import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';
import { organizationSchema } from '../validators';

export async function getOrganization(_req: AuthRequest, res: Response): Promise<void> {
  try {
    let org = await prisma.organization.findFirst();
    if (!org) {
      org = await prisma.organization.create({
        data: { name: 'CLUKSTARS' },
      });
    }
    res.json(org);
  } catch (err) {
    console.error('Get organization error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updateOrganization(req: AuthRequest, res: Response): Promise<void> {
  try {
    const parsed = organizationSchema.parse(req.body);
    let org = await prisma.organization.findFirst();
    if (!org) {
      org = await prisma.organization.create({ data: { name: parsed.name } });
    }
    const updated = await prisma.organization.update({
      where: { id: org.id },
      data: parsed,
    });
    res.json(updated);
  } catch (err: any) {
    if (err.name === 'ZodError') {
      res.status(400).json({ error: 'Validation error', details: err.errors });
      return;
    }
    console.error('Update organization error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
