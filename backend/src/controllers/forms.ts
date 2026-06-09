import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';
import { formSubmissionSchema } from '../validators';

export async function createFormSubmission(req: Request, res: Response): Promise<void> {
  try {
    const { firstName, lastName, email, organization, subject, message } = req.body;
    const name = [firstName, lastName].filter(Boolean).join(' ') || undefined;
    const data = JSON.stringify({ organization, subject });
    const item = await prisma.formSubmission.create({
      data: { formType: 'contact', name, email, message, data },
    });
    res.status(201).json(item);
  } catch (err) {
    console.error('Create form submission error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function listFormSubmissions(req: AuthRequest, res: Response): Promise<void> {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.formSubmission.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.formSubmission.count(),
    ]);

    res.json({ items, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    console.error('List form submissions error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getFormSubmission(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    const item = await prisma.formSubmission.findUnique({ where: { id } });
    if (!item) {
      res.status(404).json({ error: 'Form submission not found' });
      return;
    }
    res.json(item);
  } catch (err) {
    console.error('Get form submission error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updateFormSubmission(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    const parsed = formSubmissionSchema.parse(req.body);
    const item = await prisma.formSubmission.update({
      where: { id },
      data: parsed,
    });
    res.json(item);
  } catch (err: any) {
    if (err.name === 'ZodError') {
      res.status(400).json({ error: 'Validation error', details: err.errors });
      return;
    }
    if ((err as any).code === 'P2025') {
      res.status(404).json({ error: 'Form submission not found' });
      return;
    }
    console.error('Update form submission error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function deleteFormSubmission(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    await prisma.formSubmission.delete({ where: { id } });
    res.json({ message: 'Form submission deleted' });
  } catch (err: any) {
    if ((err as any).code === 'P2025') {
      res.status(404).json({ error: 'Form submission not found' });
      return;
    }
    console.error('Delete form submission error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
