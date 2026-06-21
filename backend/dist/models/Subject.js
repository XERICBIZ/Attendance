"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Subject = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const uuid_1 = require("uuid");
const SubjectSchema = new mongoose_1.default.Schema({
    _id: { type: String, default: uuid_1.v4 },
    userId: { type: String, required: true, ref: 'User' },
    semesterId: { type: String, ref: 'Semester' },
    subjectName: { type: String, required: true },
    subjectCode: { type: String },
    facultyName: { type: String },
    credits: { type: Number, default: 3 },
    type: { type: String, default: 'Theory' },
    minAttendance: { type: Number, default: 75 }
}, { timestamps: true });
exports.Subject = mongoose_1.default.models.Subject || mongoose_1.default.model('Subject', SubjectSchema);
//# sourceMappingURL=Subject.js.map