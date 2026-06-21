"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Attendance = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const uuid_1 = require("uuid");
const AttendanceSchema = new mongoose_1.default.Schema({
    _id: { type: String, default: uuid_1.v4 },
    userId: { type: String, required: true, ref: 'User' },
    subjectId: { type: String, required: true, ref: 'Subject' },
    date: { type: Date, required: true },
    status: { type: String, required: true },
    notes: { type: String }
}, { timestamps: true });
exports.Attendance = mongoose_1.default.models.Attendance || mongoose_1.default.model('Attendance', AttendanceSchema);
//# sourceMappingURL=Attendance.js.map