/** @jsxImportSource preact */
import type { ComponentChildren } from "preact";
import { useState } from "preact/hooks";
import type { Engagement, Weapon } from "@/data/types.ts";
import { CLASSES, CLS_CODE, CLS_LABEL, FIRE_LABEL, WEAPONS } from "@/data/weapons.ts";
import { dmgAt, engage } from "@/lib/engine.ts";

const fr = (n: number, d = 0) => n.toLocaleString("fr-FR", { maximumFractionDigits: d });

/** Presets de zone : libellé, tirs à la tête alloués en premier, description. */
const HS_MODES: ReadonlyArray<readonly [string, number, string]> = [
  ["TORSE", 0, "100 % torse"],
  ["+1 TÊTE", 1, "1 tête, puis torse"],
  ["TOUT TÊTE", 99, "plein tête"],
];

/** Nombre max de pips de chargeur affichés (les LMG à tambour débordent). */
const MAG_PIPS_MAX = 60;

function ttkLabel(r: Engagement): string {
  if (!Number.isFinite(r.btk)) return "—";
  if (r.btk === 1) return "1 balle";
  // cadence absente de la source : on affiche les balles, pas un temps deviné
  return Number.isFinite(r.totalMs) ? `${fr(r.totalMs)} ms` : `${r.btk} balles`;
}

function StatRow({ k, v }: { k: string; v: ComponentChildren }) {
  return (
    <div class="statrow">
      <span class="k">{k}</span>
      <span class="v">{v}</span>
    </div>
  );
}

/** Courbe de dégâts 0–150 m en barres CSS ; la barre proche de la cible s'allume. */
function DChart({ w, dist }: { w: Weapon; dist: number }) {
  const max = Math.max(...w.dmg.map((p) => p.d));
  const bars = [];
  for (let d = 0; d <= 150; d += 10) {
    const v = dmgAt(w, d);
    bars.push(
      <i
        class={`dbar${Math.abs(d - dist) < 5 ? " hot" : ""}`}
        style={`height:${Math.max(6, (v / max) * 100)}%`}
        title={`${d} m : ${fr(v, 1)}`}
      >
      </i>,
    );
  }
  return (
    <div>
      <div class="dchart">{bars}</div>
      <div class="dchart-x">
        <span>0 m</span>
        <span>75 m</span>
        <span>150 m</span>
      </div>
    </div>
  );
}

export default function WeaponLab({ weapon }: { weapon: Weapon }) {
  const [dist, setDist] = useState(30);
  const [hp, setHp] = useState(100);
  const [hsMode, setHsMode] = useState(0);
  const [travel, setTravel] = useState(false);
  const [impact, setImpact] = useState(true);
  const [search, setSearch] = useState("");
  const [clsFilter, setClsFilter] = useState<string>("ALL");

  const target = { dist, headshots: HS_MODES[hsMode][1], hp, travel };
  const r = engage(weapon, target);

  // Arsenal : filtré, puis trié du TTK le plus rapide au plus lent contre la cible.
  const q = search.trim().toLowerCase();
  const shelf = WEAPONS
    .filter((w) => clsFilter === "ALL" || w.cls === clsFilter)
    .filter((w) => !q || w.name.toLowerCase().includes(q))
    .map((w) => ({ w, res: engage(w, target) }))
    .sort((a, b) => a.res.totalMs - b.res.totalMs);

  // Répartition tête/corps des dégâts réellement infligés (barre du readout).
  const hsDmg = r.hsUsed * r.perShot * weapon.hsMult;
  const bodyShots = Number.isFinite(r.btk) ? r.btk - r.hsUsed : 0;
  const bodyDmg = bodyShots * r.perShot;
  const totDmg = Math.max(1, hsDmg + bodyDmg);

  const magPips = Math.min(weapon.mag, MAG_PIPS_MAX);

  return (
    <>
      <div class="grid lab">
        {/* ---- colonne 1 : fiche arme + profil de dégâts ---- */}
        <div class="col">
          <div class="panel">
            <div class="phead">
              <span class="tag">ARME</span>
              <span class="st">{CLS_LABEL[weapon.cls]}</span>
            </div>
            <div class="pbody">
              <div class="portrait">
                <div class="pface">
                  <span class="init">{CLS_CODE[weapon.cls]}</span>
                </div>
                <div class="pmeta">
                  <div class="name">{weapon.name}</div>
                  <div class="sub">{weapon.cal ?? ""}</div>
                  <span class="adaptbadge">
                    {FIRE_LABEL[weapon.fireMode]}
                    {weapon.pellets ? ` · ×${weapon.pellets} PLOMBS` : ""}
                  </span>
                </div>
              </div>
              <div class="statlist">
                <StatRow
                  k="CADENCE"
                  v={weapon.fireMode === "burst"
                    ? (
                      <>
                        {fr(weapon.burstRpm ?? weapon.rpm ?? 0)}{" "}
                        <small>en rafale ×{weapon.burstRounds}</small>
                      </>
                    )
                    : weapon.rpm
                    ? (
                      <>
                        {fr(weapon.rpm)} <small>tr/min</small>
                      </>
                    )
                    : "non renseignée"}
                />
                <StatRow
                  k="CHARGEUR"
                  v={
                    <>
                      {weapon.mag} <small>cps</small>
                    </>
                  }
                />
                <StatRow
                  k="RECHARGE"
                  v={
                    <>
                      {fr(weapon.tacRld ?? 0, 2)} s <small>(vide {fr(weapon.emptyRld ?? 0, 2)} s)</small>
                    </>
                  }
                />
                <StatRow
                  k="VÉLOCITÉ"
                  v={
                    <>
                      {fr(weapon.bulletVel ?? 0)} <small>m/s</small>
                    </>
                  }
                />
                <StatRow
                  k="VISÉE (ADS)"
                  v={
                    <>
                      {fr(weapon.adsTime ?? 0)} <small>ms</small>
                    </>
                  }
                />
                <StatRow
                  k="SORTIE D'ARME"
                  v={
                    <>
                      {fr(weapon.deployT ?? 0, 2)} <small>s</small>
                    </>
                  }
                />
                <StatRow k="MULT. TÊTE" v={`×${fr(weapon.hsMult, 2)}`} />
              </div>
            </div>
          </div>

          <div class="panel">
            <div class="phead">
              <span class="tag">PROFIL DE DÉGÂTS</span>
              <span class="st">par {weapon.pellets ? "plomb" : "balle"}</span>
            </div>
            <div class="pbody">
              <DChart w={weapon} dist={dist} />
              <div class="dsteps">
                {weapon.dmg.map((p, i) => {
                  const next = weapon.dmg[i + 1];
                  return (
                    <div>
                      {next ? `${fr(p.r, 1)}–${fr(next.r, 1)} m` : `${fr(p.r, 1)} m et au-delà`} :{" "}
                      <b>{fr(p.d, 2)}</b>
                    </div>
                  );
                })}
                {weapon.pellets && <small>gerbe complète = ×{weapon.pellets} plombs</small>}
              </div>
            </div>
          </div>
        </div>

        {/* ---- colonne 2 : arsenal comparatif ---- */}
        <div class="col">
          <div class="panel" style="flex:1">
            <div class="phead">
              <span class="tag">ARSENAL</span>
              <button type="button" class="impacttoggle" onClick={() => setImpact(!impact)}>
                MODE IMPACT <span class={`chk${impact ? " on" : ""}`}></span>
              </button>
            </div>
            <div class="pbody">
              <div class="shelfhead">
                Δ TTK = écart avec ton arme actuelle, vs cible ↓ — trié du plus rapide au plus lent
              </div>
              <input
                class="itemsearch"
                type="text"
                placeholder={`Chercher parmi ${WEAPONS.length} armes…`}
                value={search}
                onInput={(e) => setSearch(e.currentTarget.value)}
              />
              <select
                class="itemsearch"
                value={clsFilter}
                onChange={(e) => setClsFilter(e.currentTarget.value)}
              >
                <option value="ALL">TOUTES LES CLASSES</option>
                {CLASSES.map(([id, label]) => <option key={id} value={id}>{label}</option>)}
              </select>
              <div class="shelf scroll">
                {shelf.length === 0 && <div class="noresult">aucune arme ne correspond</div>}
                {shelf.map(({ w, res }) => {
                  let delta;
                  if (
                    impact && w.id !== weapon.id && Number.isFinite(res.totalMs) && Number.isFinite(r.totalMs)
                  ) {
                    const d = Math.round(res.totalMs - r.totalMs);
                    const cls = d < 0 ? "pos" : d > 0 ? "neg" : "zero";
                    delta = <span class={`delta ${cls}`}>{d > 0 ? "+" : ""}{fr(d)} ms</span>;
                  } else {
                    delta = <span class="delta zero">{ttkLabel(res)}</span>;
                  }
                  return (
                    <a href={`/labo/${w.id}`} class={`chip${w.id === weapon.id ? " equipped" : ""}`}>
                      <span class="code">{CLS_CODE[w.cls]}</span>
                      <span class="nm">{w.name}</span>
                      <span class="stats">
                        {w.rpm ? `${fr(w.rpm)} tr/min` : "cadence n/r"} ·{" "}
                        {Number.isFinite(res.btk) ? res.btk : "—"} b.
                      </span>
                      {delta}
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ---- colonne 3 : cible ---- */}
        <div class="col">
          <div class="panel" style="flex:1">
            <div class="phead">
              <span class="tag">CIBLE</span>
              <span class="st enemytag">profil réglable</span>
            </div>
            <div class="pbody">
              <div class="presets">
                {HS_MODES.map(([label], i) => (
                  <button
                    type="button"
                    class={hsMode === i ? "on" : ""}
                    onClick={() => setHsMode(i)}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div class="field">
                <div class="flabel">
                  <span>DISTANCE</span>
                  <span class="v">{dist} m</span>
                </div>
                <input
                  type="range"
                  class="en"
                  min="0"
                  max="150"
                  step="5"
                  value={dist}
                  onInput={(e) => setDist(Number(e.currentTarget.value))}
                />
              </div>
              <div class="field">
                <div class="flabel">
                  <span>PV CIBLE</span>
                  <span class="v">{hp}</span>
                </div>
                <input
                  type="range"
                  class="en"
                  min="50"
                  max="150"
                  step="10"
                  value={hp}
                  onInput={(e) => setHp(Number(e.currentTarget.value))}
                />
              </div>
              <button type="button" class="togglerow" onClick={() => setTravel(!travel)}>
                TEMPS DE VOL INCLUS <span class={`chk${travel ? " on" : ""}`}></span>
              </button>
              <p class="small" style="margin-top:14px">
                Le soldat standard a 100 PV. Le multiplicateur tête dépend de l'arme (×{fr(weapon.hsMult, 2)}
                {" "}
                ici). Recul et dispersion ne sont pas modélisés : tous les tirs touchent — voir{" "}
                <a href="/methode" style="color:var(--green)">méthode</a>.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ---- readout ---- */}
      <div class="readout">
        <span class="ck tl"></span>
        <span class="ck tr"></span>
        <span class="ck bl"></span>
        <span class="ck br"></span>
        <div class="rgrid">
          <div class="combobox">
            <div class="cl">CIBLE AU SOL EN</div>
            <div class="cv">
              {!Number.isFinite(r.btk) ? "∅" : r.btk === 1
                ? (
                  <>
                    1<small>&nbsp;BALLE</small>
                  </>
                )
                : Number.isFinite(r.totalMs)
                ? (
                  <>
                    {fr(Math.round(r.totalMs))}
                    <small>&nbsp;ms</small>
                  </>
                )
                : (
                  <>
                    {r.btk}
                    <small>&nbsp;BALLES</small>
                  </>
                )}
            </div>
            <div class="cs">
              {!Number.isFinite(r.btk)
                ? "hors de portée du modèle"
                : `${r.btk} balle${r.btk > 1 ? "s" : ""} · ${dist} m · ${HS_MODES[hsMode][2]}${
                  travel ? " · vol inclus" : ""
                }${!Number.isFinite(r.totalMs) && r.btk > 1 ? " · cadence non renseignée" : ""}`}
            </div>
          </div>
          <div class="rright">
            <div>
              <div class="tybar">
                <i class="b-head" style={`width:${(hsDmg / totDmg) * 100}%`}></i>
                <i class="b-phys" style={`width:${(bodyDmg / totDmg) * 100}%`}></i>
              </div>
              <div class="tylegend" style="margin-top:6px">
                <span>
                  <span class="dot b-head"></span> TÊTE {fr(hsDmg)}
                </span>
                <span>
                  <span class="dot b-phys"></span> CORPS {fr(bodyDmg)}
                </span>
              </div>
            </div>
            <div class="bp">
              <div class="bpline">
                <span class="lead">FLUX</span> DPS <b>{weapon.rpm ? fr(r.dps) : "—"}</b> · dégâts/tir{" "}
                <b>{fr(r.perShot, 1)}</b> à {dist} m · vol <b>{fr(r.travelMs)} ms</b>
              </div>
              <div class="bpline">
                <span class="lead">CHARGEUR</span> {Number.isFinite(r.btk)
                  ? (
                    <>
                      <b>{r.btk}</b> / {weapon.mag} cps
                    </>
                  )
                  : "—"}
                {!r.magEnough && <span class="warn">— chargeur insuffisant, recharge requise</span>}
              </div>
              <div class="magbar">
                {Array.from({ length: magPips }, (_, i) => {
                  const hit = Number.isFinite(r.btk) && i < r.btk;
                  return <i key={i} class={hit ? (i < r.hsUsed ? "hs" : "hit") : ""}></i>;
                })}
                {weapon.mag > magPips && (
                  <span class="stats" style="align-self:center">+{weapon.mag - magPips}</span>
                )}
              </div>
              <div class="hpwrap">
                <div class="hplabel">
                  <span>PV {hp}</span>
                  <span>{Number.isFinite(r.totalMs) ? `TTK ${fr(Math.round(r.totalMs))} ms` : ""}</span>
                </div>
                <div class={`hpbar${r.magEnough ? " kill" : ""}`}>
                  <div class="hpstate">{r.magEnough ? "CIBLE ÉLIMINÉE" : "SURVIT AU CHARGEUR"}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
