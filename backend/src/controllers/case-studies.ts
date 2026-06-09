import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';
import { caseStudySchema } from '../validators';

export async function listCaseStudies(req: AuthRequest, res: Response): Promise<void> {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.caseStudy.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.caseStudy.count(),
    ]);

    res.json({ items, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    console.error('List case studies error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getCaseStudy(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    const item = await prisma.caseStudy.findUnique({ where: { id } });
    if (!item) {
      res.status(404).json({ error: 'Case study not found' });
      return;
    }
    res.json(item);
  } catch (err) {
    console.error('Get case study error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getCaseStudyBySlug(req: AuthRequest, res: Response): Promise<void> {
  try {
    const slug = req.params.slug as string;
    const item = await prisma.caseStudy.findUnique({ where: { slug } });
    if (!item || item.status !== 'PUBLISHED') {
      res.status(404).json({ error: 'Case study not found' });
      return;
    }
    res.json(item);
  } catch (err) {
    console.error('Get case study by slug error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function createCaseStudy(req: AuthRequest, res: Response): Promise<void> {
  try {
    const parsed = caseStudySchema.parse(req.body);
    const item = await prisma.caseStudy.create({
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
      res.status(409).json({ error: 'A case study with this slug already exists' });
      return;
    }
    console.error('Create case study error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updateCaseStudy(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    const parsed = caseStudySchema.parse(req.body);
    const existing = await prisma.caseStudy.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: 'Case study not found' });
      return;
    }
    const wasPublished = parsed.status === 'PUBLISHED' && existing.status !== 'PUBLISHED';
    const item = await prisma.caseStudy.update({
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
      res.status(409).json({ error: 'A case study with this slug already exists' });
      return;
    }
    if ((err as any).code === 'P2025') {
      res.status(404).json({ error: 'Case study not found' });
      return;
    }
    console.error('Update case study error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function deleteCaseStudy(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    await prisma.caseStudy.delete({ where: { id } });
    res.json({ message: 'Case study deleted' });
  } catch (err: any) {
    if ((err as any).code === 'P2025') {
      res.status(404).json({ error: 'Case study not found' });
      return;
    }
    console.error('Delete case study error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
