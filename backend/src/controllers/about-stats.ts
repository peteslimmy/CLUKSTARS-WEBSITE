import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';
import { aboutStatSchema } from '../validators';

export async function listAboutStats(req: AuthRequest, res: Response): Promise<void> {
  try {
    const items = await prisma.aboutStat.findMany({ orderBy: { sortOrder: 'asc' } });
    res.json(items);
  } catch (err) {
    console.error('List about stats error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getAboutStat(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    const item = await prisma.aboutStat.findUnique({ where: { id } });
    if (!item) { res.status(404).json({ error: 'Not found' }); return; }
    res.json(item);
  } catch (err) {
    console.error('Get about stat error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function createAboutStat(req: AuthRequest, res: Response): Promise<void> {
  try {
    const parsed = aboutStatSchema.parse(req.body);
    const item = await prisma.aboutStat.create({ data: parsed });
    res.status(201).json(item);
  } catch (err: any) {
    if (err.name === 'ZodError') { res.status(400).json({ error: 'Validation error', details: err.errors }); return; }
    console.error('Create about stat error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updateAboutStat(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    const parsed = aboutStatSchema.parse(req.body);
    await prisma.aboutStat.findUniqueOrThrow({ where: { id } });
    const item = await prisma.aboutStat.update({ where: { id }, data: parsed });
    res.json(item);
  } catch (err: any) {
    if (err.name === 'ZodError') { res.status(400).json({ error: 'Validation error', details: err.errors }); return; }
    if ((err as any).code === 'P2025') { res.status(404).json({ error: 'Not found' }); return; }
    console.error('Update about stat error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function deleteAboutStat(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    await prisma.aboutStat.delete({ where: { id } });
    res.json({ message: 'Deleted' });
  } catch (err: any) {
    if ((err as any).code === 'P2025') { res.status(404).json({ error: 'Not found' }); return; }
    console.error('Delete about stat error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
