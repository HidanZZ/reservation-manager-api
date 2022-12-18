import { Schema, model } from "mongoose";
import { IMeeting, MeetingSchema } from "./Meeting.model";

export interface IRoom {
	name: string;
	capacity: number;
	tools: {
		screen: boolean;
		whiteboard: boolean;
		webcam: boolean;
		pieuvre: boolean;
	};
	meetings: IMeeting[];
}

export const RoomSchema = new Schema<IRoom>({
	name: { type: String, required: true, unique: true, trim: true },
	capacity: { type: Number, required: true, min: 1 },
	tools: {
		screen: {
			type: Boolean,
			required: true,
			default: false,
		},
		whiteboard: {
			type: Boolean,
			required: true,
			default: false,
		},
		webcam: {
			type: Boolean,
			required: true,
			default: false,
		},
		pieuvre: {
			type: Boolean,
			required: true,
			default: false,
		},
	},
	meetings: {
		type: [MeetingSchema],
		default: [],
	},
});

export default model<IRoom>("Room", RoomSchema);
