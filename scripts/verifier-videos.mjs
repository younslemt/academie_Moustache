// Vérifie les vidéos YouTube du catalogue du Cinéma de Moustache (à lancer par un adulte, pas par le jeu).
//   npm run verifier-videos                      → existence + intégration autorisée (oEmbed public, sans clé)
//   YOUTUBE_API_KEY=xxx npm run verifier-videos  → en plus : statut « Made for Kids », public/privé, intégrable
// La clé de l'API YouTube Data (gratuite) reste sur votre ordinateur : elle n'est jamais mise dans le jeu.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const html = readFileSync(join(root, "src", "academie-moustache.html"), "utf8");
const videos = [...html.matchAll(/YT\("([A-Za-z0-9_-]{11})",\s*\{id:"([^"]+)"[^}]*?titre:"([^"]+)"/g)].map(m => ({yt: m[1], id: m[2], titre: m[3]}));
if (!videos.length) { console.error("Aucune vidéo trouvée dans le catalogue."); process.exit(1); }
const key = process.env.YOUTUBE_API_KEY;
let statuts = {};
if (key) {
  const ids = videos.map(v => v.yt);
  for (let i = 0; i < ids.length; i += 50) {
    const r = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=status&id=${ids.slice(i, i + 50).join(",")}&key=${key}`);
    const j = await r.json(); if (j.error) { console.error("API YouTube Data :", j.error.message); process.exit(1); }
    for (const it of j.items || []) statuts[it.id] = it.status;
  }
}
let ko = 0;
for (const v of videos) {
  const r = await fetch(`https://www.youtube.com/oembed?format=json&url=${encodeURIComponent("https://www.youtube.com/watch?v=" + v.yt)}`);
  const etat = r.status === 200 ? "✅ disponible et intégrable" : r.status === 401 ? "⛔ intégration refusée" : r.status === 404 ? "⛔ introuvable / privée" : "⚠️ réponse " + r.status;
  const s = statuts[v.yt];
  const mfk = key ? (s ? (s.madeForKids ? "Made for Kids : oui" : "Made for Kids : non") + (s.embeddable === false ? " · non intégrable" : "") + (s.privacyStatus !== "public" ? " · " + s.privacyStatus : "") : "absente de l'API") : "";
  if (r.status !== 200 || (key && (!s || s.embeddable === false))) ko++;
  console.log(`${etat.padEnd(30)} ${v.id.padEnd(14)} ${v.titre}${mfk ? "  —  " + mfk : ""}`);
}
console.log(ko ? `\n${ko} vidéo(s) à retirer ou remplacer dans le catalogue.` : "\nToutes les vidéos du catalogue sont disponibles.");
process.exit(ko ? 1 : 0);
