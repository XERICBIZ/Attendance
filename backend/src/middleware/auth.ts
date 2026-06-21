import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
import { User } from '../models/User';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Unauthorized: No token provided' });
      return;
    }

    const token = authHeader.split(' ')[1];
    
    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      res.status(401).json({ error: 'Unauthorized: Invalid token' });
      return;
    }
    
    // Ensure user exists in our MongoDB database
    let dbUser = await User.findById(user.id);
    if (!dbUser) {
      // Auto-create user record in our DB if it doesn't exist yet
      dbUser = await User.create({
        _id: user.id,
        email: user.email || '',
        name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
      });
      // Also create default settings
      const { Settings } = await import('../models/Settings');
      await Settings.create({ userId: user.id });
    }

    req.user = {
      id: dbUser._id,
      email: dbUser.email,
    };
    
    next();
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized: Authentication failed' });
  }
};
