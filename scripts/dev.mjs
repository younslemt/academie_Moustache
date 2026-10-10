// Serveur de développement : reconstruit dist/ à chaque modification et le sert sur http://localhost:5173
// (localhost compte comme « contexte sécurisé » : service worker, micro et synthèse vocale s'y comportent comme en HTTPS).
// Les en-têtes de vercel.json sont appliqués pour tester dans les mêmes conditions que la production.
import { createServer } from "node:http";
import { readFileSync, existsSync, statSync, watch } from "node:fs";
import { extname, join, normalize, dirname } from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const port = Number(process.env.PORT) || 5173;
const build = () => { try { execFileSync(process.execPath, [join(root, "scripts/build.mjs")], { stdio: "inherit" }); } catch (e) { console.error("❌ Build en erreur"); } };
build();
if (!process.argv.includes("--no-watch")) {
  let t = null;
  for (const d of ["src", "public"]) watch(join(root, d), { recursive: true }, () => { clearTimeout(t); t = setTimeout(build, 200); });
}
const vercel = JSON.parse(readFileSync(join(root, "vercel.json"), "utf8"));
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".webmanifest": "application/manifest+json", ".json": "application/json", ".png": "image/png", ".svg": "image/svg+xml", ".jpg": "image/jpeg", ".mp4": "video/mp4", ".webm": "video/webm", ".ico": "image/x-icon", ".css": "text/css" };
const matches = (src, path) => new RegExp("^" + src.replace(/\(\.\*\)/g, ".*").replace(/\//g, "\\/") + "$").test(path);
createServer((req, res) => {
  let path = decodeURIComponent(new URL(req.url, "http://x").pathname);
  if (path.endsWith("/")) path += "index.html";
  let file = normalize(join(dist, path));
  if (!file.startsWith(dist)) { res.writeHead(403); return res.end(); }
  if (!existsSync(file) || statSync(file).isDirectory()) file = join(dist, "index.html");
  for (const h of vercel.headers || []) if (matches(h.source, path)) for (const { key, value } of h.headers) res.setHeader(key, value);
  res.setHeader("Content-Type", TYPES[extname(file)] || "application/octet-stream");
  res.end(readFileSync(file));
}).listen(port, () => console.log(`🐱 Académie Moustache : http://localhost:${port}`));
