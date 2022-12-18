import mongoose, { Types } from "mongoose";
import { meetingType } from "../model/enum/meetingType";
import MeetingModel, { IMeeting } from "../model/Meeting.model";
import RoomModel, { IRoom } from "../model/Room.model";
import { compareTime } from "../utils/date.utils";
import {
	addMeeting,
	deleteAllMeetingsInAllRooms,
	getRoomById,
	getRoomsWithToolsAndMeetingsSortedAndCapacityGreaterThan,
	removeMeeting,
} from "./Room.service";

type meetingType = "VC" | "SPEC" | "RS" | "RC";

const getMeetings = async (): Promise<IMeeting[]> => {
	try {
		const meetings = await MeetingModel.find();
		return meetings;
	} catch (e: any) {
		throw new Error(e.message);
	}
};

const reserveRoom = async (meeting: IMeeting) => {
	try {
		const m = new MeetingModel(meeting);
		const error = m.validateSync();
		if (error)
			Object.keys(error.errors).forEach((key) => {
				throw new Error(error.errors[key].message.replace("Path", "Field"));
			});

		compareTime(meeting.startTime, meeting.endTime);

		if (await meetingExists(meeting.name)) {
			throw new Error(`Meeting with name '${meeting.name}' already exists`);
		}

		const tools = meetingType[meeting.type];
		const availableRooms =
			await getRoomsWithToolsAndMeetingsSortedAndCapacityGreaterThan(
				tools,
				meeting.attendees * (1 / 0.7) // 70% of capacity
			);

		if (availableRooms.length === 0) {
			throw new Error(`No rooms available for meeting '${meeting.name}'`);
		} else {
			availableRooms.sort((a, b) => a.capacity - b.capacity);

			while (availableRooms.length > 0) {
				let bestRoom = availableRooms[0];

				if (meeting.type === "RS") {
					if (bestRoom.capacity < 4) {
						availableRooms.shift();
						continue;
					}
				}

				const isAvailable = meetingIsAvailable(
					bestRoom,
					meeting.startTime,
					meeting.endTime
				);
				if (!isAvailable) {
					availableRooms.shift();
					continue;
				}
				m.room = bestRoom._id;
				const savedMeeting = await m.save();
				await addMeeting(bestRoom._id, savedMeeting);
				return bestRoom;
			}
			throw new Error(`No rooms available for meeting '${meeting.name}'`);
		}
	} catch (e: any) {
		throw new Error(e.message);
	}
};

const meetingIsAvailable = (
	room: IRoom,
	startTime: Date,
	endTime: Date
): boolean => {
	const sTime = new Date(startTime);
	const eTime = new Date(endTime);
	const meetings = room.meetings;
	if (meetings.length === 0) {
		return true;
	}
	const meetingsInSameDate = meetings.filter((m) => {
		const mStartTime = new Date(m.startTime);
		return (
			mStartTime.getDate() === sTime.getDate() &&
			mStartTime.getMonth() === sTime.getMonth() &&
			mStartTime.getFullYear() === sTime.getFullYear()
		);
	});
	if (meetingsInSameDate.length === 0) {
		return true;
	}

	for (let index = 0; index < meetingsInSameDate.length; index++) {
		const m = meetingsInSameDate[index];
		const mStartTime = new Date(m.startTime);
		const mEndTime = new Date(m.endTime);

		if (mEndTime.getHours() === eTime.getHours()) {
			return false;
		}
		if (mEndTime.getHours() === sTime.getHours()) {
			return false;
		}
		if (mStartTime.getHours() === eTime.getHours()) {
			return false;
		}
	}
	return true;
};
const getMeetingByName = async (name: string): Promise<IMeeting> => {
	try {
		const meeting = await MeetingModel.findOne({
			name: name,
		});
		if (!meeting) {
			throw new Error(`Meeting with name '${name}' not found`);
		}
		return meeting;
	} catch (e: any) {
		throw new Error(e.message);
	}
};
//check if meeting with name exists
const meetingExists = async (name: string): Promise<boolean> => {
	try {
		const meeting = await MeetingModel.exists({
			name: name,
		});
		if (!meeting) {
			return false;
		}
		return true;
	} catch (e: any) {
		throw new Error(e.message);
	}
};

const getMeetingById = async (id: string): Promise<IMeeting> => {
	try {
		const meeting = await MeetingModel.findById(id);
		if (!meeting) {
			throw new Error(`Meeting with id '${id}' not found`);
		}
		return meeting;
	} catch (e: any) {
		throw new Error(e.message);
	}
};

const deleteMeetingById = async (id: string): Promise<IMeeting> => {
	try {
		const meeting = await MeetingModel.findByIdAndDelete(id);
		if (!meeting) {
			throw new Error(`Meeting with id '${id}' not found`);
		}
		return meeting;
	} catch (e: any) {
		throw new Error(e.message);
	}
};
const deleteMeetingByName = async (name: string): Promise<IMeeting> => {
	try {
		const meeting = await MeetingModel.findOneAndDelete({
			name: name,
		});
		if (!meeting) {
			throw new Error(`Meeting with name '${name}' not found`);
		}
		return meeting;
	} catch (e: any) {
		throw new Error(e.message);
	}
};

const getMeetingsByType = async (type: meetingType): Promise<IMeeting[]> => {
	try {
		const meetings = await MeetingModel.find({
			type: type,
		});
		if (!meetings) {
			throw new Error(`No meetings with type '${type}' found`);
		}
		return meetings;
	} catch (e: any) {
		throw new Error(e.message);
	}
};
const deleteAllMeetings = async (): Promise<boolean> => {
	try {
		const meetings = await MeetingModel.deleteMany({});
		if (!meetings) {
			throw new Error(`No meetings found`);
		}
		await deleteAllMeetingsInAllRooms();
		return true;
	} catch (e: any) {
		throw new Error(e.message);
	}
};
const cancelMeeting = async (name: string) => {
	try {
		const meeting = await MeetingModel.findOne({
			name: name,
		});
		if (!meeting) {
			throw new Error(`Meeting with name '${name}' not found`);
		}
		const room = await getRoomById(meeting?.room);
		const deletedSc = await removeMeeting(room._id, meeting);

		return await deleteMeetingById(meeting._id.toString());
	} catch (e: any) {
		throw new Error(e.message);
	}
};

export {
	cancelMeeting,
	reserveRoom,
	getMeetings,
	getMeetingByName,
	getMeetingById,
	deleteMeetingById,
	deleteMeetingByName,
	getMeetingsByType,
	meetingExists,
	deleteAllMeetings,
	meetingType,
};
