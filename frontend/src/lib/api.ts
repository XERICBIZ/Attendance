import { createClient } from './supabase';
import { db } from './db';
import { v4 as uuidv4 } from 'uuid';
import { useAppStore } from '@/store/useAppStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const getAuthToken = async () => {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token;
};

async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = await getAuthToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'API request failed');
  }

  return response.json();
}

// Offline-First Wrapper
export async function offlineFirstMutation(
  entity: 'subjects' | 'attendance' | 'timetable' | 'overrides',
  type: 'create' | 'update' | 'delete',
  data: any,
  apiEndpoint: string,
  apiMethod: 'POST' | 'PUT' | 'DELETE'
) {
  // 1. Save to local Dexie DB immediately for snappy UI
  const userId = useAppStore.getState().user?.id || 'offline-user';
  const id = data.id || uuidv4();
  const localData = { ...data, id, userId, updatedAt: new Date().toISOString() };
  
  if (type === 'create' || type === 'update') {
    await (db as any)[entity].put(localData);
  } else if (type === 'delete') {
    await (db as any)[entity].delete(id);
  }

  // 2. Try to sync to backend
  if (navigator.onLine) {
    try {
      const response = await fetchWithAuth(apiEndpoint, {
        method: apiMethod,
        body: JSON.stringify(localData),
      });
      return response;
    } catch (error) {
      console.warn('Backend sync failed, saving to mutations queue for background sync', error);
      // Fall through to save mutation
    }
  }

  // 3. If offline or backend failed, save to mutation queue
  await db.mutations.put({
    id: uuidv4(),
    entity,
    type,
    data: localData,
    timestamp: new Date().toISOString(),
  });

  return { success: true, offline: true, data: localData };
}

// Fetch all data from the backend and populate Dexie
export async function hydrateFromServer() {
  if (!navigator.onLine) return;

  try {
    const [subjectsRes, attendanceRes, timetableRes] = await Promise.all([
      fetchWithAuth('/subjects').catch(() => ({ subjects: [] })),
      fetchWithAuth('/attendance').catch(() => ({ attendance: [] })),
      fetchWithAuth('/timetable').catch(() => ({ timetable: [] })),
    ]);

    const userId = useAppStore.getState().user?.id;
    if (!userId) return;

    // Clear old local data for this user and replace with server data
    const oldSubjects = await db.subjects.where('userId').equals(userId).toArray();
    await Promise.all(oldSubjects.map(s => db.subjects.delete(s.id)));
    const oldAttendance = await db.attendance.where('userId').equals(userId).toArray();
    await Promise.all(oldAttendance.map(a => db.attendance.delete(a.id)));
    const oldTimetable = await db.timetable.where('userId').equals(userId).toArray();
    await Promise.all(oldTimetable.map(t => db.timetable.delete(t.id)));

    // Populate Dexie with server data
    for (const subject of subjectsRes.subjects || []) {
      await db.subjects.put({ ...subject, userId });
    }
    for (const att of attendanceRes.attendance || []) {
      await db.attendance.put({ ...att, userId });
    }
    for (const entry of timetableRes.timetable || []) {
      await db.timetable.put({ ...entry, userId });
    }

    console.log('Hydrated local DB from server');
  } catch (error) {
    console.warn('Failed to hydrate from server:', error);
  }
}

export const api = {
  getSubjects: async () => {
    const userId = useAppStore.getState().user?.id || 'offline-user';
    let subjects = await db.subjects.where('userId').equals(userId).toArray();

    // If local DB is empty and online, try fetching from server
    if (subjects.length === 0 && navigator.onLine && userId !== 'offline-user') {
      try {
        const serverData = await fetchWithAuth('/subjects');
        for (const sub of serverData.subjects || []) {
          await db.subjects.put({ ...sub, userId });
        }
        subjects = await db.subjects.where('userId').equals(userId).toArray();
      } catch (e) {
        console.warn('Failed to fetch subjects from server:', e);
      }
    }

    // Also attach attendance to subjects so the UI calculations work
    for (const sub of subjects) {
      const attendance = await db.attendance.where('subjectId').equals(sub.id).toArray();
      (sub as any).attendance = attendance;
    }
    return { subjects };
  },
  createSubject: (data: any) => offlineFirstMutation('subjects', 'create', data, '/subjects', 'POST'),
  updateSubject: (id: string, data: any) => offlineFirstMutation('subjects', 'update', { ...data, id }, `/subjects/${id}`, 'PUT'),
  deleteSubject: (id: string) => offlineFirstMutation('subjects', 'delete', { id }, `/subjects/${id}`, 'DELETE'),
  
  getAttendance: async () => {
    const userId = useAppStore.getState().user?.id || 'offline-user';
    let attendance = await db.attendance.where('userId').equals(userId).toArray();

    if (attendance.length === 0 && navigator.onLine && userId !== 'offline-user') {
      try {
        const serverData = await fetchWithAuth('/attendance');
        for (const att of serverData.attendance || []) {
          await db.attendance.put({ ...att, userId });
        }
        attendance = await db.attendance.where('userId').equals(userId).toArray();
      } catch (e) {
        console.warn('Failed to fetch attendance from server:', e);
      }
    }
    return { attendance };
  },
  markAttendance: (data: any) => offlineFirstMutation('attendance', 'create', data, '/attendance', 'POST'),
  
  getTimetable: async () => {
    const userId = useAppStore.getState().user?.id || 'offline-user';
    let timetable = await db.timetable.where('userId').equals(userId).toArray();

    if (timetable.length === 0 && navigator.onLine && userId !== 'offline-user') {
      try {
        const serverData = await fetchWithAuth('/timetable');
        for (const entry of serverData.timetable || []) {
          await db.timetable.put({ ...entry, userId });
        }
        timetable = await db.timetable.where('userId').equals(userId).toArray();
      } catch (e) {
        console.warn('Failed to fetch timetable from server:', e);
      }
    }
    return { timetable };
  },
  createTimetableEntry: (data: any) => offlineFirstMutation('timetable', 'create', data, '/timetable', 'POST'),
  
  getOverrides: async (date: string) => {
    const userId = useAppStore.getState().user?.id || 'offline-user';
    const overrides = await db.overrides.where('userId').equals(userId).filter(o => o.date === date).toArray();
    return { overrides };
  },
  createOverride: (data: any) => offlineFirstMutation('overrides', 'create', data, '/overrides', 'POST'),
  deleteOverride: (id: string) => offlineFirstMutation('overrides', 'delete', { id }, `/overrides/${id}`, 'DELETE'),
};

export async function syncBackground() {
  if (!navigator.onLine) return;
  
  const mutations = await db.mutations.toArray();
  if (mutations.length === 0) return;

  try {
    const response = await fetchWithAuth('/sync', {
      method: 'POST',
      body: JSON.stringify({ mutations }),
    });

    if (response.success) {
      // Clear mutations queue on success
      await db.mutations.clear();
      
      // Update local db with server state
      for (const subject of response.data.subjects) {
         await db.subjects.put(subject);
      }
      for (const att of response.data.attendance) {
         await db.attendance.put(att);
      }
      for (const table of response.data.timetable) {
         await db.timetable.put(table);
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

export async function getAdminUsers(password: string) {
  const response = await fetch(`${API_URL}/admin/users`, {
    headers: {
      'Content-Type': 'application/json',
      'x-admin-password': password,
    },
  });

  if (!response.ok) {
    throw new Error('Unauthorized');
  }

  return response.json();
}
