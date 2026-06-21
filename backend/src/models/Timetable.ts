import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const TimetableSchema = new mongoose.Schema({
  _id: { type: String, default: uuidv4 },
  userId: { type: String, required: true, ref: 'User' },
  subjectId: { type: String, required: true, ref: 'Subject' },
  day: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  room: { type: String }
}, { timestamps: true });

export const Timetable = (mongoose.models.Timetable || mongoose.model('Timetable', TimetableSchema)) as mongoose.Model<any>;
