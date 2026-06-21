import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const SubjectSchema = new mongoose.Schema({
  _id: { type: String, default: uuidv4 },
  userId: { type: String, required: true, ref: 'User' },
  semesterId: { type: String, ref: 'Semester' },
  subjectName: { type: String, required: true },
  subjectCode: { type: String },
  facultyName: { type: String },
  credits: { type: Number, default: 3 },
  type: { type: String, default: 'Theory' },
  minAttendance: { type: Number, default: 75 }
}, { timestamps: true });

export const Subject = (mongoose.models.Subject || mongoose.model('Subject', SubjectSchema)) as mongoose.Model<any>;
