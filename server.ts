import * as http from "node:http";
import process from "node:process";
import fs from "node:fs";

const PORT: number = 6969;
const host: string = "127.0.0.1";

const options = {};
// TODO: Use a hashmap with the name as the key and the extension as the key.
const ROOT_DEFAULTS = ["index.html"];
const cwd = "./";

function respondWithContent(statuscode: number, data: Uint8Array | string, content_type: string, res: http.ServerResponse<http.IncomingMessage>) {
  res.writeHead(statuscode, { "content-type": content_type, "content-length": data.length });
  res.write(data);
  res.end();
}

function respondWithFileContent(filename: string, res: http.ServerResponse<http.IncomingMessage>) {
  return new Promise((resolve, reject) => {
    fs.readFile(filename, (err, data) => {
      if (err) {
        console.error(`[ERROR]: ${err}`);
        reject(false);
      } else {
        //console.log(`Read ${data.length} Bytes from ${filename}`);
        respondWithContent(200, data.toString(), "text/html", res);
        resolve(true);
        console.log(`[GET] Success '${filename}'`);
      }
    });
  });
}

function respondWith404Page(path: string, res: http.ServerResponse<http.IncomingMessage>) {
  respondWithContent(404, `
                      <!DOCTYPE html>\n
                      <html>\n
                        <head>\n
                          <title>404 Not Found</title>\n
                          <style>\n
                            h1, p, footer {\n
                              width: 100%;\n
                              margin: 0.5em;\n
                              text-align: center;\n
                            }\n
                          </style>\n
                        </head>\n
                        <body>\n
                          <h1><b>404 Not Found</b></h1>\n
                          <p>Failed to GET ${path}</p>\n
                          <hr>\n
                          <footer><small>momo-server 0.1a</small></footer>\n
                        </body>\n
                      </html>\n
                    `,
    "text/html",
    res,
  );
}

const server = http.createServer(options, (req, res) => {
  console.log(`[${req.method}] ${req.url}`);
  //console.log(`Got request from ${req.headers.host} accepting only: ${JSON.stringify(req.headers.accept)}`);
  if (typeof req.url === "string") {
    const url = new URL(
      `http://${process.env.HOST ?? "localhost"}${req.url}`,
    );
    const pathname = url.pathname;
    //console.log(`Fetching ${pathname}`);

    // TODO: Handle favicon GET
    if (pathname == "/") {
      //function stat(path: fs.PathLike, callback: (err: NodeJS.ErrnoException | null, stats: fs.Stats) => void): void (+3 overloads)

      for (const file of ROOT_DEFAULTS) {
        const full_path = cwd + file;
        //console.log(`Checking if ${full_path} exists...`);
        fs.stat(full_path, (err, _stats) => {
          if (err && err.code === "ENOENT") {
            console.error(`full_path ${full_path} doesn't exist; Skipping...`);
          } else {
            //console.log("OK");
            const root_file = full_path;
            respondWithFileContent(root_file, res);
            return;
          }
        });
      }
    } else {
      const filepath = pathname.slice(1);
      respondWithFileContent(cwd + filepath, res).catch((_err) => {
        respondWith404Page(filepath, res);
      });
    }
  }
});

console.log(`Created server!`);

server.listen(PORT, host);
console.log(`Started listening on http://${host}:${PORT}`);
