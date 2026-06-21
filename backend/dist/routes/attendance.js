"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Attendance_1 = require("../models/Attendance");
const Subject_1 = require("../models/Subject");
const auth_1 = require("../middleware/auth");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
const attendanceSchema = zod_1.z.object({
    id: zod_1.z.string().optional(),
    subjectId: zod_1.z.string(),
    date: zod_1.z.string().datetime().or(zod_1.z.string()),
    status: zod_1.z.enum(['Present', 'Absent', 'Cancelled', 'Holiday']),
    notes: zod_1.z.string().optional(),
});
router.get('/', async (req, res) => {
    try {
        const attendance = await Attendance_1.Attendance.find({ userId: req.user.id }).sort({ date: -1 }).lean();
        for (const att of attendance) {
            att.id = att._id;
        }
        res.json({ attendance });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch attendance' });
    }
});
router.post('/', async (req, res) => {
    try {
        const data = attendanceSchema.parse(req.body);
        // Validate subject belongs to user
        const subject = await Subject_1.Subject.findOne({ _id: data.subjectId, userId: req.user.id });
        if (!subject) {
            res.status(400).json({ error: 'Invalid subject' });
            return;
        }
        const attendanceData = {
            ...data,
            userId: req.user.id,
        };
        if (data.id)
            attendanceData._id = data.id;
        const attendanceRecord = await Attendance_1.Attendance.create(attendanceData);
        const attObj = attendanceRecord.toObject();
        attObj.id = attObj._id;
        res.status(201).json({ attendance: attObj });
    }
    catch (error) {
        res.status(400).json({ error: 'Invalid input' });
    }
});
exports.default = router;
//# sourceMappingURL=attendance.js.map