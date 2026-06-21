"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Timetable_1 = require("../models/Timetable");
const Subject_1 = require("../models/Subject");
const auth_1 = require("../middleware/auth");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
const timetableSchema = zod_1.z.object({
    id: zod_1.z.string().optional(),
    subjectId: zod_1.z.string(),
    day: zod_1.z.string(),
    startTime: zod_1.z.string(),
    endTime: zod_1.z.string(),
    room: zod_1.z.string().optional(),
});
router.get('/', async (req, res) => {
    try {
        const timetable = await Timetable_1.Timetable.find({ userId: req.user.id }).lean();
        for (const entry of timetable) {
            entry.id = entry._id;
        }
        res.json({ timetable });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch timetable' });
    }
});
router.post('/', async (req, res) => {
    try {
        const data = timetableSchema.parse(req.body);
        const subject = await Subject_1.Subject.findOne({ _id: data.subjectId, userId: req.user.id });
        if (!subject) {
            res.status(400).json({ error: 'Invalid subject' });
            return;
        }
        const timetableData = {
            ...data,
            userId: req.user.id,
        };
        if (data.id)
            timetableData._id = data.id;
        const entry = await Timetable_1.Timetable.create(timetableData);
        const entryObj = entry.toObject();
        entryObj.id = entryObj._id;
        res.status(201).json({ class: entryObj });
    }
    catch (error) {
        res.status(400).json({ error: 'Invalid input' });
    }
});
exports.default = router;
//# sourceMappingURL=timetable.js.map