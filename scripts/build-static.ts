/**
 * EXPORT STATIQUE — fige le site pour GitHub Pages.
 *
 * Fresh est un serveur ; GitHub Pages ne sert que des fichiers. Comme toutes
 * les routes sont énumérables (4 pages + 1 labo par arme) et que le seul JS
 * client est l'îlot, on pré-rend chaque route en HTML via le handler de
 * production, puis on copie les assets buildés.
 *
 *   deno task build
 *   BASE_PATH=/bf6-lab deno run -A scripts/build-static.ts
 *
 * BASE_PATH : sous-chemin de déploiement (Pages projet). Les URL internes
 * absolues (« /labo/… ») sont préfixées dans le HTML **et** dans le JS de
 * l'îlot — les liens de l'arsenal sont régénérés côté client par Preact.
 */

import { WEAPON_IDS } from "../data/weapons.ts";

const BASE = Deno.env.get("BASE_PATH") ?? "";
const OUT = new URL("../dist/", import.meta.url);

// Handler de production : _fresh/server.js câble le snapshot de build sur l'app.
// Import résolu à l'exécution (URL non littérale) : le fichier n'existe
// qu'après `deno task build`, et `deno check` ne doit pas exiger sa présence.
const serverModule = new URL("../_fresh/server.js", import.meta.url).href;
const server = (await import(serverModule)).default as {
  fetch: (req: Request) => Promise<Response>;
};

const PAGES = ["/", "/armes", "/vehicules", "/methode", "/labo", ...WEAPON_IDS.map((id) => `/labo/${id}`)];

function rewriteHtml(html: string): string {
  if (!BASE) return html;
  return html
    .replace(/(href|src)="\//g, `$1="${BASE}/`)
    .replaceAll('"/_fresh/', `"${BASE}/_fresh/`);
}

/** Réécrit les routes internes générées côté client (chips de l'arsenal, lien méthode). */
function rewriteJs(js: string): string {
  if (!BASE) return js;
  return js
    .replaceAll("/labo/", `${BASE}/labo/`)
    .replaceAll('"/methode"', `"${BASE}/methode"`);
}

async function writePage(path: string, body: string) {
  const rel = path === "/" ? "index.html" : `${path.slice(1)}/index.html`;
  const dest = new URL(rel, OUT);
  await Deno.mkdir(new URL(".", dest), { recursive: true });
  await Deno.writeTextFile(dest, body);
}

async function copyDir(src: URL, destRoot: URL, sub = "") {
  for await (const entry of Deno.readDir(new URL(sub || ".", src))) {
    const from = new URL(`${sub}${entry.name}`, src);
    const to = new URL(`${sub}${entry.name}`, destRoot);
    if (entry.isDirectory) {
      await Deno.mkdir(to, { recursive: true });
      await copyDir(src, destRoot, `${sub}${entry.name}/`);
    } else if (entry.name.endsWith(".js")) {
      await Deno.writeTextFile(to, rewriteJs(await Deno.readTextFile(from)));
    } else {
      await Deno.copyFile(from, to);
    }
  }
}

// dist/ repart de zéro à chaque export.
try {
  await Deno.remove(OUT, { recursive: true });
} catch {
  // absent au premier run
}
await Deno.mkdir(OUT, { recursive: true });

let rendered = 0;
for (const path of PAGES) {
  const res = await server.fetch(new Request(`http://localhost${path}`));
  if (res.status >= 300 && res.status < 400) {
    // ex. /labo → première arme : page de redirection côté client.
    const loc = `${BASE}${res.headers.get("location") ?? "/"}`;
    await res.body?.cancel();
    await writePage(
      path,
      `<!doctype html><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=${loc}">` +
        `<a href="${loc}">Redirection…</a>`,
    );
    continue;
  }
  if (!res.ok) throw new Error(`${path} : HTTP ${res.status}`);
  await writePage(path, rewriteHtml(await res.text()));
  rendered++;
}

// Assets : sortie de build (JS de l'îlot, static/ copié par Fresh)…
await copyDir(new URL("../_fresh/static/", import.meta.url), OUT);
// …plus static/ source, au cas où le build daterait (favicon, CSS).
await copyDir(new URL("../static/", import.meta.url), OUT);

// GitHub Pages : pas de Jekyll (sinon _fresh/ serait ignoré), 404 → accueil.
await Deno.writeTextFile(new URL(".nojekyll", OUT), "");
await Deno.writeTextFile(
  new URL("404.html", OUT),
  `<!doctype html><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=${BASE}/">` +
    `<a href="${BASE}/">BF6 LAB</a>`,
);

console.log(`OK — ${rendered} pages + assets → dist/ (BASE_PATH="${BASE}")`);
