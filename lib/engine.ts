/**
 * BF6 LAB — moteur balistique pur (aucun accès DOM, aucune valeur en dur).
 * Modèle assumé, même convention que le simulateur source :
 *  - dégâts interpolés linéairement entre paliers {r, d} ;
 *  - BTK : les tirs à la tête sont alloués en premier (l'ordre est sans
 *    importance : les dégâts s'additionnent) ;
 *  - TTK : temps entre le premier et le dernier tir (cadence, rafales) ;
 *  - fusils à pompe : dégâts par plomb × nb de plombs (gerbe complète).
 * Ce qui n'est PAS modélisé : recul, dispersion, membres, ADS, latence.
 */

import type { Engagement, Target, Weapon } from "@/data/types.ts";

/** Dégâts d'une balle (ou d'un plomb) à une distance donnée. */
export function dmgAt(w: Weapon, dist: number): number {
  const pts = w.dmg;
  if (!pts || pts.length === 0) return 0;
  if (dist <= pts[0].r) return pts[0].d;
  for (let i = 1; i < pts.length; i++) {
    if (dist <= pts[i].r) {
      const a = pts[i - 1];
      const b = pts[i];
      if (b.r === a.r) return b.d;
      const t = (dist - a.r) / (b.r - a.r);
      return a.d + t * (b.d - a.d);
    }
  }
  return pts[pts.length - 1].d;
}

/** Dégâts d'un tir complet (gerbe entière pour un fusil à pompe). */
export function shotDamage(w: Weapon, dist: number): number {
  const d = dmgAt(w, dist);
  return w.pellets ? d * w.pellets : d;
}

/** Balles pour tuer, `headshots` tirs à la tête alloués en premier. */
export function btk(w: Weapon, dist: number, headshots = 0, hp = 100): number {
  const d = shotDamage(w, dist);
  if (d <= 0) return Infinity;
  const hs = w.hsMult;
  if (!headshots) return Math.ceil(hp / d);
  const pureHS = Math.ceil(hp / (d * hs));
  if (pureHS <= headshots) return pureHS;
  const remaining = hp - headshots * d * hs;
  return headshots + Math.ceil(remaining / d);
}

/**
 * Instant du i-ème tir (0-indexé) en ms, cadence et cycles de rafale compris.
 * Cadence absente de la source (certains pompes) : Infinity — on ne devine pas.
 */
export function timeOfShot(w: Weapon, i: number): number {
  if (i <= 0) return 0;
  if (w.fireMode === "burst" && (w.burstRounds ?? 0) > 1 && w.burstRpm) {
    const rounds = w.burstRounds as number;
    const intra = 60000 / w.burstRpm;
    const cycle = 60000 / (w.burstBurstsPerMinute ?? w.burstRpm / rounds);
    const burst = Math.floor(i / rounds);
    const pos = i % rounds;
    return burst * cycle + pos * intra;
  }
  if (!w.rpm) return Infinity;
  return (i * 60000) / w.rpm;
}

/** Résultat complet d'un engagement arme × cible. */
export function engage(w: Weapon, t: Partial<Target> = {}): Engagement {
  const { dist = 30, headshots = 0, hp = 100, travel = false } = t;
  const n = btk(w, dist, headshots, hp);
  const perShot = shotDamage(w, dist);
  const ttkMs = Number.isFinite(n) ? timeOfShot(w, n - 1) : Infinity;
  const travelMs = w.bulletVel ? (dist / w.bulletVel) * 1000 : 0;
  return {
    btk: n,
    perShot,
    ttkMs,
    travelMs,
    totalMs: travel ? ttkMs + travelMs : ttkMs,
    dps: w.rpm ? (perShot * w.rpm) / 60 : 0,
    hsUsed: Number.isFinite(n) ? Math.min(headshots, n) : headshots,
    magEnough: Number.isFinite(n) && n <= w.mag,
  };
}
