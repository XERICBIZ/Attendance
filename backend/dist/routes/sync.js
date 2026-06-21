"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Subject_1 = require("../models/Subject");
const Attendance_1 = require("../models/Attendance");
const Timetable_1 = require("../models/Timetable");
const auth_1 = require("../middleware/auth");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
const syncDataSchema = zod_1.z.object({
    lastSyncAt: zod_1.z.string().datetime().optional(),
    mutations: zod_1.z.array(zod_1.z.object({
        id: zod_1.z.string(),
        type: zod_1.z.enum(['create', 'update', 'delete']),
        entity: zod_1.z.enum(['subject', 'attendance', 'timetable', 'extraClass', 'subjects', 'overrides']),
        data: zod_1.z.any(),
        timestamp: zod_1.z.string().datetime()
    }))
});
router.post('/', async (req, res) => {
    try {
        const { lastSyncAt, mutations } = syncDataSchema.parse(req.body);
        const userId = req.user.id;
        console.log(`Processing ${mutations.length} mutations from user ${userId}`);
        // In a full offline-first system, apply mutations here.
        // For now, we simulate processing these mutations.
        // Fetch the latest state to return to the client
        const timestamp = lastSyncAt ? new Date(lastSyncAt) : new Date(0);
        const subjects = await Subject_1.Subject.find({ userId, updatedAt: { $gt: timestamp } }).lean();
        for (const sub of subjects) {
            sub.id = sub._id;
        }
        const attendance = await Attendance_1.Attendance.find({ userId, updatedAt: { $gt: timestamp } }).lean();
        for (const att of attendance) {
            att.id = att._id;
        }
        const timetable = await Timetable_1.Timetable.find({ userId, updatedAt: { $gt: timestamp } }).lean();
        for (const entry of timetable) {
            entry.id = entry._id;
        }
        res.json({
            success: true,
            timestamp: new Date().toISOString(),
            data: {
                subjects,
                attendance,
                timetable
            }
        });
    }
    catch (error) {
        console.error(error);
        res.status(400).json({ error: 'Sync failed' });
    }
});
exports.default = router;
//# sourceMappingURL=sync.js.map