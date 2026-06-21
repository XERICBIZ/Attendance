import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const SemesterSchema = new mongoose.Schema({
  _id: { type: String, default: uuidv4 },
  userId: { type: String, required: true, ref: 'User' },
  semesterName: { type: String, required: true }
}, { timestamps: true });

export const Semester = (mongoose.models.Semester || mongoose.model('Semester', SemesterSchema)) as mongoose.Model<any>;
