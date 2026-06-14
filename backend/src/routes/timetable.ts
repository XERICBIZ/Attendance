import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import { z } from 'zod';

const router = Router();
router.use(authenticate);

const timetableSchema = z.object({
  subjectId: z.string().uuid(),
  day: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  room: z.string().optional(),
});

router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const timetable = await prisma.timetable.findMany({
      where: { userId: req.user!.id },
    });
    res.json({ timetable });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch timetable' });
  }
});

router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = timetableSchema.parse(req.body);
    
    const subject = await prisma.subject.findUnique({ where: { id: data.subjectId } });
    if (!subject || subject.userId !== req.user!.id) {
      res.status(400).json({ error: 'Invalid subject' });
      return;
    }

    const entry = await prisma.timetable.create({
      data: {
        ...(data as any),
        userId: req.user!.id,
      },
    });
    res.status(201).json({ class: entry });
  } catch (error) {
    res.status(400).json({ error: 'Invalid input' });
  }
});

export default router;
