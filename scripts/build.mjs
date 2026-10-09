// Build de production : aucun outil externe, seulement Node (>= 18).
// src/academie-moustache.html est EXACTEMENT le fichier publié dans l'Artifact Claude.
// Le build l'enveloppe dans une vraie page HTML (manifest, icônes, service worker) et copie public/ dans dist/.
import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = readFileSync(join(root, "src/academie-moustache.html"), "utf8");
const cut = src.indexOf("</style>");
if (cut < 0 || !src.includes("<title>Académie Moustache</title>")) throw new Error("src/academie-moustache.html ne ressemble pas au fichier du jeu");
const headPart = src.slice(0, cut + "</style>".length);
const bodyPart = src.slice(cut + "</style>".length);

const head = `<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="description" content="Le jeu éducatif de Moustache le chat : apprendre en jouant, dans une académie douce et kawaii.">
<meta name="theme-color" content="#8fd0ff">
<meta name="color-scheme" content="light">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Académie Moustache">
<link rel="manifest" href="/manifest.webmanifest">
<link rel="icon" href="/icons/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/icons/favicon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png">
<style>html,body{margin:0}</style>`;

// le service worker n'est activé que sur un vrai site (HTTPS ou localhost), jamais dans un cadre Claude
const swReg = `<script>
if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost") && !window.claude && window.top === window.self) {
  window.addEventListener("load", () => navigator.serviceWorker.register("/sw.js").catch(() => {}));
}
</script>`;

const html = `<!doctype html>
<html lang="fr">
<head>
${head}
${headPart}
</head>
<body>
<noscript>Académie Moustache a besoin de JavaScript pour fonctionner.</noscript>
${bodyPart}
${swReg}
</body>
</html>
`;
const version = createHash("sha256").update(html).digest("hex").slice(0, 12);
const dist = join(root, "dist");
if (existsSync(dist)) rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });
cpSync(join(root, "public"), dist, { recursive: true });
writeFileSync(join(dist, "index.html"), html);
writeFileSync(join(dist, "sw.js"), readFileSync(join(root, "public/sw.js"), "utf8").replace("__VERSION__", version));
console.log(`✅ Build terminé → dist/ (version ${version}, ${(html.length / 1024).toFixed(0)} Ko)`);
