import * as http from "node:http";
import process from "node:process";
import fs from "node:fs";

const PORT: number = 6969;
const host: string = "127.0.0.1";

const options = {};
const ROOT_DEFAULTS = ["index.html"];
const cwd = "./";


function respondWithFileContent(filename: string, res: http.ServerResponse<http.IncomingMessage>) {
  return new Promise((resolve, reject) => {
    fs.readFile(filename, (err, data) => {
      if (err) {
        console.error(`[ERROR]: ${err}`);
        reject(false);
      } else {
        //console.log(`Read ${data.length} Bytes from ${filename}`);
        res.writeHead(200, { "content-type": "text/html", "content-length": data.length });
        res.write(data);
        res.end();
        resolve(true);
      }
    });
  });
};

const server = http.createServer(options, (req, res) => {
  console.log(`[${req.method}] ${req.url}`);
  //console.log(`Got request from ${req.headers.host} accepting only: ${JSON.stringify(req.headers.accept)}`);
  if (req.headers.accept &&
    req.headers.accept.search("text/html") != -1) {
    if (typeof req.url === "string") {
      const url = new URL(
        `http://${process.env.HOST ?? "localhost"}${req.url}`,
      );
      const pathname = url.pathname;
      console.log(`Fetching ${pathname}`);

      if (pathname == "/") {
        //function stat(path: fs.PathLike, callback: (err: NodeJS.ErrnoException | null, stats: fs.Stats) => void): void (+3 overloads)

        for (const file of ROOT_DEFAULTS) {
          let full_path = cwd + file;
          //console.log(`Checking if ${full_path} exists...`);
          fs.stat(full_path, (err, _stats) => {
            if (err && err.code === "ENOENT") {
              console.error(`full_path ${full_path} doesn't exist; Skipping...`);
            } else {
              //console.log("OK");
              let root_file = full_path;
              respondWithFileContent(root_file, res);
              return;
            }
          });
        }
      } else {
        respondWithFileContent(cwd + pathname.slice(1), res).catch((_err) => {
          // TODO: Maybe respond with a custom 404 page?
          res.writeHead(404);
          res.end();
        });
      }
    }
  }
});

console.log(`Created server!`);

server.listen(PORT, host);
console.log(`Started listening on http://${host}:${PORT}`);
