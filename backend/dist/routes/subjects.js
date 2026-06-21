"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Subject_1 = require("../models/Subject");
const Attendance_1 = require("../models/Attendance");
const auth_1 = require("../middleware/auth");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
const subjectSchema = zod_1.z.object({
    id: zod_1.z.string().optional(), // In case frontend sends id
    subjectName: zod_1.z.string().min(1),
    subjectCode: zod_1.z.string().optional(),
    facultyName: zod_1.z.string().optional(),
    credits: zod_1.z.number().int().optional(),
    type: zod_1.z.string().optional(),
    minAttendance: zod_1.z.number().int().min(0).max(100).optional(),
});
router.get('/', async (req, res) => {
    try {
        const subjects = await Subject_1.Subject.find({ userId: req.user.id }).lean();
        // To mimic prisma `include: { attendance: true }`
        for (const subject of subjects) {
            subject.id = subject._id;
            subject.attendance = await Attendance_1.Attendance.find({ subjectId: subject._id }).lean();
            for (const att of subject.attendance) {
                att.id = att._id;
            }
        }
        res.json({ subjects });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch subjects' });
    }
});
router.post('/', async (req, res) => {
    try {
        const data = subjectSchema.parse(req.body);
        const subjectData = {
            ...data,
            userId: req.user.id,
        };
        if (data.id) {
            subjectData._id = data.id; // Map frontend uuid to Mongoose _id
        }
        const subject = await Subject_1.Subject.create(subjectData);
        const subjectObj = subject.toObject();
        subjectObj.id = subjectObj._id;
        res.status(201).json({ subject: subjectObj });
    }
    catch (error) {
        res.status(400).json({ error: 'Invalid input' });
    }
});
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const data = subjectSchema.parse(req.body);
        const subject = await Subject_1.Subject.findOne({ _id: id, userId: req.user.id });
        if (!subject) {
            res.status(404).json({ error: 'Subject not found' });
            return;
        }
        const updated = await Subject_1.Subject.findByIdAndUpdate(id, data, { new: true }).lean();
        updated.id = updated._id;
        res.json({ subject: updated });
    }
    catch (error) {
        res.status(400).json({ error: 'Invalid input' });
    }
});
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const subject = await Subject_1.Subject.findOne({ _id: id, userId: req.user.id });
        if (!subject) {
            res.status(404).json({ error: 'Subject not found' });
            return;
        }
        await Subject_1.Subject.findByIdAndDelete(id);
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete subject' });
    }
});
exports.default = router;
//# sourceMappingURL=subjects.js.map