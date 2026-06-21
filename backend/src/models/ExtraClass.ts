import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const ExtraClassSchema = new mongoose.Schema({
  _id: { type: String, default: uuidv4 },
  userId: { type: String, required: true, ref: 'User' },
  subjectId: { type: String, required: true, ref: 'Subject' },
  date: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  notes: { type: String }
}, { timestamps: true });

export const ExtraClass = (mongoose.models.ExtraClass || mongoose.model('ExtraClass', ExtraClassSchema)) as mongoose.Model<any>;
