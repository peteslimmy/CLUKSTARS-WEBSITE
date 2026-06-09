import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';
import { teamMemberSchema } from '../validators';

export async function listTeam(req: AuthRequest, res: Response): Promise<void> {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.teamMember.findMany({
        orderBy: { sortOrder: 'asc' },
        skip,
        take: limit,
      }),
      prisma.teamMember.count(),
    ]);

    res.json({ items, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    console.error('List team error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getTeam(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    const item = await prisma.teamMember.findUnique({ where: { id } });
    if (!item) {
      res.status(404).json({ error: 'Team member not found' });
      return;
    }
    res.json(item);
  } catch (err) {
    console.error('Get team error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function createTeam(req: AuthRequest, res: Response): Promise<void> {
  try {
    const parsed = teamMemberSchema.parse(req.body);
    const item = await prisma.teamMember.create({ data: parsed });
    res.status(201).json(item);
  } catch (err: any) {
    if (err.name === 'ZodError') {
      res.status(400).json({ error: 'Validation error', details: err.errors });
      return;
    }
    console.error('Create team error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updateTeam(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    const parsed = teamMemberSchema.parse(req.body);
    const existing = await prisma.teamMember.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: 'Team member not found' });
      return;
    }
    const item = await prisma.teamMember.update({ where: { id }, data: parsed });
    res.json(item);
  } catch (err: any) {
    if (err.name === 'ZodError') {
      res.status(400).json({ error: 'Validation error', details: err.errors });
      return;
    }
    if ((err as any).code === 'P2025') {
      res.status(404).json({ error: 'Team member not found' });
      return;
    }
    console.error('Update team error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function deleteTeam(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    await prisma.teamMember.delete({ where: { id } });
    res.json({ message: 'Team member deleted' });
  } catch (err: any) {
    if ((err as any).code === 'P2025') {
      res.status(404).json({ error: 'Team member not found' });
      return;
    }
    console.error('Delete team error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
