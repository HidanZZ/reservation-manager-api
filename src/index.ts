import createServer from "./utils/server";

const app = createServer();
app.listen(3000, () => {
	console.log("Listening on port 3000!");
});

export default app;
