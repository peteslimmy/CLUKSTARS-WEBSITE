import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';
import { globalBlockSchema } from '../validators';

export async function listGlobalBlocks(_req: AuthRequest, res: Response): Promise<void> {
  try {
    const items = await prisma.globalBlock.findMany({ orderBy: { name: 'asc' } });
    res.json(items);
  } catch (err) {
    console.error('List global blocks error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getGlobalBlock(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    const item = await prisma.globalBlock.findUnique({ where: { id } });
    if (!item) { res.status(404).json({ error: 'Not found' }); return; }
    res.json(item);
  } catch (err) {
    console.error('Get global block error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function createGlobalBlock(req: AuthRequest, res: Response): Promise<void> {
  try {
    const parsed = globalBlockSchema.parse(req.body);
    const item = await prisma.globalBlock.create({ data: parsed });
    res.status(201).json(item);
  } catch (err: any) {
    if (err.name === 'ZodError') { res.status(400).json({ error: 'Validation error', details: err.errors }); return; }
    if ((err as any).code === 'P2002') { res.status(409).json({ error: 'A block with this name already exists' }); return; }
    console.error('Create global block error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updateGlobalBlock(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    const parsed = globalBlockSchema.parse(req.body);
    await prisma.globalBlock.findUniqueOrThrow({ where: { id } });
    const item = await prisma.globalBlock.update({ where: { id }, data: parsed });
    res.json(item);
  } catch (err: any) {
    if (err.name === 'ZodError') { res.status(400).json({ error: 'Validation error', details: err.errors }); return; }
    if ((err as any).code === 'P2002') { res.status(409).json({ error: 'A block with this name already exists' }); return; }
    if ((err as any).code === 'P2025') { res.status(404).json({ error: 'Not found' }); return; }
    console.error('Update global block error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function deleteGlobalBlock(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    await prisma.globalBlock.delete({ where: { id } });
    res.json({ message: 'Deleted' });
  } catch (err: any) {
    if ((err as any).code === 'P2025') { res.status(404).json({ error: 'Not found' }); return; }
    console.error('Delete global block error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
