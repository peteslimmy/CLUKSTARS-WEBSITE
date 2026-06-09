import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';
import { serviceCategorySchema, serviceSchema } from '../validators';

export async function listCategories(_req: AuthRequest, res: Response): Promise<void> {
  try {
    const items = await prisma.serviceCategory.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        services: {
          orderBy: { sortOrder: 'asc' },
          include: { features: { orderBy: { sortOrder: 'asc' } } },
        },
      },
    });
    res.json(items);
  } catch (err) {
    console.error('List categories error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getCategory(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    const item = await prisma.serviceCategory.findUnique({
      where: { id },
      include: {
        services: {
          orderBy: { sortOrder: 'asc' },
          include: { features: { orderBy: { sortOrder: 'asc' } } },
        },
      },
    });
    if (!item) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }
    res.json(item);
  } catch (err) {
    console.error('Get category error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function createCategory(req: AuthRequest, res: Response): Promise<void> {
  try {
    const parsed = serviceCategorySchema.parse(req.body);
    const item = await prisma.serviceCategory.create({ data: parsed });
    res.status(201).json(item);
  } catch (err: any) {
    if (err.name === 'ZodError') {
      res.status(400).json({ error: 'Validation error', details: err.errors });
      return;
    }
    if ((err as any).code === 'P2002') {
      res.status(409).json({ error: 'A category with this name already exists' });
      return;
    }
    console.error('Create category error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updateCategory(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    const parsed = serviceCategorySchema.parse(req.body);
    const existing = await prisma.serviceCategory.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }
    const item = await prisma.serviceCategory.update({ where: { id }, data: parsed });
    res.json(item);
  } catch (err: any) {
    if (err.name === 'ZodError') {
      res.status(400).json({ error: 'Validation error', details: err.errors });
      return;
    }
    if ((err as any).code === 'P2002') {
      res.status(409).json({ error: 'A category with this name already exists' });
      return;
    }
    if ((err as any).code === 'P2025') {
      res.status(404).json({ error: 'Category not found' });
      return;
    }
    console.error('Update category error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function deleteCategory(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    await prisma.serviceCategory.delete({ where: { id } });
    res.json({ message: 'Category deleted' });
  } catch (err: any) {
    if ((err as any).code === 'P2025') {
      res.status(404).json({ error: 'Category not found' });
      return;
    }
    console.error('Delete category error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function listServices(req: AuthRequest, res: Response): Promise<void> {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.service.findMany({
        orderBy: { sortOrder: 'asc' },
        include: { category: true, features: { orderBy: { sortOrder: 'asc' } } },
        skip,
        take: limit,
      }),
      prisma.service.count(),
    ]);

    res.json({ items, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    console.error('List services error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getService(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    const item = await prisma.service.findUnique({
      where: { id },
      include: { category: true, features: { orderBy: { sortOrder: 'asc' } } },
    });
    if (!item) {
      res.status(404).json({ error: 'Service not found' });
      return;
    }
    res.json(item);
  } catch (err) {
    console.error('Get service error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function createService(req: AuthRequest, res: Response): Promise<void> {
  try {
    const parsed = serviceSchema.parse(req.body);
    const { features, ...data } = parsed as any;
    const item = await prisma.service.create({
      data: {
        ...data,
        features: features
          ? { create: features.map((f: string, i: number) => ({ label: f, sortOrder: i })) }
          : undefined,
      },
      include: { features: true },
    });
    res.status(201).json(item);
  } catch (err: any) {
    if (err.name === 'ZodError') {
      res.status(400).json({ error: 'Validation error', details: err.errors });
      return;
    }
    console.error('Create service error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updateService(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    const parsed = serviceSchema.parse(req.body);
    const { features, ...data } = parsed as any;
    const existing = await prisma.service.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: 'Service not found' });
      return;
    }
    const item = await prisma.service.update({
      where: { id },
      data: {
        ...data,
        features: features
          ? { deleteMany: {}, create: features.map((f: string, i: number) => ({ label: f, sortOrder: i })) }
          : undefined,
      },
      include: { features: true },
    });
    res.json(item);
  } catch (err: any) {
    if (err.name === 'ZodError') {
      res.status(400).json({ error: 'Validation error', details: err.errors });
      return;
    }
    if ((err as any).code === 'P2025') {
      res.status(404).json({ error: 'Service not found' });
      return;
    }
    console.error('Update service error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function deleteService(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    await prisma.service.delete({ where: { id } });
    res.json({ message: 'Service deleted' });
  } catch (err: any) {
    if ((err as any).code === 'P2025') {
      res.status(404).json({ error: 'Service not found' });
      return;
    }
    console.error('Delete service error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
