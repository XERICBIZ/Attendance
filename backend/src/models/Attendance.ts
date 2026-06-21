import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const AttendanceSchema = new mongoose.Schema({
  _id: { type: String, default: uuidv4 },
  userId: { type: String, required: true, ref: 'User' },
  subjectId: { type: String, required: true, ref: 'Subject' },
  date: { type: Date, required: true },
  status: { type: String, required: true },
  notes: { type: String }
}, { timestamps: true });

export const Attendance = (mongoose.models.Attendance || mongoose.model('Attendance', AttendanceSchema)) as mongoose.Model<any>;
