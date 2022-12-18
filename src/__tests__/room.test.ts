import supertest from "supertest";
import createServer from "../utils/server";
const roomPayload = {
	name: "E4004",
	capacity: 23,
	tools: {
		screen: true,
		whiteboard: true,
		webcam: true,
		pieuvre: true,
	},
};
const app = createServer();
jest.setTimeout(30000);
describe("Room", () => {
	afterAll(async () => {
		await supertest(app).delete("/room/name/E4004");
	});
	describe("get rooms", () => {
		it("should return 200 OK", async () => {
			const { statusCode, body } = await supertest(app).get("/room");
			expect(statusCode).toBe(200);
			expect(body).toHaveProperty("rooms");
		});
	});

	describe("create Room", () => {
		it("should be able to create a room", async () => {
			const { statusCode, body } = await supertest(app)
				.post("/room")
				.send(roomPayload);
			expect(statusCode).toBe(201);
			expect(body).toHaveProperty("room");
			expect(body.room).toHaveProperty("name", roomPayload.name);
			expect(body.room).toHaveProperty("capacity", roomPayload.capacity);
			expect(body.room).toHaveProperty("tools", roomPayload.tools);
			expect(body.room).toHaveProperty("meetings", []);
		});
		it("should not be able to create a room with the same name", async () => {
			const { statusCode, body } = await supertest(app)
				.post("/room")
				.send(roomPayload);
			expect(statusCode).toBe(500);
			expect(body).toHaveProperty(
				"error",
				"Room with name E4004 already exists"
			);
		});
		it("should not be able to create a room with missing name", async () => {
			const { statusCode, body } = await supertest(app)
				.post("/room")
				.send({ ...roomPayload, name: undefined });
			expect(statusCode).toBe(500);
			expect(body).toHaveProperty("error", "Field `name` is required.");
		});
		it("should not be able to create a room with invalid name", async () => {
			const { statusCode, body } = await supertest(app)
				.post("/room")
				.send({ ...roomPayload, name: "    " });
			expect(statusCode).toBe(500);
			expect(body).toHaveProperty("error", "Field `name` is required.");
		});
		it("should not be able to create a room with missing capacity", async () => {
			const { statusCode, body } = await supertest(app)
				.post("/room")
				.send({ ...roomPayload, capacity: undefined });
			expect(statusCode).toBe(500);
			expect(body).toHaveProperty("error", "Field `capacity` is required.");
		});
		it("should not be able to create a room with capacity below or equal 0", async () => {});
	});

	describe("get room by name", () => {
		it("should return 200 OK", async () => {
			const { statusCode, body } = await supertest(app).get("/room/name/E4004");
			expect(statusCode).toBe(200);
			expect(body).toHaveProperty("room");
			expect(body.room).toHaveProperty("name", roomPayload.name);
			expect(body.room).toHaveProperty("capacity", roomPayload.capacity);
			expect(body.room).toHaveProperty("tools", roomPayload.tools);
		});
		it("should return Not Found", async () => {
			const { statusCode, body } = await supertest(app).get("/room/name/E1005");
			expect(statusCode).toBe(500);
			expect(body).toHaveProperty("error", "Room with name 'E1005' not found");
		});
	});
	describe("delete room by name", () => {
		it("should return 200 OK", async () => {
			const { statusCode, body } = await supertest(app).delete(
				"/room/name/E4004"
			);
			expect(statusCode).toBe(200);
			expect(body).toHaveProperty("room");
			expect(body.room).toHaveProperty("name", roomPayload.name);
			expect(body.room).toHaveProperty("capacity", roomPayload.capacity);
			expect(body.room).toHaveProperty("tools", roomPayload.tools);
		});
		it("should return Not Found", async () => {
			const { statusCode, body } = await supertest(app).delete(
				"/room/name/E4004"
			);
			expect(statusCode).toBe(500);
			expect(body).toHaveProperty("error", "Room with name 'E4004' not found");
		});
	});
});
