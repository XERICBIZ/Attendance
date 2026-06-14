"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../middleware/auth");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
const syncDataSchema = zod_1.z.object({
    lastSyncAt: zod_1.z.string().datetime().optional(),
    mutations: zod_1.z.array(zod_1.z.object({
        id: zod_1.z.string(),
        type: zod_1.z.enum(['create', 'update', 'delete']),
        entity: zod_1.z.enum(['subject', 'attendance', 'timetable', 'extraClass']),
        data: zod_1.z.any(),
        timestamp: zod_1.z.string().datetime()
    }))
});
router.post('/', async (req, res) => {
    try {
        const { lastSyncAt, mutations } = syncDataSchema.parse(req.body);
        const userId = req.user.id;
        // In a real production app, you would apply the mutations here
        // sequentially and handle conflicts.
        // For now, we simulate processing these mutations.
        console.log(`Processing ${mutations.length} mutations from user ${userId}`);
        // Fetch the latest state to return to the client
        const timestamp = lastSyncAt ? new Date(lastSyncAt) : new Date(0);
        const subjects = await prisma_1.prisma.subject.findMany({
            where: { userId, updatedAt: { gt: timestamp } }
        });
        const attendance = await prisma_1.prisma.attendance.findMany({
            where: { userId, updatedAt: { gt: timestamp } }
        });
        const timetable = await prisma_1.prisma.timetable.findMany({
            where: { userId, updatedAt: { gt: timestamp } }
        });
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
        res.status(400).json({ error: 'Sync failed' });
    }
});
exports.default = router;
//# sourceMappingURL=sync.js.map