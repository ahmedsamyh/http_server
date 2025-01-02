import { constants } from "node:os";
import * as http from "node:http";
import process from "node:process";
import fs from "node:fs";

const PORT: number = 6969;
const host: string = "127.0.0.1";

const options = {};
const ROOT_DEFAULTS = ["index.html"];

const server = http.createServer(options, (req, res) => {
  console.log(`[${req.method}] ${req.url}`);
  //console.log(`Got request from ${req.headers.host} accepting only: ${JSON.stringify(req.headers.accept)}`);
  if (
    req.headers.accept &&
    req.headers.accept.search("text/html") != -1
  ) {
    if (typeof req.url === "string") {
      const url = new URL(
        `http://${process.env.HOST ?? "localhost"}${req.url}`,
      );
      const pathname = url.pathname;
      console.log(`Fetching ${pathname}`);

      if (pathname == "/") {
        //function stat(path: fs.PathLike, callback: (err: NodeJS.ErrnoException | null, stats: fs.Stats) => void): void (+3 overloads)
        for (const file of ROOT_DEFAULTS) {
          console.log(`Checking if ${file} exists...`);
          fs.stat(file, (err, stats) => {
            if (err && err.errno === constants.errno.ENOENT) {
              console.error(`File ${file} doesn't exist; Skipping...`);
            } else {
              console.log(stats);
            }
          });
        }
        //res.writeHead(200, {
        //	"content-type": "text/html",
        //});
        //res.write("<h1>Hello from HTTP Server</h1>");
        //res.end();
      }
    }
  }
});

console.log(`Created server!`);

server.listen(PORT, host);
console.log(`Started listening on http://${host}:${PORT}`);
