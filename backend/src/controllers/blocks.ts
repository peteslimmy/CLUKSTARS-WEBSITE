import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';

export async function listBlocks(req: AuthRequest, res: Response): Promise<void> {
  try {
    const sectionId = Array.isArray(req.params.sectionId) ? req.params.sectionId[0] : req.params.sectionId;
    const blocks = await prisma.pageBlock.findMany({
      where: { sectionId, isActive: true },
      orderBy: { order: 'asc' },
    });
    res.json(blocks);
  } catch (err) {
    console.error('List blocks error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getBlock(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    const block = await prisma.pageBlock.findUnique({ where: { id } });
    if (!block) {
      res.status(404).json({ error: 'Block not found' });
      return;
    }
    res.json(block);
  } catch (err) {
    console.error('Get block error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function createBlock(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { sectionId, type, content, order, isActive } = req.body;
    const block = await prisma.pageBlock.create({
      data: {
        sectionId,
        type,
        content,
        order: order || 0,
        isActive: isActive !== false,
      },
    });
    res.status(201).json(block);
  } catch (err: any) {
    console.error('Create block error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updateBlock(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    const { type, content, order, isActive } = req.body;
    const block = await prisma.pageBlock.update({
      where: { id },
      data: { type, content, order, isActive },
    });
    res.json(block);
  } catch (err: any) {
    if ((err as any).code === 'P2025') {
      res.status(404).json({ error: 'Block not found' });
      return;
    }
    console.error('Update block error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function deleteBlock(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    await prisma.pageBlock.delete({ where: { id } });
    res.json({ message: 'Block deleted' });
  } catch (err: any) {
    if ((err as any).code === 'P2025') {
      res.status(404).json({ error: 'Block not found' });
      return;
    }
    console.error('Delete block error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function reorderBlocks(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { blockIds } = req.body;
    const updates = blockIds.map((id: string, index: number) =>
      prisma.pageBlock.update({
        where: { id },
        data: { order: index },
      })
    );
    await prisma.$transaction(updates);
    res.json({ message: 'Blocks reordered' });
  } catch (err: any) {
    console.error('Reorder blocks error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}