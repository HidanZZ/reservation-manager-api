import supertest from "supertest";
import createServer from "../utils/server";
const app = createServer();
jest.setTimeout(30000);
const testMeeting = {
	attendees: 8,
	type: "VC",
	startTime: "2023-01-02T15:00:00", // 15:00
	endTime: "2023-01-02T16:00:00", // 16:00
	name: "RéunionTest",
};
const meeting1 = {
	attendees: 8,
	type: "VC",
	startTime: "2023-01-02T09:00:00", // 09:00
	endTime: "2023-01-02T10:00:00", // 10:00
	name: "Réunion1",
};
const expectedMeeting1 = {
	room: {
		tools: {
			screen: true,
			whiteboard: false,
			webcam: true,
			pieuvre: true,
		},
		name: "E3001",
		capacity: 13,
	},
};
describe("Meeting", () => {
	beforeAll(async () => {
		await supertest(app).post("/meeting").send(testMeeting);
	});
	afterAll(async () => {
		await supertest(app).delete("/meeting/" + testMeeting.name);
	});
	describe("get meetings", () => {
		it("should return 200 OK", async () => {
			const { statusCode, body } = await supertest(app).get("/meeting");
			expect(statusCode).toBe(200);
			expect(body).toHaveProperty("meetings");
		});
	});
	describe("get meeting by name", () => {
		it("should return 200 OK", async () => {
			const { statusCode, body } = await supertest(app).get(
				"/meeting/name/" + testMeeting.name
			);
			expect(statusCode).toBe(200);
			expect(body).toHaveProperty("meeting");
			expect(body.meeting).toHaveProperty("name", testMeeting.name);
			expect(body.meeting).toHaveProperty("attendees", testMeeting.attendees);
			expect(body.meeting).toHaveProperty("type", testMeeting.type);
		});
		it("should return not Found", async () => {
			const randomName = "Réunion141452456";
			const { statusCode, body } = await supertest(app).get(
				"/meeting/name/" + randomName
			);
			expect(statusCode).toBe(500);
			expect(body).toHaveProperty(
				"error",
				`Meeting with name '${randomName}' not found`
			);
		});
	});
	describe("get meetings by type", () => {
		it("should return 200 OK", async () => {
			const { statusCode, body } = await supertest(app).get("/meeting/type/VC");
			expect(statusCode).toBe(200);
			expect(body).toHaveProperty("meetings");
		});
	});

	describe("reserve meeting", () => {
		it("should return the room", async () => {
			const { statusCode, body } = await supertest(app)
				.post("/meeting")
				.send(meeting1);

			expect(statusCode).toBe(201);

			expect(body).toHaveProperty("room");
			expect(body.room).toHaveProperty("name", expectedMeeting1.room.name);
			expect(body.room).toHaveProperty(
				"capacity",
				expectedMeeting1.room.capacity
			);
			expect(body.room).toHaveProperty("tools", expectedMeeting1.room.tools);
		});
		it("should not be able to reserve a meeting with missing attendees", async () => {
			const { statusCode, body } = await supertest(app)
				.post("/meeting")
				.send({ ...testMeeting, attendees: undefined });
			expect(statusCode).toBe(500);
			expect(body).toHaveProperty("error", "Field `attendees` is required.");
		});
		it("should not be able to reserve a meeting with wrong type", async () => {
			const { statusCode, body } = await supertest(app)
				.post("/meeting")
				.send({ ...testMeeting, type: "VCC" });
			expect(statusCode).toBe(500);
		});
		it("should not be able to reserve a meeting with existing name", async () => {
			const { statusCode, body } = await supertest(app)
				.post("/meeting")
				.send({ ...testMeeting, name: "Réunion1" });
			expect(statusCode).toBe(500);
			expect(body).toHaveProperty(
				"error",
				"Meeting with name 'Réunion1' already exists"
			);
		});
		it("should not be able to reserve a meeting already reserved", async () => {
			const { statusCode, body } = await supertest(app)
				.post("/meeting")
				.send({
					...testMeeting,
					name: "Réunion2",
				});
			expect(statusCode).toBe(500);
			expect(body).toHaveProperty(
				"error",
				"No rooms available for meeting 'Réunion2'"
			);
		});
		it("should not be able to reserve a meeting not respecting the one hour gap", async () => {
			const { statusCode, body } = await supertest(app)
				.post("/meeting")
				.send({
					...testMeeting,
					name: "Réunion2",
					startTime: "2023-01-02T16:00:00",
					endTime: "2023-01-02T17:00:00",
				});
			expect(statusCode).toBe(500);
			expect(body).toHaveProperty(
				"error",
				"No rooms available for meeting 'Réunion2'"
			);
		});
		it("should not be able to reserve a meeting where time is in the past", async () => {
			const { statusCode, body } = await supertest(app)
				.post("/meeting")
				.send({
					...testMeeting,
					name: "Réunion2",
					startTime: "2022-11-15T16:00:00",
					endTime: "2022-11-15T17:00:00",
				});
			expect(statusCode).toBe(500);
			expect(body).toHaveProperty("error", "Start time must be in the future");
		});
		it("should not be able to reserve a meeting where time slot is bigger than 1 hour", async () => {
			const { statusCode, body } = await supertest(app)
				.post("/meeting")
				.send({
					...testMeeting,
					name: "Réunion2",
					startTime: "2023-01-02T17:00:00",
					endTime: "2023-01-02T20:00:00",
				});
			expect(statusCode).toBe(500);
			expect(body).toHaveProperty(
				"error",
				"Start time and end time must be one hour apart"
			);
		});
		it("should not be able to reserve a meeting where day is a weekend", async () => {
			const { statusCode, body } = await supertest(app)
				.post("/meeting")
				.send({
					...testMeeting,
					name: "Réunion2",
					startTime: "2023-01-01T16:00:00",
					endTime: "2023-01-01T17:00:00",
				});
			expect(statusCode).toBe(500);
			expect(body).toHaveProperty("error", "Day must be a weekday");
		});
	});
	describe("cancel meeting", () => {
		it("should cancel the meeting", async () => {
			const { statusCode, body } = await supertest(app).delete(
				"/meeting/" + meeting1.name
			);
			expect(statusCode).toBe(200);
			expect(body).toHaveProperty("meeting");
			expect(body.meeting).toHaveProperty("name", meeting1.name);
			expect(body.meeting).toHaveProperty("attendees", meeting1.attendees);
		});
		it("should not be able to cancel a meeting that does not exist", async () => {
			const { statusCode, body } = await supertest(app).delete(
				"/meeting/" + "RéunionNotExisting"
			);
			expect(statusCode).toBe(500);
			expect(body).toHaveProperty(
				"error",
				"Meeting with name 'RéunionNotExisting' not found"
			);
		});
	});
	describe("delete all meetings", () => {
		it("should return 200 OK", async () => {
			const { statusCode, body } = await supertest(app).delete("/meeting");
			expect(statusCode).toBe(200);
			expect(body).toHaveProperty("meetings", true);
		});
	});
});
