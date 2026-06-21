"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Settings = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const uuid_1 = require("uuid");
const SettingsSchema = new mongoose_1.default.Schema({
    _id: { type: String, default: uuid_1.v4 },
    userId: { type: String, required: true, ref: 'User', unique: true },
    attendanceGoal: { type: Number, default: 75 },
    theme: { type: String, default: 'system' },
    notificationPreferences: { type: Boolean, default: true }
}, { timestamps: true });
exports.Settings = mongoose_1.default.models.Settings || mongoose_1.default.model('Settings', SettingsSchema);
//# sourceMappingURL=Settings.js.map