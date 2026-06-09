import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';
import { homepageStatSchema } from '../validators';

export async function listHomepageStats(req: AuthRequest, res: Response): Promise<void> {
  try {
    const items = await prisma.homepageStat.findMany({ orderBy: { sortOrder: 'asc' } });
    res.json(items);
  } catch (err) {
    console.error('List homepage stats error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getHomepageStat(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    const item = await prisma.homepageStat.findUnique({ where: { id } });
    if (!item) { res.status(404).json({ error: 'Not found' }); return; }
    res.json(item);
  } catch (err) {
    console.error('Get homepage stat error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function createHomepageStat(req: AuthRequest, res: Response): Promise<void> {
  try {
    const parsed = homepageStatSchema.parse(req.body);
    const item = await prisma.homepageStat.create({ data: parsed });
    res.status(201).json(item);
  } catch (err: any) {
    if (err.name === 'ZodError') { res.status(400).json({ error: 'Validation error', details: err.errors }); return; }
    console.error('Create homepage stat error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updateHomepageStat(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    const parsed = homepageStatSchema.parse(req.body);
    await prisma.homepageStat.findUniqueOrThrow({ where: { id } });
    const item = await prisma.homepageStat.update({ where: { id }, data: parsed });
    res.json(item);
  } catch (err: any) {
    if (err.name === 'ZodError') { res.status(400).json({ error: 'Validation error', details: err.errors }); return; }
    if ((err as any).code === 'P2025') { res.status(404).json({ error: 'Not found' }); return; }
    console.error('Update homepage stat error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function deleteHomepageStat(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    await prisma.homepageStat.delete({ where: { id } });
    res.json({ message: 'Deleted' });
  } catch (err: any) {
    if ((err as any).code === 'P2025') { res.status(404).json({ error: 'Not found' }); return; }
    console.error('Delete homepage stat error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
