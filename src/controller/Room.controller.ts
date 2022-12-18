import {
	getRooms,
	getRoomById,
	getRoomByName,
	createRoom,
	deleteRoomById,
	deleteRoomByName,
} from "../service/Room.service";
import { Request, Response } from "express";

const getRoomsController = async (req: Request, res: Response) => {
	try {
		const rooms = await getRooms();
		res.status(200).json({ rooms });
	} catch (e: any) {
		res.status(500).json({ error: e.message });
	}
};

const getRoomByIdController = async (req: Request, res: Response) => {
	try {
		const room = await getRoomById(req.params.id);
		res.status(200).json({ room });
	} catch (e: any) {
		res.status(500).json({ error: e.message });
	}
};

const getRoomByNameController = async (req: Request, res: Response) => {
	try {
		const room = await getRoomByName(req.params.name);
		res.status(200).json({ room });
	} catch (e: any) {
		res.status(500).json({ error: e.message });
	}
};

const createRoomController = async (req: Request, res: Response) => {
	try {
		const room = await createRoom(req.body);
		res.status(201).json({ room });
	} catch (e: any) {
		res.status(500).json({ error: e.message });
	}
};

const deleteRoomByIdController = async (req: Request, res: Response) => {
	try {
		const room = await deleteRoomById(req.params.id);
		res.status(200).json({ room });
	} catch (e: any) {
		res.status(500).json({ error: e.message });
	}
};

const deleteRoomByNameController = async (req: Request, res: Response) => {
	try {
		const room = await deleteRoomByName(req.params.name);
		res.status(200).json({ room });
	} catch (e: any) {
		res.status(500).json({ error: e.message });
	}
};

export {
	getRoomsController,
	getRoomByIdController,
	getRoomByNameController,
	createRoomController,
	deleteRoomByIdController,
	deleteRoomByNameController,
};
