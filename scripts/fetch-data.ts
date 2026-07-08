/**
 * PIPELINE DE DONNÉES — BF6-Weapon-Analyzer → data/generated/
 *
 *   deno task data              # patch par défaut (voir DEFAULT_PATCH)
 *   deno task data -- 1.3.4.0   # étiqueter un nouveau patch
 *
 * Ce que fait le script :
 *   1. récupère weapons.json + balance_tables.json depuis la branche main de
 *      https://github.com/raymdl/BF6-Weapon-Analyzer (main = patch courant) ;
 *   2. projette chaque arme sur le type du domaine (data/types.ts) — on
 *      n'extrait que ce que le moteur sait modéliser : identité, cadence,
 *      chargeur, vélocité, multiplicateur tête, paliers de dégâts ;
 *   3. écrit data/generated/weapons.gen.ts (snapshot versionné, commité).
 *
 * Honnêteté : recul, dispersion et accessoires existent dans la source mais
 * ne sont PAS modélisés en v0.1 — on ne les embarque pas plutôt que de faire
 * semblant. À brancher dans lib/engine.ts avant de les exposer.
 */

import type { DmgStep, FireMode, Weapon, WeaponClass } from "../data/types.ts";

const RAW = "https://raw.githubusercontent.com/raymdl/BF6-Weapon-Analyzer/main/data";
const DEFAULT_PATCH = "1.3.3.0";

const OUT = new URL("../data/generated/weapons.gen.ts", import.meta.url);

// Types bruts (partiels) de la source — juste ce qu'on consomme.
interface RawWeapon {
  id: string;
  name: string;
  cls: WeaponClass;
  cal?: string | null;
  rpm?: number | null;
  fireMode: FireMode;
  burstRounds?: number | null;
  burstRpm?: number | null;
  burstBurstsPerMinute?: number | null;
  mag: number;
  tacRld?: number | null;
  emptyRld?: number | null;
  deployT?: number | null;
  adsTime?: number | null;
  bulletVel?: number | null;
  pellets?: number | null;
  dmg: DmgStep[];
}
interface RawBalance {
  BASE_HS_MULT?: Record<string, number>;
}

async function get<T>(name: string): Promise<T> {
  const res = await fetch(`${RAW}/${name}.json`);
  if (!res.ok) throw new Error(`${name}.json : HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

const patch = Deno.args[0] ?? DEFAULT_PATCH;
const [weapons, balance] = await Promise.all([
  get<RawWeapon[]>("weapons"),
  get<RawBalance>("balance_tables"),
]);

// Multiplicateur tête : override par arme (DMR 1,5 ; snipers 1,75 ; pompes 1,0),
// sinon 1,34 — même convention que le simulateur source.
const HS = balance.BASE_HS_MULT ?? {};

// La source encode « inconnu » avec null (ex. cadence des pompes) ; on projette
// vers undefined pour que JSON.stringify omette le champ (type optionnel propre).
const num = (v: number | null | undefined): number | undefined => v ?? undefined;

const slim: Weapon[] = weapons.map((w) => ({
  id: w.id,
  name: w.name,
  cls: w.cls,
  cal: w.cal ?? undefined,
  rpm: num(w.rpm),
  fireMode: w.fireMode,
  burstRounds: num(w.burstRounds),
  burstRpm: num(w.burstRpm),
  burstBurstsPerMinute: num(w.burstBurstsPerMinute),
  mag: w.mag,
  tacRld: num(w.tacRld),
  emptyRld: num(w.emptyRld),
  deployT: num(w.deployT),
  adsTime: num(w.adsTime),
  bulletVel: num(w.bulletVel),
  pellets: num(w.pellets),
  hsMult: HS[w.id] ?? 1.34,
  dmg: w.dmg,
}));

const today = new Date().toISOString().slice(0, 10);
const header = `// ⚠ FICHIER GÉNÉRÉ — ne pas éditer à la main.
// Source : BF6-Weapon-Analyzer (raymdl) — données communautaires extraites du jeu.
// Régénérer : deno task data [-- patch]
// Patch de référence : ${patch}
// Généré le : ${today}

import type { Weapon } from "../types.ts";

/** Métadonnées de génération (affichées dans /methode et le bandeau). */
export const DATA_META = {
  patch: "${patch}",
  generatedAt: "${today}",
  weapons: ${slim.length},
  source: "BF6-Weapon-Analyzer (raymdl)",
  sourceUrl: "https://github.com/raymdl/BF6-Weapon-Analyzer",
} as const;

export const WEAPONS: Weapon[] = `;

// JSON.stringify omet proprement les champs undefined (rafale, plombs…).
await Deno.writeTextFile(OUT, header + JSON.stringify(slim, null, 1) + ";\n");
console.log(`OK — ${slim.length} armes → data/generated/weapons.gen.ts (patch ${patch})`);
