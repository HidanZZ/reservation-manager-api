import express from "express";
import mongoose from "mongoose";
import RoomRoute from "../route/Room.route";
import MeetingRoute from "../route/Meeting.route";
import * as dotenv from "dotenv";
dotenv.config();
function createServer() {
	const app = express();
	const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/test";

	mongoose.connect(MONGO_URI, {});

	app.use(express.json());
	app.use("/room", RoomRoute);
	app.use("/meeting", MeetingRoute);
	return app;
}
export default createServer;
