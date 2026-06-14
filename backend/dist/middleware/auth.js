"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const prisma_1 = require("../lib/prisma");
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';
const supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ error: 'Unauthorized: No token provided' });
            return;
        }
        const token = authHeader.split(' ')[1];
        // Verify token with Supabase
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (error || !user) {
            res.status(401).json({ error: 'Unauthorized: Invalid token' });
            return;
        }
        // Ensure user exists in our Prisma database
        let dbUser = await prisma_1.prisma.user.findUnique({ where: { id: user.id } });
        if (!dbUser) {
            // Auto-create user record in our DB if it doesn't exist yet
            // This happens on first login after signing up via Supabase
            dbUser = await prisma_1.prisma.user.create({
                data: {
                    id: user.id,
                    email: user.email || '',
                    name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
                }
            });
        }
        req.user = {
            id: dbUser.id,
            email: dbUser.email,
        };
        next();
    }
    catch (error) {
        res.status(401).json({ error: 'Unauthorized: Authentication failed' });
    }
};
exports.authenticate = authenticate;
//# sourceMappingURL=auth.js.map