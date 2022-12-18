import {
	getRoomsController,
	getRoomByIdController,
	getRoomByNameController,
	createRoomController,
	deleteRoomByIdController,
	deleteRoomByNameController,
} from "../controller/Room.controller";
import { Router } from "express";

const router = Router();

router.get("/", getRoomsController);
router.get("/:id", getRoomByIdController);
router.get("/name/:name", getRoomByNameController);
router.post("/", createRoomController);
router.delete("/:id", deleteRoomByIdController);
router.delete("/name/:name", deleteRoomByNameController);

export default router;
