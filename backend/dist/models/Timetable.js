"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Timetable = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const uuid_1 = require("uuid");
const TimetableSchema = new mongoose_1.default.Schema({
    _id: { type: String, default: uuid_1.v4 },
    userId: { type: String, required: true, ref: 'User' },
    subjectId: { type: String, required: true, ref: 'Subject' },
    day: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    room: { type: String }
}, { timestamps: true });
exports.Timetable = mongoose_1.default.models.Timetable || mongoose_1.default.model('Timetable', TimetableSchema);
//# sourceMappingURL=Timetable.js.map