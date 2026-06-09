import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';
import { roleSchema } from '../validators';

export async function listRoles(_req: AuthRequest, res: Response): Promise<void> {
  try {
    const roles = await prisma.role.findMany({
      include: {
        _count: { select: { users: true } },
        permissions: true,
      },
      orderBy: { name: 'asc' },
    });
    res.json(roles);
  } catch (err) {
    console.error('List roles error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getRole(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    const role = await prisma.role.findUnique({
      where: { id },
      include: { permissions: true },
    });
    if (!role) {
      res.status(404).json({ error: 'Role not found' });
      return;
    }
    res.json(role);
  } catch (err) {
    console.error('Get role error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function createRole(req: AuthRequest, res: Response): Promise<void> {
  try {
    const parsed = roleSchema.parse(req.body);
    const role = await prisma.role.create({
      data: {
        name: parsed.name,
        description: parsed.description,
        permissions: {
          create: parsed.permissions,
        },
      },
      include: { permissions: true },
    });
    res.status(201).json(role);
  } catch (err: any) {
    if (err.name === 'ZodError') {
      res.status(400).json({ error: 'Validation error', details: err.errors });
      return;
    }
    if ((err as any).code === 'P2002') {
      res.status(409).json({ error: 'Role name already exists' });
      return;
    }
    console.error('Create role error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updateRole(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    const parsed = roleSchema.parse(req.body);
    const existing = await prisma.role.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: 'Role not found' });
      return;
    }
    if (existing.isSystem) {
      res.status(400).json({ error: 'Cannot modify system roles' });
      return;
    }
    await prisma.permission.deleteMany({ where: { roleId: id } });
    const role = await prisma.role.update({
      where: { id },
      data: {
        name: parsed.name,
        description: parsed.description,
        permissions: {
          create: parsed.permissions,
        },
      },
      include: { permissions: true },
    });
    res.json(role);
  } catch (err: any) {
    if (err.name === 'ZodError') {
      res.status(400).json({ error: 'Validation error', details: err.errors });
      return;
    }
    console.error('Update role error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function deleteRole(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    const role = await prisma.role.findUnique({ where: { id } });
    if (!role) {
      res.status(404).json({ error: 'Role not found' });
      return;
    }
    if (role.isSystem) {
      res.status(400).json({ error: 'Cannot delete system roles' });
      return;
    }
    const userCount = await prisma.user.count({ where: { roleId: id } });
    if (userCount > 0) {
      res.status(400).json({ error: `Cannot delete role with ${userCount} assigned user(s)` });
      return;
    }
    await prisma.role.delete({ where: { id } });
    res.json({ message: 'Role deleted' });
  } catch (err) {
    console.error('Delete role error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
