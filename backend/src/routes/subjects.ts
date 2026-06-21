import { Router, Response } from 'express';
import { Subject } from '../models/Subject';
import { Attendance } from '../models/Attendance';
import { authenticate, AuthRequest } from '../middleware/auth';
import { z } from 'zod';

const router = Router();
router.use(authenticate);

const subjectSchema = z.object({
  id: z.string().optional(), // In case frontend sends id
  subjectName: z.string().min(1),
  subjectCode: z.string().optional(),
  facultyName: z.string().optional(),
  credits: z.number().int().optional(),
  type: z.string().optional(),
  minAttendance: z.number().int().min(0).max(100).optional(),
});

router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const subjects = await Subject.find({ userId: req.user!.id }).lean();
    
    // To mimic prisma `include: { attendance: true }`
    for (const subject of subjects) {
      (subject as any).id = subject._id;
      (subject as any).attendance = await Attendance.find({ subjectId: subject._id }).lean();
      for (const att of (subject as any).attendance) {
        att.id = att._id;
      }
    }
    
    res.json({ subjects });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch subjects' });
  }
});

router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = subjectSchema.parse(req.body);
    const subjectData: any = {
      ...data,
      userId: req.user!.id,
    };
    if (data.id) {
       subjectData._id = data.id; // Map frontend uuid to Mongoose _id
    }
    
    const subject = await Subject.create(subjectData);
    const subjectObj = subject.toObject();
    subjectObj.id = subjectObj._id;
    
    res.status(201).json({ subject: subjectObj });
  } catch (error) {
    res.status(400).json({ error: 'Invalid input' });
  }
});

router.put('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const data = subjectSchema.parse(req.body);
    
    const subject = await Subject.findOne({ _id: id, userId: req.user!.id });
    if (!subject) {
      res.status(404).json({ error: 'Subject not found' });
      return;
    }

    const updated = await Subject.findByIdAndUpdate(id, data, { new: true }).lean();
    (updated as any).id = (updated as any)._id;
    
    res.json({ subject: updated });
  } catch (error) {
    res.status(400).json({ error: 'Invalid input' });
  }
});

router.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const subject = await Subject.findOne({ _id: id, userId: req.user!.id });
    if (!subject) {
      res.status(404).json({ error: 'Subject not found' });
      return;
    }

    await Subject.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete subject' });
  }
});

export default router;
