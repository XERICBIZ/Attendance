import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import { z } from 'zod';

const router = Router();
router.use(authenticate);

const attendanceSchema = z.object({
  subjectId: z.string().uuid(),
  date: z.string().datetime(),
  status: z.enum(['Present', 'Absent', 'Cancelled', 'Holiday']),
  notes: z.string().optional(),
});

router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const attendance = await prisma.attendance.findMany({
      where: { userId: req.user!.id },
      orderBy: { date: 'desc' }
    });
    res.json({ attendance });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch attendance' });
  }
});

router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = attendanceSchema.parse(req.body);
    
    // Validate subject belongs to user
    const subject = await prisma.subject.findUnique({ where: { id: data.subjectId } });
    if (!subject || subject.userId !== req.user!.id) {
      res.status(400).json({ error: 'Invalid subject' });
      return;
    }

    const attendanceRecord = await prisma.attendance.create({
      data: {
        ...(data as any),
        userId: req.user!.id,
      },
    });
    res.status(201).json({ attendance: attendanceRecord });
  } catch (error) {
    res.status(400).json({ error: 'Invalid input' });
  }
});

export default router;
