import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const SettingsSchema = new mongoose.Schema({
  _id: { type: String, default: uuidv4 },
  userId: { type: String, required: true, ref: 'User', unique: true },
  attendanceGoal: { type: Number, default: 75 },
  theme: { type: String, default: 'system' },
  notificationPreferences: { type: Boolean, default: true }
}, { timestamps: true });

export const Settings = (mongoose.models.Settings || mongoose.model('Settings', SettingsSchema)) as mongoose.Model<any>;
