import { assertEquals } from "@std/assert";
import { btk, dmgAt, engage, timeOfShot } from "@/lib/engine.ts";
import type { Weapon } from "@/data/types.ts";

// Arme de référence : profil du M433 (patch 1.3.3.0).
const m433: Weapon = {
  id: "m433",
  name: "M433",
  cls: "Assault Rifle",
  rpm: 830,
  fireMode: "auto",
  mag: 31,
  bulletVel: 670,
  hsMult: 1.34,
  dmg: [
    { r: 0, d: 25 },
    { r: 9.5, d: 25 },
    { r: 20.5, d: 20 },
    { r: 35.5, d: 20 },
    { r: 75, d: 16.67 },
  ],
};

Deno.test("dmgAt : plateau, interpolation, au-delà du dernier palier", () => {
  assertEquals(dmgAt(m433, 0), 25);
  assertEquals(dmgAt(m433, 30), 20); // plateau 20,5–35,5 m
  assertEquals(dmgAt(m433, 15), 25 + ((15 - 9.5) / (20.5 - 9.5)) * (20 - 25));
  assertEquals(dmgAt(m433, 500), 16.67); // constant après le dernier palier
});

Deno.test("btk : torse, tête allouée en premier", () => {
  assertEquals(btk(m433, 30), 5); // ceil(100 / 20)
  assertEquals(btk(m433, 30, 99), 4); // ceil(100 / 26,8) plein tête
});

Deno.test("timeOfShot : cadence simple", () => {
  assertEquals(timeOfShot(m433, 4), (4 * 60000) / 830);
});

Deno.test("timeOfShot : cycles de rafale", () => {
  const burst: Weapon = {
    ...m433,
    id: "b",
    fireMode: "burst",
    burstRounds: 3,
    burstRpm: 900,
    burstBurstsPerMinute: 300,
  };
  // tir 3 = premier tir de la 2e rafale → un cycle complet (60000/300 = 200 ms)
  assertEquals(timeOfShot(burst, 3), 200);
  // tir 4 = 2e tir de la 2e rafale → cycle + intervalle intra (60000/900)
  assertEquals(timeOfShot(burst, 4), 200 + 60000 / 900);
});

Deno.test("engage : TTK M433 à 30 m torse = 289 ms", () => {
  const r = engage(m433, { dist: 30 });
  assertEquals(r.btk, 5);
  assertEquals(Math.round(r.totalMs), 289);
  assertEquals(r.magEnough, true);
});

Deno.test("engage : cadence absente → TTK non calculable au-delà d'une balle", () => {
  const noRpm: Weapon = {
    ...m433,
    id: "norpm",
    cls: "Shotgun",
    fireMode: "pump",
    rpm: undefined,
    pellets: 12,
    hsMult: 1.0,
    dmg: [{ r: 0, d: 5 }], // 60 dégâts par gerbe → 2 balles
  };
  const r = engage(noRpm, { dist: 0 });
  assertEquals(r.btk, 2);
  assertEquals(r.ttkMs, Infinity);
  assertEquals(r.dps, 0);
});

Deno.test("engage : fusil à pompe = dégâts par gerbe complète", () => {
  const sg: Weapon = {
    ...m433,
    id: "sg",
    cls: "Shotgun",
    fireMode: "pump",
    rpm: 60,
    pellets: 16,
    hsMult: 1.0,
    dmg: [{ r: 0, d: 8.4 }],
  };
  const r = engage(sg, { dist: 0 });
  assertEquals(r.perShot, 8.4 * 16);
  assertEquals(r.btk, 1);
});
