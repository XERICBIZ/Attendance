import { Router, Response } from 'express';
import { Timetable } from '../models/Timetable';
import { Subject } from '../models/Subject';
import { authenticate, AuthRequest } from '../middleware/auth';
import { z } from 'zod';

const router = Router();
router.use(authenticate);

const timetableSchema = z.object({
  id: z.string().optional(),
  subjectId: z.string(),
  day: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  room: z.string().optional(),
});

router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const timetable = await Timetable.find({ userId: req.user!.id }).lean();
    for (const entry of timetable) {
       (entry as any).id = (entry as any)._id;
    }
    res.json({ timetable });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch timetable' });
  }
});

router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = timetableSchema.parse(req.body);
    
    const subject = await Subject.findOne({ _id: data.subjectId, userId: req.user!.id });
    if (!subject) {
      res.status(400).json({ error: 'Invalid subject' });
      return;
    }

    const timetableData: any = {
      ...data,
      userId: req.user!.id,
    };
    if (data.id) timetableData._id = data.id;

    const entry = await Timetable.create(timetableData);
    const entryObj = entry.toObject();
    entryObj.id = entryObj._id;

    res.status(201).json({ class: entryObj });
  } catch (error) {
    res.status(400).json({ error: 'Invalid input' });
  }
});

export default router;
