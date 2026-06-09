import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';
import { pageSchema } from '../validators';

export async function listPages(req: AuthRequest, res: Response): Promise<void> {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.page.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.page.count(),
    ]);

    res.json({ items, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    console.error('List pages error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getPage(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    const item = await prisma.page.findUnique({ where: { id } });
    if (!item) {
      res.status(404).json({ error: 'Page not found' });
      return;
    }
    res.json(item);
  } catch (err) {
    console.error('Get page error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getPageBySlug(req: AuthRequest, res: Response): Promise<void> {
  try {
    const slug = req.params.slug as string;
    const item = await prisma.page.findUnique({ where: { slug } });
    if (!item || item.status !== 'PUBLISHED') {
      res.status(404).json({ error: 'Page not found' });
      return;
    }
    res.json(item);
  } catch (err) {
    console.error('Get page by slug error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function createPage(req: AuthRequest, res: Response): Promise<void> {
  try {
    const parsed = pageSchema.parse(req.body);
    const item = await prisma.page.create({
      data: {
        ...parsed,
        publishedAt: parsed.status === 'PUBLISHED' ? new Date().toISOString() : undefined,
      },
    });
    res.status(201).json(item);
  } catch (err: any) {
    if (err.name === 'ZodError') {
      res.status(400).json({ error: 'Validation error', details: err.errors });
      return;
    }
    if ((err as any).code === 'P2002') {
      res.status(409).json({ error: 'A page with this slug already exists' });
      return;
    }
    console.error('Create page error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updatePage(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    const parsed = pageSchema.parse(req.body);
    const existing = await prisma.page.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: 'Page not found' });
      return;
    }
    const wasPublished = parsed.status === 'PUBLISHED' && existing.status !== 'PUBLISHED';
    const item = await prisma.page.update({
      where: { id },
      data: {
        ...parsed,
        publishedAt: wasPublished ? new Date().toISOString() : undefined,
      },
    });
    res.json(item);
  } catch (err: any) {
    if (err.name === 'ZodError') {
      res.status(400).json({ error: 'Validation error', details: err.errors });
      return;
    }
    if ((err as any).code === 'P2002') {
      res.status(409).json({ error: 'A page with this slug already exists' });
      return;
    }
    if ((err as any).code === 'P2025') {
      res.status(404).json({ error: 'Page not found' });
      return;
    }
    console.error('Update page error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function deletePage(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    await prisma.page.delete({ where: { id } });
    res.json({ message: 'Page deleted' });
  } catch (err: any) {
    if ((err as any).code === 'P2025') {
      res.status(404).json({ error: 'Page not found' });
      return;
    }
    console.error('Delete page error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
