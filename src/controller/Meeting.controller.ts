import {
	getMeetings,
	getMeetingById,
	getMeetingByName,
	getMeetingsByType,
	meetingType,
	deleteAllMeetings,
	cancelMeeting,
	reserveRoom,
} from "../service/Meeting.service";
import { Request, Response } from "express";

const getMeetingsController = async (req: Request, res: Response) => {
	try {
		const meetings = await getMeetings();
		res.status(200).json({ meetings });
	} catch (e: any) {
		res.status(500).json({ error: e.message });
	}
};

const getMeetingByIdController = async (req: Request, res: Response) => {
	try {
		const meeting = await getMeetingById(req.params.id);
		res.status(200).json({ meeting });
	} catch (e: any) {
		res.status(500).json({ error: e.message });
	}
};

const getMeetingByNameController = async (req: Request, res: Response) => {
	try {
		const meeting = await getMeetingByName(req.params.name);
		res.status(200).json({ meeting });
	} catch (e: any) {
		res.status(500).json({ error: e.message });
	}
};

const getMeetingsByTypeController = async (req: Request, res: Response) => {
	try {
		const meetings = await getMeetingsByType(req.params.type as meetingType);
		res.status(200).json({ meetings });
	} catch (e: any) {
		res.status(500).json({ error: e.message });
	}
};
const reserveRoomController = async (req: Request, res: Response) => {
	try {
		const room = await reserveRoom(req.body);
		res.status(201).json({ room });
	} catch (e: any) {
		res.status(500).json({ error: e.message });
	}
};
const cancelMeetingController = async (req: Request, res: Response) => {
	try {
		const meeting = await cancelMeeting(req.params.name);
		res.status(200).json({ meeting });
	} catch (e: any) {
		res.status(500).json({ error: e.message });
	}
};

const deleteAllMeetingsController = async (req: Request, res: Response) => {
	try {
		const meetings = await deleteAllMeetings();
		res.status(200).json({ meetings });
	} catch (e: any) {
		res.status(500).json({ error: e.message });
	}
};

export {
	deleteAllMeetingsController,
	getMeetingsController,
	getMeetingByIdController,
	getMeetingByNameController,
	getMeetingsByTypeController,
	reserveRoomController,
	cancelMeetingController,
};
