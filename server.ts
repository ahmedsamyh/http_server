import * as http from "node:http";
import process from "node:process";

const PORT: number = 6969;
const host: string = "127.0.0.1";

const options = {};

const server = http.createServer(options, (req, res) => {
	console.log(`[${req.method}] ${req.url}`);
	//console.log(`Got request from ${req.headers.host} accepting only: ${JSON.stringify(req.headers.accept)}`);

	if (
		req.headers.accept &&
		req.headers.accept.search("text/html") != -1
	) {
		if (typeof req.url === "string") {
			const url = new URL(
				`http://${
					process.env.HOST ?? "localhost"
				}${req.url}`,
			);
			const pathname = url.pathname;
			console.log(`Fetching ${pathname}`);

			if (pathname == "/") {
				res.writeHead(200, {
					"content-type": "text/html",
				});
				res.write("<h1>Hello from HTTP Server</h1>");
				res.end();
			}
		}
	}
});

console.log(`Created server!`);

server.listen(PORT, host);
console.log(`Started listening on http://${host}:${PORT}`);
