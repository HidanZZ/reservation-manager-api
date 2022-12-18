import mongoose, { Error, ObjectId, Types } from "mongoose";
import { IMeeting } from "../model/Meeting.model";
import RoomModel, { IRoom } from "../model/Room.model";

const getRooms = async () => {
	try {
		const rooms = await RoomModel.find();
		return rooms;
	} catch (e: any) {
		throw new Error(e.message);
	}
};

const getRoomById = async (id?: string | Types.ObjectId) => {
	try {
		const room = await RoomModel.findById(id);
		if (!room) {
			throw new Error(`Room with id '${id}' not found`);
		}
		return room;
	} catch (e: any) {
		throw new Error(e.message);
	}
};

const getRoomByName = async (name: string) => {
	try {
		const room = await RoomModel.findOne({
			name: name,
		});
		if (!room) {
			throw new Error(`Room with name '${name}' not found`);
		}
		return room;
	} catch (e: any) {
		throw new Error(e.message);
	}
};

const getRoomsWithToolsAndMeetingsSortedAndCapacityGreaterThan = async (
	tools: { [key: string]: boolean },
	capacity: number = 1
) => {
	try {
		const toolsWithPrefix = Object.keys(tools).reduce(
			(acc: { [key: string]: boolean }, tool) => {
				acc[`tools.${tool}`] = tools[tool];
				return acc;
			},
			{}
		);
		const rooms = await RoomModel.aggregate([
			{
				$match: {
					...toolsWithPrefix,
					capacity: { $gte: capacity },
				},
			},

			{
				$unwind: "$meetings",
			},
			{
				$sort: {
					"meetings.startTime": 1,
				},
			},
			{
				$group: {
					_id: "$_id",
					name: { $first: "$name" },
					capacity: { $first: "$capacity" },
					tools: { $first: "$tools" },
					meetings: { $push: "$meetings" },
				},
			},
		]);

		let result = rooms;
		if (rooms.length === 0) {
			result = await getRoomsWithToolAndCapacityGreaterThan(tools, capacity);
		}
		if (!result) {
			throw new Error(`No room with tools '${tools}' found`);
		}

		return result;
	} catch (e: any) {
		throw new Error(e.message);
	}
};
const getRoomsWithToolAndCapacityGreaterThan = async (
	tools: { [key: string]: boolean },
	capacity: number = 1
) => {
	try {
		const toolsWithPrefix = Object.keys(tools).reduce(
			(acc: { [key: string]: boolean }, tool) => {
				acc[`tools.${tool}`] = tools[tool];
				return acc;
			},
			{}
		);
		const rooms = await RoomModel.find(toolsWithPrefix)
			.where("capacity")
			.gte(capacity);
		if (!rooms) {
			throw new Error(`No room with tools '${tools}' found`);
		}

		return rooms;
	} catch (e: any) {
		throw new Error(e.message);
	}
};
const createRoom = async (room: IRoom): Promise<IRoom> => {
	try {
		const newRoom = await RoomModel.create(room);
		return newRoom;
	} catch (e: any) {
		if (e instanceof mongoose.Error.ValidationError) {
			Object.keys(e.errors).forEach((key) => {
				throw new Error(e.errors[key].message.replace("Path", "Field"));
			});
			throw new Error(e.message);
		} else if (Object.keys(e).includes("code") && e.code === 11000) {
			throw new Error(`Room with name ${room.name} already exists`);
		} else {
			throw new Error(e.message);
		}
	}
};

const deleteRoomById = async (id: string) => {
	try {
		const deletedRoom = await RoomModel.findByIdAndDelete(id);
		if (!deletedRoom) {
			throw new Error(`Room with id '${id}' not found`);
		}
		return deletedRoom;
	} catch (e: any) {
		throw new Error(e.message);
	}
};

const deleteRoomByName = async (name: string) => {
	try {
		const deletedRoom = await RoomModel.findOneAndDelete({
			name: name,
		});
		if (!deletedRoom) {
			throw new Error(`Room with name '${name}' not found`);
		}
		return deletedRoom;
	} catch (e: any) {
		throw new Error(e.message);
	}
};
const addMeeting = async (roomId: Types.ObjectId, meeting: IMeeting) => {
	try {
		const updatedRoom = await RoomModel.findByIdAndUpdate(roomId, {
			$push: { meetings: meeting },
		});

		if (!updatedRoom) {
			throw new Error(`Room with id '${roomId}' not found`);
		}
		return updatedRoom;
	} catch (e: any) {
		throw new Error(e.message);
	}
};
const removeMeeting = async (roomId: Types.ObjectId, meeting: IMeeting) => {
	try {
		const updatedRoom = await RoomModel.findByIdAndUpdate(roomId, {
			$pull: { meetings: meeting },
		});
		if (!updatedRoom) {
			throw new Error(`Room with id '${roomId}' not found`);
		}
		return updatedRoom;
	} catch (e: any) {
		throw new Error(e.message);
	}
};
const deleteAllMeetingsInAllRooms = async () => {
	try {
		const updatedRooms = await RoomModel.updateMany(
			{},
			{ $set: { meetings: [] } }
		);
		if (!updatedRooms) {
			throw new Error(`No rooms found`);
		}
		return updatedRooms;
	} catch (e: any) {
		throw new Error(e.message);
	}
};
export {
	deleteAllMeetingsInAllRooms,
	addMeeting,
	removeMeeting,
	getRooms,
	getRoomById,
	getRoomByName,
	createRoom,
	getRoomsWithToolsAndMeetingsSortedAndCapacityGreaterThan,
	deleteRoomById,
	deleteRoomByName,
};
