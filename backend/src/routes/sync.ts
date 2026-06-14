import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import { z } from 'zod';

const router = Router();
router.use(authenticate);

const syncDataSchema = z.object({
  lastSyncAt: z.string().datetime().optional(),
  mutations: z.array(z.object({
    id: z.string(),
    type: z.enum(['create', 'update', 'delete']),
    entity: z.enum(['subject', 'attendance', 'timetable', 'extraClass']),
    data: z.any(),
    timestamp: z.string().datetime()
  }))
});

router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { lastSyncAt, mutations } = syncDataSchema.parse(req.body);
    const userId = req.user!.id;
    
    // In a real production app, you would apply the mutations here
    // sequentially and handle conflicts.
    // For now, we simulate processing these mutations.
    console.log(`Processing ${mutations.length} mutations from user ${userId}`);

    // Fetch the latest state to return to the client
    const timestamp = lastSyncAt ? new Date(lastSyncAt) : new Date(0);

    const subjects = await prisma.subject.findMany({
      where: { userId, updatedAt: { gt: timestamp } }
    });

    const attendance = await prisma.attendance.findMany({
      where: { userId, updatedAt: { gt: timestamp } }
    });

    const timetable = await prisma.timetable.findMany({
      where: { userId, updatedAt: { gt: timestamp } }
    });

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      data: {
        subjects,
        attendance,
        timetable
      }
    });
  } catch (error) {
    res.status(400).json({ error: 'Sync failed' });
  }
});

export default router;
