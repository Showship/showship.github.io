#!/usr/bin/env node
/**
 * Local preview: builds the site, serves dist/ and rebuilds when src/ changes.
 *   node scripts/serve.mjs [port]      (default 8080)
 */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIST = path.join(ROOT, "dist");
const port = Number(process.argv[2]) || 8080;
const TYPES = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".webp": "image/webp", ".ttf": "font/ttf", ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation", ".xml": "application/xml", ".txt": "text/plain" };

const build = () => {
  const r = spawnSync(process.execPath, [path.join(ROOT, "build.mjs")], { cwd: ROOT, stdio: "inherit" });
  if (r.status !== 0) console.error("Build failed. Fix the error above; the server keeps serving the last good build.");
};
build();

let timer;
for (const dir of ["src", "build.mjs", "site.config.json"]) {
  try { fs.watch(path.join(ROOT, dir), { recursive: true }, () => { clearTimeout(timer); timer = setTimeout(build, 150); }); } catch { /* recursive watch is not available on this platform: restart to rebuild */ }
}

http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
  let file = path.join(DIST, p);
  if (!file.startsWith(DIST)) { res.writeHead(403).end(); return; }
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, "index.html");
  if (!fs.existsSync(file)) {
    res.writeHead(404, { "Content-Type": TYPES[".html"] });
    res.end(fs.existsSync(path.join(DIST, "404.html")) ? fs.readFileSync(path.join(DIST, "404.html")) : "Not found");
    return;
  }
  const type = TYPES[path.extname(file)] || "application/octet-stream";
  const size = fs.statSync(file).size;
  // Range requests, like GitHub Pages: browsers need them to seek in video.
  const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range || "");
  if (range && (range[1] || range[2])) {
    const start = range[1] ? Number(range[1]) : size - Number(range[2]);
    const end = range[1] && range[2] ? Math.min(Number(range[2]), size - 1) : size - 1;
    if (start > end || start >= size) { res.writeHead(416, { "Content-Range": `bytes */${size}` }).end(); return; }
    res.writeHead(206, { "Content-Type": type, "Content-Range": `bytes ${start}-${end}/${size}`, "Content-Length": end - start + 1, "Accept-Ranges": "bytes", "Cache-Control": "no-store" });
    fs.createReadStream(file, { start, end }).pipe(res);
    return;
  }
  res.writeHead(200, { "Content-Type": type, "Content-Length": size, "Accept-Ranges": "bytes", "Cache-Control": "no-store" });
  fs.createReadStream(file).pipe(res);
}).listen(port, () => console.log(`Serving dist/ at http://localhost:${port}/`));
