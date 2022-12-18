import {
	getMeetingsController,
	getMeetingByIdController,
	getMeetingByNameController,
	getMeetingsByTypeController,
	deleteAllMeetingsController,
	reserveRoomController,
	cancelMeetingController,
} from "../controller/Meeting.controller";

import { Router } from "express";

const router = Router();

router.get("/", getMeetingsController);
router.get("/:id", getMeetingByIdController);
router.get("/name/:name", getMeetingByNameController);
router.get("/type/:type", getMeetingsByTypeController);
router.delete("/", deleteAllMeetingsController);
router.post("/", reserveRoomController);
router.delete("/:name", cancelMeetingController);

export default router;
