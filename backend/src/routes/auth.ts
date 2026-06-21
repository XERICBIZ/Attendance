import { Router, Response } from 'express';
import { User } from '../models/User';
import { Settings } from '../models/Settings';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// With Supabase Auth, login and registration happens on the frontend using the Supabase Client.
// The backend only needs to verify the token and return the user's database profile.

router.get('/me', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    
    // In Mongoose, we query using findById
    const user = await User.findById(req.user.id);
    
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const settings = await Settings.findOne({ userId: req.user.id });

    // Format like Prisma `include: { settings: true }`
    const userObj = user.toObject();
    userObj.id = userObj._id; // Map _id back to id for frontend
    userObj.settings = settings;
    
    res.status(200).json({ user: userObj });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
