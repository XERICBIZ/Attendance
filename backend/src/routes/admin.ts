import { Router, Response, Request } from 'express';
import { User } from '../models/User';

const router = Router();

router.get('/users', async (req: Request, res: Response): Promise<void> => {
  try {
    const adminPassword = req.headers['x-admin-password'];
    if (adminPassword !== 'tisu') {
      res.status(401).json({ error: 'Unauthorized: Incorrect Admin Password' });
      return;
    }

    const users = await User.find({}).sort({ createdAt: -1 }).lean();
    for (const user of users) {
      (user as any).id = (user as any)._id;
    }

    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
