import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import { z } from 'zod';

const router = Router();
router.use(authenticate);

const subjectSchema = z.object({
  subjectName: z.string().min(1),
  subjectCode: z.string().optional(),
  facultyName: z.string().optional(),
  credits: z.number().int().optional(),
  type: z.string().optional(),
  minAttendance: z.number().int().min(0).max(100).optional(),
});

router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const subjects = await prisma.subject.findMany({
      where: { userId: req.user!.id },
      include: {
        attendance: true,
      }
    });
    res.json({ subjects });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch subjects' });
  }
});

router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = subjectSchema.parse(req.body);
    const subject = await prisma.subject.create({
      data: {
        ...(data as any),
        userId: req.user!.id,
      },
    });
    res.status(201).json({ subject });
  } catch (error) {
    res.status(400).json({ error: 'Invalid input' });
  }
});

router.put('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const data = subjectSchema.parse(req.body);
    
    const subject = await prisma.subject.findUnique({ where: { id: id as string } });
    if (!subject || subject.userId !== req.user!.id) {
      res.status(404).json({ error: 'Subject not found' });
      return;
    }

    const updated = await prisma.subject.update({
      where: { id: id as string },
      data: data as any,
    });
    res.json({ subject: updated });
  } catch (error) {
    res.status(400).json({ error: 'Invalid input' });
  }
});

router.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const subject = await prisma.subject.findUnique({ where: { id: id as string } });
    if (!subject || subject.userId !== req.user!.id) {
      res.status(404).json({ error: 'Subject not found' });
      return;
    }

    await prisma.subject.delete({ where: { id: id as string } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete subject' });
  }
});

export default router;
