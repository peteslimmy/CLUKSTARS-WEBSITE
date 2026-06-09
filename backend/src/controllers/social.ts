import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';
import { socialLinkSchema } from '../validators';

export async function listSocialLinks(_req: AuthRequest, res: Response): Promise<void> {
  try {
    const links = await prisma.socialLink.findMany({ orderBy: { sortOrder: 'asc' } });
    res.json(links);
  } catch (err) {
    console.error('List social links error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function createSocialLink(req: AuthRequest, res: Response): Promise<void> {
  try {
    const parsed = socialLinkSchema.parse(req.body);
    const link = await prisma.socialLink.create({ data: parsed });
    res.status(201).json(link);
  } catch (err: any) {
    if (err.name === 'ZodError') {
      res.status(400).json({ error: 'Validation error', details: err.errors });
      return;
    }
    console.error('Create social link error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updateSocialLink(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    const parsed = socialLinkSchema.parse(req.body);
    const link = await prisma.socialLink.update({ where: { id }, data: parsed });
    res.json(link);
  } catch (err: any) {
    if (err.name === 'ZodError') {
      res.status(400).json({ error: 'Validation error', details: err.errors });
      return;
    }
    if ((err as any).code === 'P2025') {
      res.status(404).json({ error: 'Social link not found' });
      return;
    }
    console.error('Update social link error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function deleteSocialLink(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    await prisma.socialLink.delete({ where: { id } });
    res.json({ message: 'Social link deleted' });
  } catch (err: any) {
    if ((err as any).code === 'P2025') {
      res.status(404).json({ error: 'Social link not found' });
      return;
    }
    console.error('Delete social link error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
