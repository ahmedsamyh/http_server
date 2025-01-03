import * as http from "node:http";
import process from "node:process";
import fs from "node:fs";

const PORT: number = 6969;
const host: string = "127.0.0.1";

const options = {};
const COMMON_INDEX_FILES = ["index.html"];
const cwd = "./";

function respondWithContent(
  statuscode: number,
  data: Uint8Array | string,
  content_type: string,
  res: http.ServerResponse<http.IncomingMessage>,
) {
  res.writeHead(statuscode, {
    "content-type": content_type,
    "content-length": data.length,
  });
  res.write(data);
  res.end();
}

function determineContentType(filename: string): string {
  let type = "text";
  let subtype = "plain";

  if (filename.includes(".")) {
    let ext = filename.substring(filename.lastIndexOf("."));
    if (ext.startsWith(".")) ext = ext.slice(1);
    // NOTE: We assume the type is `text`.

    // Determine type
    switch (ext) {
      case "png":
      case "jpeg":
      case "icon":
      case "ico":
      case "jpg":
      case "avif":
      case "svg":
      case "jfif":
      case "pjpeg":
      case "pjp":
      case "tiff":
        type = "image";
        break;
    }

    // Determine subtype
    switch (ext) {
      case "png":
      case "avif":
      case "svg":
      case "tiff":
      case "html":
      case "css":
      case "csv":
      case "xml":
        subtype = ext;
        break;
      case "js":
        subtype = "javascript";
        break;
      case "jpeg":
      case "jpg":
      case "jfif":
      case "pjpeg":
      case "pjp":
        subtype = "jpeg";
        break;
      case "icon":
      case "ico":
        subtype = "icon";
        break;
    }
  }
  return `${type}/${subtype}`;
}

function respondWithFileContent(
  filename: string,
  res: http.ServerResponse<http.IncomingMessage>,
) {
  return new Promise((resolve, reject) => {
    fs.readFile(filename, (err, data) => {
      if (err) {
        console.error(`[ERROR]: ${err}`);
        reject(false);
      } else {
        // console.log(`Read ${data.length} Bytes from ${filename}`);
        const content_type = determineContentType(filename);

        console.log(`${content_type} -> ${data.length}`);
        respondWithContent(200, data.toString(), content_type, res);
        resolve(true);
        console.log(`[GET] Success '${filename}'`);
      }
    });
  });
}

function respondWith404Page(
  path: string,
  res: http.ServerResponse<http.IncomingMessage>,
) {
  respondWithContent(
    404,
    `
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

    if (pathname == "/") {
      let root_file_found = false;
      for (const filename of COMMON_INDEX_FILES) {
        if (!filename.includes(".")) {
          throw new Error(`Invalid index file ${filename}`);
        }
        const full_path = cwd + filename;
        //console.log(`Checking if ${full_path} exists...`);
        try {
          fs.statSync(full_path);
          const root_file = full_path;
          respondWithFileContent(root_file, res);
          root_file_found = true;
          break;
        } catch (_e) {
          console.error(`full_path ${full_path} doesn't exist; Skipping...`);
          continue;
        }
      }
      if (!root_file_found) {
        respondWith404Page(pathname, res);
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
