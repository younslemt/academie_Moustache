# Académie Moustache — préparation au déploiement (PWA Chromebook)

Le jeu reste **un seul fichier** : `src/academie-moustache.html`.
C'est exactement le même fichier que celui de l'Artifact Claude partagé aux enfants. L'Artifact continue donc de fonctionner comme aujourd'hui.
Le build se contente de l'envelopper dans une vraie page web installable : manifest, icônes, favicon et service worker.

## 1. Framework

**Aucun framework.** Le jeu est en HTML, CSS et JavaScript « vanilla », dans un fichier unique.
Le build utilise un petit script Node, sans aucune dépendance. Il faut Node 18 ou plus récent.

## 2. Installation

```bash
npm install
```

Aucune dépendance n'est téléchargée. La commande sert seulement à préparer le projet.

## 3. Développement

```bash
npm run dev
```

Le jeu s'ouvre sur http://localhost:5173. Le site se reconstruit à chaque modification de `src/` ou `public/`.
Le serveur de développement applique les mêmes en-têtes de sécurité que Vercel.
`localhost` compte comme un contexte sécurisé : le service worker, le micro et la voix s'y comportent comme en HTTPS.

Pour tester le build final sans reconstruction automatique : `npm run preview`.

## 4. Build

```bash
npm run build
```

## 5. Dossier généré

`dist/` contient :

- `index.html` ;
- `manifest.webmanifest` ;
- `sw.js` ;
- `icons/` ;
- `videos/`.

## 6. Variables d'environnement

**Aucune.** Il n'y a ni backend, ni clé d'API, ni compte cloud.

## 7. Déployer sur Vercel

### Avec GitHub (recommandé)

1. Créez un dépôt GitHub, par exemple `academie-moustache`.
2. Envoyez-y le contenu de ce dossier :

   ```bash
   git init
   git add .
   git commit -m "Académie Moustache"
   git branch -M main
   git remote add origin https://github.com/VOTRE-COMPTE/academie-moustache.git
   git push -u origin main
   ```

3. Sur https://vercel.com, ouvrez **Add New… → Project**, puis importez le dépôt.
4. Vercel lit `vercel.json`. Vérifiez quand même ces réglages :
   - Framework Preset : **Other** ;
   - Install Command : `npm install` ;
   - Build Command : `npm run build` ;
   - Output Directory : `dist`.
5. Cliquez sur **Deploy**. Le site est en ligne en HTTPS sur `https://votre-projet.vercel.app`.
6. Pour utiliser votre propre domaine :
   - ouvrez **Settings → Domains**, ajoutez par exemple `academie.votresite.be` ;
   - créez chez votre registrar l'enregistrement DNS que Vercel indique (souvent un `CNAME` vers `cname.vercel-dns.com`).
   - Le certificat HTTPS est automatique.
7. Chaque `git push` sur `main` redéploie le site.

### Avec la ligne de commande (sans GitHub)

```bash
npm i -g vercel
vercel        # première fois : répondez aux questions (les réglages viennent de vercel.json)
vercel --prod
```

### Mettre à jour le jeu

1. Remplacez `src/academie-moustache.html` par la nouvelle version du fichier de l'Artifact.
2. Faites `git push`, ou `vercel --prod`.
3. Les Chromebooks reçoivent la nouvelle version à la prochaine ouverture du jeu.

## 8. Installer sur un Chromebook

1. Ouvrez le site dans Chrome.
2. Cliquez sur l'icône **Installer** dans la barre d'adresse.
   Sinon : menu **⋮ → Caster, enregistrer et partager → Installer la page en tant qu'application**.
3. « Académie Moustache » apparaît dans le lanceur et s'ouvre dans sa propre fenêtre, sans barre d'adresse.

## Ce qui a été vérifié automatiquement

Ces points ont été testés sur le build, servi avec les en-têtes de production :

- le manifest est valide : nom, `display: standalone`, couleurs, icônes 192, 512 et maskable ;
- l'application est installable : Chrome ne remonte aucune erreur ;
- le favicon est présent ;
- le service worker est actif, et le jeu se rouvre hors ligne après une première visite ;
- la synthèse vocale et l'API micro sont disponibles dans le contexte sécurisé ;
- les vidéos YouTube se chargent avec l'API officielle YouTube IFrame Player (mode de confidentialité renforcée), la fin est détectée et l'Académie reprend la main ; les vidéos hébergées se lisent avec les boutons du jeu ;
- aucun lien ni onglet ne mène vers YouTube ou YouTube Kids depuis l'espace enfant ;
- la Content-Security-Policy n'est jamais violée ;
- la progression est conservée après actualisation, sans nouvel onboarding ;
- l'affichage tient à 1366×768 et à 1280×800, sans défilement horizontal ;
- le code ne dépend pas de l'Artifact Claude.

## Limites spécifiques à Chromebook et Chrome

- **Les données restent sur l'appareil, par site et par profil Chrome.**
  - La progression de l'Artifact Claude (site claude.ai) ne passe pas toute seule sur votre site.
  - Pour la transférer : Espace Parents → Réglages → **Exporter la sauvegarde** dans l'Artifact, puis **Importer une sauvegarde** sur votre site.
- **Effacer les données de navigation** de Chrome, ou jouer en **mode Invité**, efface la progression.
  - Chrome peut aussi libérer de l'espace si le disque est presque plein.
  - Faites un export de temps en temps.
- **La voix** dépend des voix françaises installées sur le Chromebook : Paramètres → Accessibilité → Synthèse vocale.
  - Chrome ne parle et ne joue un son qu'après un premier toucher ou clic de l'enfant. Le jeu en tient déjà compte.
- **Les vidéos YouTube** demandent Internet.
  - Une vidéo dont l'auteur a interdit l'intégration ne se lira pas.
  - Sur un compte enfant **Family Link** ou un Chromebook géré par une école, YouTube intégré ou l'installation d'applications peuvent être bloqués par l'administrateur.
  - Seules les vidéos YouTube « classiques » (lien `youtube.com` ou `youtu.be`) peuvent être intégrées. Les liens `youtubekids.com` ne le peuvent pas.
- **Hors ligne**, le jeu fonctionne après une première visite. En revanche, YouTube et les vidéos hébergées demandent du réseau.
- **Le micro** n'est pas utilisé par le jeu actuel.
  - Le site est seulement prêt pour un usage futur : HTTPS et `Permissions-Policy: microphone=(self)`.
  - Chrome demandera alors l'autorisation une fois par site.
- **Les mises à jour** s'appliquent à la prochaine ouverture de l'application, pas pendant une partie.
- **Le fichier d'export** est enregistré dans le dossier Téléchargements du Chromebook.
- **Dans l'Artifact Claude :**
  - pas de service worker ni d'installation ;
  - le lecteur YouTube y est interdit : le jeu l'explique simplement à l'enfant, sans jamais l'envoyer vers YouTube ;
  - l'export passe par la fenêtre de confirmation de téléchargement de Claude.


## Vidéos YouTube : obligations et réglages à faire une fois

L'Académie est un site **destiné aux enfants** qui intègre des vidéos YouTube. Les règles de YouTube s'appliquent :

1. **Déclarer le site comme destiné aux enfants (« child-directed »).**
   - L'aide YouTube demande aux sites pour enfants de s'auto-désigner, même avec le mode de confidentialité renforcée.
   - Pour un site web : Google Search Console → valider la propriété du domaine Vercel → outil **« Tag for Child Directed Treatment »**.
   - Google ne diffuse alors plus de publicité personnalisée et coupe certaines fonctions du lecteur intégré.
   - Les règles de l'API YouTube (section III.J) demandent aussi de signaler à Google la nature « enfants » du client avec les outils fournis.
2. **Mode de confidentialité renforcée** : déjà actif (lecteur servi par `youtube-nocookie.com`). Les vues ne servent pas à personnaliser YouTube ni la publicité ailleurs.
3. **Statut « Made for Kids » de chaque vidéo** (section III.E.4.j) : il doit être vérifié avant d'intégrer une vidéo.
   - Lancez `YOUTUBE_API_KEY=votre_clé npm run verifier-videos` (clé gratuite de l'API YouTube Data, gardée sur votre ordinateur).
   - Sans clé, `npm run verifier-videos` vérifie déjà que chaque vidéo existe et accepte l'intégration.
   - Le jeu n'ajoute aucun suivi ni statistique de son côté.
4. **Ce que le jeu respecte** : pas de lecture automatique, un seul identifiant de vidéo (pas de playlist), rien n'est posé par-dessus le lecteur YouTube, les boutons obligatoires du lecteur restent visibles, lecteur d'au moins 200 × 200 pixels, pause quand l'onglet passe en arrière-plan.
5. **Ce qui ne peut pas être garanti** : YouTube ne permet plus de désactiver complètement les vidéos suggérées (`rel=0` les limite à la même chaîne). Le jeu ferme le lecteur dès la fin de la vidéo pour afficher son propre écran ; pendant la lecture, le lecteur YouTube affiche ses propres éléments (logo, titre, menu), qui peuvent mener vers YouTube si l'enfant les touche. Sur un Chromebook d'enfant, **Family Link** permet de bloquer `youtube.com` en navigation tout en laissant fonctionner le lecteur intégré du site — à vérifier sur votre configuration.
6. **Content-Security-Policy** : `script-src` autorise `https://www.youtube.com` et `https://s.ytimg.com` (API IFrame), `frame-src` uniquement `https://www.youtube-nocookie.com`.
