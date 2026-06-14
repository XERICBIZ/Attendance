import Dexie, { Table } from 'dexie';

export interface Subject {
  id: string;
  userId: string;
  subjectName: string;
  subjectCode?: string;
  facultyName?: string;
  credits: number;
  type: string;
  minAttendance: number;
  updatedAt?: string;
}

export interface Attendance {
  id: string;
  userId: string;
  subjectId: string;
  date: string;
  status: 'Present' | 'Absent' | 'Cancelled' | 'Holiday';
  notes?: string;
  updatedAt?: string;
}

export interface Timetable {
  id: string;
  userId: string;
  subjectId: string;
  day: string;
  startTime: string;
  endTime: string;
  room?: string;
  updatedAt?: string;
}

export interface Mutation {
  id: string;
  type: 'create' | 'update' | 'delete';
  entity: 'subjects' | 'attendance' | 'timetable' | 'overrides';
  data: any;
  timestamp: string;
}

export interface Override {
  id: string;
  userId: string;
  date: string;
  type: 'extra' | 'substitute' | 'cancel';
  timetableId?: string;
  subjectId?: string; // The new subject for substitute/extra
  startTime?: string;
  endTime?: string;
  updatedAt?: string;
}

export class AttendXDatabase extends Dexie {
  subjects!: Table<Subject, string>;
  attendance!: Table<Attendance, string>;
  timetable!: Table<Timetable, string>;
  mutations!: Table<Mutation, string>;
  overrides!: Table<Override, string>;

  constructor() {
    super('AttendXDB');
    this.version(1).stores({
      subjects: 'id, userId, subjectName',
      attendance: 'id, userId, subjectId, date',
      timetable: 'id, userId, subjectId, day',
      mutations: 'id, type, entity, timestamp',
    });
    this.version(2).stores({
      subjects: 'id, userId, subjectName',
      attendance: 'id, userId, subjectId, date',
      timetable: 'id, userId, subjectId, day',
      mutations: 'id, type, entity, timestamp',
      overrides: 'id, userId, date',
    }).upgrade(tx => {
      // no schema migration logic needed since we're just adding a table
    });
  }
}

export const db = new AttendXDatabase();
