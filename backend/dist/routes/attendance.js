"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../middleware/auth");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
const attendanceSchema = zod_1.z.object({
    subjectId: zod_1.z.string().uuid(),
    date: zod_1.z.string().datetime(),
    status: zod_1.z.enum(['Present', 'Absent', 'Cancelled', 'Holiday']),
    notes: zod_1.z.string().optional(),
});
router.get('/', async (req, res) => {
    try {
        const attendance = await prisma_1.prisma.attendance.findMany({
            where: { userId: req.user.id },
            orderBy: { date: 'desc' }
        });
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
        const subject = await prisma_1.prisma.subject.findUnique({ where: { id: data.subjectId } });
        if (!subject || subject.userId !== req.user.id) {
            res.status(400).json({ error: 'Invalid subject' });
            return;
        }
        const attendanceRecord = await prisma_1.prisma.attendance.create({
            data: {
                ...data,
                userId: req.user.id,
            },
        });
        res.status(201).json({ attendance: attendanceRecord });
    }
    catch (error) {
        res.status(400).json({ error: 'Invalid input' });
    }
});
exports.default = router;
//# sourceMappingURL=attendance.js.map