"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../middleware/auth");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
const subjectSchema = zod_1.z.object({
    subjectName: zod_1.z.string().min(1),
    subjectCode: zod_1.z.string().optional(),
    facultyName: zod_1.z.string().optional(),
    credits: zod_1.z.number().int().optional(),
    type: zod_1.z.string().optional(),
    minAttendance: zod_1.z.number().int().min(0).max(100).optional(),
});
router.get('/', async (req, res) => {
    try {
        const subjects = await prisma_1.prisma.subject.findMany({
            where: { userId: req.user.id },
            include: {
                attendance: true,
            }
        });
        res.json({ subjects });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch subjects' });
    }
});
router.post('/', async (req, res) => {
    try {
        const data = subjectSchema.parse(req.body);
        const subject = await prisma_1.prisma.subject.create({
            data: {
                ...data,
                userId: req.user.id,
            },
        });
        res.status(201).json({ subject });
    }
    catch (error) {
        res.status(400).json({ error: 'Invalid input' });
    }
});
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const data = subjectSchema.parse(req.body);
        const subject = await prisma_1.prisma.subject.findUnique({ where: { id } });
        if (!subject || subject.userId !== req.user.id) {
            res.status(404).json({ error: 'Subject not found' });
            return;
        }
        const updated = await prisma_1.prisma.subject.update({
            where: { id },
            data,
        });
        res.json({ subject: updated });
    }
    catch (error) {
        res.status(400).json({ error: 'Invalid input' });
    }
});
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const subject = await prisma_1.prisma.subject.findUnique({ where: { id } });
        if (!subject || subject.userId !== req.user.id) {
            res.status(404).json({ error: 'Subject not found' });
            return;
        }
        await prisma_1.prisma.subject.delete({ where: { id } });
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete subject' });
    }
});
exports.default = router;
//# sourceMappingURL=subjects.js.map