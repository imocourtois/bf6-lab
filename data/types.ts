/**
 * Types du domaine BF6 LAB.
 * Le moteur (lib/engine.ts) ne consomme que ces types — jamais les JSON bruts
 * de la source : le pipeline (scripts/fetch-data.ts) fait la projection.
 */

/** Palier de dégâts : `d` dégâts jusqu'à `r` mètres (interpolation entre paliers). */
export interface DmgStep {
  r: number;
  d: number;
}

export type FireMode = "auto" | "semi" | "burst" | "bolt" | "pump";

export type WeaponClass =
  | "Assault Rifle"
  | "Carbine"
  | "SMG"
  | "LMG"
  | "DMR"
  | "Sniper Rifle"
  | "Shotgun"
  | "Sidearm";

export interface Weapon {
  id: string;
  name: string;
  cls: WeaponClass;
  /** calibre, purement informatif */
  cal?: string;
  /** cadence soutenue en tirs/minute — absente sur certains pompes (source) */
  rpm?: number;
  fireMode: FireMode;
  /** armes en rafale uniquement */
  burstRounds?: number;
  burstRpm?: number;
  burstBurstsPerMinute?: number;
  /** capacité du chargeur */
  mag: number;
  /** recharge tactique / à vide, en secondes */
  tacRld?: number;
  emptyRld?: number;
  /** sortie d'arme, en secondes */
  deployT?: number;
  /** temps de visée, en ms */
  adsTime?: number;
  /** vélocité de la balle, en m/s */
  bulletVel?: number;
  /** fusils à pompe : nombre de plombs par cartouche (dmg = par plomb) */
  pellets?: number;
  /** multiplicateur de dégâts à la tête, propre à l'arme */
  hsMult: number;
  dmg: DmgStep[];
}

/** Profil de cible du labo. */
export interface Target {
  /** distance en mètres */
  dist: number;
  /** tirs à la tête alloués en premier (99 = tout à la tête) */
  headshots: number;
  /** points de vie (soldat standard : 100) */
  hp: number;
  /** inclure le temps de vol de la balle dans le TTK affiché */
  travel: boolean;
}

/** Résultat d'un engagement arme × cible (sortie du moteur). */
export interface Engagement {
  /** balles pour tuer (Infinity si dégâts nuls) */
  btk: number;
  /** dégâts d'un tir complet à cette distance (gerbe entière pour un pompe) */
  perShot: number;
  /** temps entre le premier et le dernier tir, en ms */
  ttkMs: number;
  /** temps de vol de la balle, en ms */
  travelMs: number;
  /** ttkMs + travelMs si demandé, sinon ttkMs */
  totalMs: number;
  dps: number;
  /** tirs à la tête réellement consommés */
  hsUsed: number;
  /** le chargeur suffit-il pour tuer sans recharger ? */
  magEnough: boolean;
}

// ---------------------------------------------------------------------------
// Véhicules — fiches éditoriales (aucun dataset public n'existe).
// ---------------------------------------------------------------------------

export type Faction = "NATO" | "PAX" | "COMMUN";

export interface VehicleClass {
  id: string;
  label: string;
  role: string;
}

export interface Vehicle {
  id: string;
  name: string;
  /** id de VehicleClass */
  cls: string;
  faction: Faction;
  /** texte libre : « 2 (+2 accrochés) » */
  seats: string;
  armament: string[];
  /** contre-mesures (leurres, fumigènes…) */
  counter: string[];
  /** jauges indicatives 0–5 — éditorial, pas extrait du jeu */
  armor: number;
  speed: number;
  fire: number;
  notes?: string;
  /** false = info de sources secondaires, à confirmer en jeu */
  verified: boolean;
}
