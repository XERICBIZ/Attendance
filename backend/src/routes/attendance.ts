import { Router, Response } from 'express';
import { Attendance } from '../models/Attendance';
import { Subject } from '../models/Subject';
import { authenticate, AuthRequest } from '../middleware/auth';
import { z } from 'zod';

const router = Router();
router.use(authenticate);

const attendanceSchema = z.object({
  id: z.string().optional(),
  subjectId: z.string(),
  date: z.string().datetime().or(z.string()),
  status: z.enum(['Present', 'Absent', 'Cancelled', 'Holiday']),
  notes: z.string().optional(),
});

router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const attendance = await Attendance.find({ userId: req.user!.id }).sort({ date: -1 }).lean();
    for (const att of attendance) {
       (att as any).id = (att as any)._id;
    }
    res.json({ attendance });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch attendance' });
  }
});

router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = attendanceSchema.parse(req.body);
    
    // Validate subject belongs to user
    const subject = await Subject.findOne({ _id: data.subjectId, userId: req.user!.id });
    if (!subject) {
      res.status(400).json({ error: 'Invalid subject' });
      return;
    }

    const attendanceData: any = {
      ...data,
      userId: req.user!.id,
    };
    if (data.id) attendanceData._id = data.id;

    const attendanceRecord = await Attendance.create(attendanceData);
    const attObj = attendanceRecord.toObject();
    attObj.id = attObj._id;

    res.status(201).json({ attendance: attObj });
  } catch (error) {
    res.status(400).json({ error: 'Invalid input' });
  }
});

export default router;
