"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const User_1 = require("../models/User");
const Settings_1 = require("../models/Settings");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// With Supabase Auth, login and registration happens on the frontend using the Supabase Client.
// The backend only needs to verify the token and return the user's database profile.
router.get('/me', auth_1.authenticate, async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        // In Mongoose, we query using findById
        let user = await User_1.User.findById(req.user.id);
        // If this is a new user from Supabase, they won't be in MongoDB yet
        if (!user) {
            user = await User_1.User.create({
                _id: req.user.id,
                email: req.user.email || 'unknown@example.com',
                name: req.user.user_metadata?.full_name || 'Student'
            });
            // Also create default settings
            await Settings_1.Settings.create({ userId: req.user.id });
        }
        const settings = await Settings_1.Settings.findOne({ userId: req.user.id });
        // Format like Prisma `include: { settings: true }`
        const userObj = user.toObject();
        userObj.id = userObj._id; // Map _id back to id for frontend
        userObj.settings = settings;
        res.status(200).json({ user: userObj });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map