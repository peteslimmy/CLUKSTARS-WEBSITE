import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';

export async function listSections(req: AuthRequest, res: Response): Promise<void> {
  try {
    const pageId = Array.isArray(req.params.pageId) ? req.params.pageId[0] : req.params.pageId;
    const sections = await prisma.pageSection.findMany({
      where: { pageId, isActive: true },
      orderBy: { order: 'asc' },
      include: {
        blocks: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
        },
      },
    });
    res.json(sections);
  } catch (err) {
    console.error('List sections error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getSection(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    const section = await prisma.pageSection.findUnique({
      where: { id },
      include: {
        blocks: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
        },
      },
    });
    if (!section) {
      res.status(404).json({ error: 'Section not found' });
      return;
    }
    res.json(section);
  } catch (err) {
    console.error('Get section error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function createSection(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { pageId, type, name, order, isActive, settings, blocks } = req.body;
    const section = await prisma.pageSection.create({
      data: {
        pageId,
        type,
        name,
        order: order || 0,
        isActive: isActive !== false,
        settings,
        blocks: blocks
          ? {
              create: blocks.map((b: any, i: number) => ({
                type: b.type,
                content: b.content,
                order: b.order ?? i,
                isActive: b.isActive !== false,
              })),
            }
          : undefined,
      },
      include: { blocks: true },
    });
    res.status(201).json(section);
  } catch (err: any) {
    console.error('Create section error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updateSection(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    const { type, name, order, isActive, settings } = req.body;
    const section = await prisma.pageSection.update({
      where: { id },
      data: { type, name, order, isActive, settings },
      include: { blocks: true },
    });
    res.json(section);
  } catch (err: any) {
    if ((err as any).code === 'P2025') {
      res.status(404).json({ error: 'Section not found' });
      return;
    }
    console.error('Update section error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function deleteSection(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    await prisma.pageSection.delete({ where: { id } });
    res.json({ message: 'Section deleted' });
  } catch (err: any) {
    if ((err as any).code === 'P2025') {
      res.status(404).json({ error: 'Section not found' });
      return;
    }
    console.error('Delete section error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function reorderSections(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { pageId, sectionIds } = req.body;
    const updates = sectionIds.map((id: string, index: number) =>
      prisma.pageSection.update({
        where: { id },
        data: { order: index },
      })
    );
    await prisma.$transaction(updates);
    res.json({ message: 'Sections reordered' });
  } catch (err: any) {
    console.error('Reorder sections error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}