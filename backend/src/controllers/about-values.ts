import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';
import { aboutValueSchema } from '../validators';

export async function listAboutValues(_req: AuthRequest, res: Response): Promise<void> {
  try {
    const items = await prisma.aboutValue.findMany({ orderBy: { sortOrder: 'asc' } });
    res.json(items);
  } catch (err) {
    console.error('List about values error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getAboutValue(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    const item = await prisma.aboutValue.findUnique({ where: { id } });
    if (!item) { res.status(404).json({ error: 'Not found' }); return; }
    res.json(item);
  } catch (err) {
    console.error('Get about value error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function createAboutValue(req: AuthRequest, res: Response): Promise<void> {
  try {
    const parsed = aboutValueSchema.parse(req.body);
    const item = await prisma.aboutValue.create({ data: parsed });
    res.status(201).json(item);
  } catch (err: any) {
    if (err.name === 'ZodError') { res.status(400).json({ error: 'Validation error', details: err.errors }); return; }
    console.error('Create about value error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updateAboutValue(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    const parsed = aboutValueSchema.parse(req.body);
    await prisma.aboutValue.findUniqueOrThrow({ where: { id } });
    const item = await prisma.aboutValue.update({ where: { id }, data: parsed });
    res.json(item);
  } catch (err: any) {
    if (err.name === 'ZodError') { res.status(400).json({ error: 'Validation error', details: err.errors }); return; }
    if ((err as any).code === 'P2025') { res.status(404).json({ error: 'Not found' }); return; }
    console.error('Update about value error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function deleteAboutValue(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    await prisma.aboutValue.delete({ where: { id } });
    res.json({ message: 'Deleted' });
  } catch (err: any) {
    if ((err as any).code === 'P2025') { res.status(404).json({ error: 'Not found' }); return; }
    console.error('Delete about value error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
