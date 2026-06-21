"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Semester = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const uuid_1 = require("uuid");
const SemesterSchema = new mongoose_1.default.Schema({
    _id: { type: String, default: uuid_1.v4 },
    userId: { type: String, required: true, ref: 'User' },
    semesterName: { type: String, required: true }
}, { timestamps: true });
exports.Semester = mongoose_1.default.models.Semester || mongoose_1.default.model('Semester', SemesterSchema);
//# sourceMappingURL=Semester.js.map