/**
 * Point d'entrée données armes : re-exporte le snapshot généré
 * (data/generated/weapons.gen.ts, produit par `deno task data`)
 * et fournit les index/labels utilisés par les routes et l'îlot.
 */

import type { FireMode, Weapon, WeaponClass } from "./types.ts";
import { DATA_META, WEAPONS } from "./generated/weapons.gen.ts";

export { DATA_META, WEAPONS };

/** Ordre d'affichage des classes + libellé FR + code court (pface, chips). */
export const CLASSES: ReadonlyArray<readonly [WeaponClass, string, string]> = [
  ["Assault Rifle", "ASSAUT", "AR"],
  ["Carbine", "CARABINE", "CRB"],
  ["SMG", "SMG", "SMG"],
  ["LMG", "LMG", "LMG"],
  ["DMR", "DMR", "DMR"],
  ["Sniper Rifle", "SNIPER", "SNP"],
  ["Shotgun", "POMPE", "SG"],
  ["Sidearm", "POING", "SA"],
];

export const CLS_LABEL: Record<string, string> = Object.fromEntries(CLASSES.map((c) => [c[0], c[1]]));
export const CLS_CODE: Record<string, string> = Object.fromEntries(CLASSES.map((c) => [c[0], c[2]]));

export const FIRE_LABEL: Record<FireMode, string> = {
  auto: "AUTO",
  semi: "SEMI-AUTO",
  burst: "RAFALE",
  bolt: "VERROU",
  pump: "POMPE",
};

/** Roster trié par classe (ordre CLASSES) puis par nom. */
export const WEAPON_LIST: Weapon[] = [...WEAPONS].sort((a, b) => {
  const ca = CLASSES.findIndex((c) => c[0] === a.cls);
  const cb = CLASSES.findIndex((c) => c[0] === b.cls);
  return ca !== cb ? ca - cb : a.name.localeCompare(b.name, "fr");
});

export const WEAPON_IDS: string[] = WEAPON_LIST.map((w) => w.id);

export const WEAPONS_BY_ID: Record<string, Weapon> = Object.fromEntries(
  WEAPONS.map((w) => [w.id, w]),
);
