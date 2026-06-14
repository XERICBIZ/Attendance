"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../middleware/auth");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
const timetableSchema = zod_1.z.object({
    subjectId: zod_1.z.string().uuid(),
    day: zod_1.z.string(),
    startTime: zod_1.z.string(),
    endTime: zod_1.z.string(),
    room: zod_1.z.string().optional(),
});
router.get('/', async (req, res) => {
    try {
        const timetable = await prisma_1.prisma.timetable.findMany({
            where: { userId: req.user.id },
        });
        res.json({ timetable });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch timetable' });
    }
});
router.post('/', async (req, res) => {
    try {
        const data = timetableSchema.parse(req.body);
        const subject = await prisma_1.prisma.subject.findUnique({ where: { id: data.subjectId } });
        if (!subject || subject.userId !== req.user.id) {
            res.status(400).json({ error: 'Invalid subject' });
            return;
        }
        const classEntry = await prisma_1.prisma.timetable.create({
            data: {
                ...data,
                userId: req.user.id,
            },
        });
        res.status(201).json({ class: classEntry });
    }
    catch (error) {
        res.status(400).json({ error: 'Invalid input' });
    }
});
exports.default = router;
//# sourceMappingURL=timetable.js.map