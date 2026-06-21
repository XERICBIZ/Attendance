import { Router, Response } from 'express';
import { Subject } from '../models/Subject';
import { Attendance } from '../models/Attendance';
import { Timetable } from '../models/Timetable';
import { authenticate, AuthRequest } from '../middleware/auth';
import { z } from 'zod';

const router = Router();
router.use(authenticate);

const syncDataSchema = z.object({
  lastSyncAt: z.string().datetime().optional(),
  mutations: z.array(z.object({
    id: z.string(),
    type: z.enum(['create', 'update', 'delete']),
    entity: z.enum(['subject', 'attendance', 'timetable', 'extraClass', 'subjects', 'overrides']),
    data: z.any(),
    timestamp: z.string().datetime()
  }))
});

router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { lastSyncAt, mutations } = syncDataSchema.parse(req.body);
    const userId = req.user!.id;
    
    console.log(`Processing ${mutations.length} mutations from user ${userId}`);

    // In a full offline-first system, apply mutations here.
    // For now, we simulate processing these mutations.

    // Fetch the latest state to return to the client
    const timestamp = lastSyncAt ? new Date(lastSyncAt) : new Date(0);

    const subjects = await Subject.find({ userId, updatedAt: { $gt: timestamp } }).lean();
    for (const sub of subjects) { (sub as any).id = (sub as any)._id; }

    const attendance = await Attendance.find({ userId, updatedAt: { $gt: timestamp } }).lean();
    for (const att of attendance) { (att as any).id = (att as any)._id; }

    const timetable = await Timetable.find({ userId, updatedAt: { $gt: timestamp } }).lean();
    for (const entry of timetable) { (entry as any).id = (entry as any)._id; }

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
    console.error(error);
    res.status(400).json({ error: 'Sync failed' });
  }
});

export default router;
