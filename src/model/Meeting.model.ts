import { Schema, model, Types } from "mongoose";
import { type } from "os";

export interface IMeeting {
	name: string;
	startTime: Date;
	endTime: Date;
	type: "VC" | "SPEC" | "RS" | "RC";
	attendees: number;
	room?: Types.ObjectId;
}

export const MeetingSchema = new Schema<IMeeting>({
	name: { type: String, required: true, trim: true },
	startTime: {
		type: Date,
		required: true,
	},
	endTime: { type: Date, required: true },
	type: { type: String, required: true, enum: ["VC", "SPEC", "RS", "RC"] },
	attendees: { type: Number, required: true, min: 1 },
	room: {
		type: Schema.Types.ObjectId,
		ref: "Room",
	},
});

export default model<IMeeting>("Meeting", MeetingSchema);
