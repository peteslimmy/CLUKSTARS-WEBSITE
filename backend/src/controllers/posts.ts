import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';
import { blogPostSchema } from '../validators';

export async function listPosts(req: AuthRequest, res: Response): Promise<void> {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.blogPost.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.blogPost.count(),
    ]);

    res.json({ items, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    console.error('List posts error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getPost(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    const item = await prisma.blogPost.findUnique({ where: { id } });
    if (!item) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }
    res.json(item);
  } catch (err) {
    console.error('Get post error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getPostBySlug(req: AuthRequest, res: Response): Promise<void> {
  try {
    const slug = req.params.slug as string;
    const item = await prisma.blogPost.findUnique({ where: { slug } });
    if (!item || item.status !== 'PUBLISHED') {
      res.status(404).json({ error: 'Post not found' });
      return;
    }
    res.json(item);
  } catch (err) {
    console.error('Get post by slug error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function createPost(req: AuthRequest, res: Response): Promise<void> {
  try {
    const parsed = blogPostSchema.parse(req.body);
    const item = await prisma.blogPost.create({
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
      res.status(409).json({ error: 'A post with this slug already exists' });
      return;
    }
    console.error('Create post error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updatePost(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    const parsed = blogPostSchema.parse(req.body);
    const existing = await prisma.blogPost.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }
    const wasPublished = parsed.status === 'PUBLISHED' && existing.status !== 'PUBLISHED';
    const item = await prisma.blogPost.update({
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
      res.status(409).json({ error: 'A post with this slug already exists' });
      return;
    }
    if ((err as any).code === 'P2025') {
      res.status(404).json({ error: 'Post not found' });
      return;
    }
    console.error('Update post error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function deletePost(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    await prisma.blogPost.delete({ where: { id } });
    res.json({ message: 'Post deleted' });
  } catch (err: any) {
    if ((err as any).code === 'P2025') {
      res.status(404).json({ error: 'Post not found' });
      return;
    }
    console.error('Delete post error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
