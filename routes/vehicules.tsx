import { define } from "@/utils.ts";
import { VEHICLE_CLASSES, VEHICLES, VEHICLES_UPDATED } from "@/data/vehicles.ts";
import type { Faction } from "@/data/types.ts";

function Pips({ n }: { n: number }) {
  return (
    <span class="pips">
      {Array.from({ length: 5 }, (_, i) => <span key={i} class={`pip${i < n ? " on" : ""}`}></span>)}
    </span>
  );
}

function FacBadge({ f }: { f: Faction }) {
  if (f === "NATO") return <span class="facbadge nato">NATO</span>;
  if (f === "PAX") return <span class="facbadge pax">PAX ARMATA</span>;
  return <span class="facbadge">COMMUN</span>;
}

/** Garage — 100 % rendu serveur, aucun JS envoyé au client. */
export default define.page(function Vehicules() {
  return (
    <main>
      <div class="divider">
        &gt;<b>GARAGE</b>&lt;
      </div>
      <div class="vlede">
        <b>FICHES ÉDITORIALES</b>{" "}
        — aucune API officielle ni dataset communautaire structuré n'existe pour les véhicules : places,
        armement et contre-mesures sont maintenus à la main depuis les sources publiques (màj{" "}
        {VEHICLES_UPDATED}). Les jauges sont indicatives, pas des valeurs extraites du jeu.
      </div>
      {VEHICLE_CLASSES.map((c) => {
        const list = VEHICLES.filter((v) => v.cls === c.id);
        if (list.length === 0) return null;
        return (
          <div class="vclass">
            <div class="divider">
              <b>{c.label}</b>
            </div>
            <p class="vrole">{c.role}</p>
            <div class="vgrid">
              {list.map((v) => (
                <div class="panel">
                  <div class="phead">
                    <span class="tag">{c.label.split(" ")[0]}</span>
                    <span class="st">
                      {!v.verified && <span class="vverif">À VÉRIFIER</span>} <FacBadge f={v.faction} />
                    </span>
                  </div>
                  <div class="pbody">
                    <div class="vname">{v.name}</div>
                    <div class="vseats">PLACES : {v.seats}</div>
                    <ul class="vlist">
                      {v.armament.map((a) => <li key={a}>{a}</li>)}
                      {v.counter.map((a) => <li key={a} class="cm">{a}</li>)}
                      {v.armament.length === 0 && v.counter.length === 0 && <li>Aucun armement embarqué</li>}
                    </ul>
                    <div class="ratewrap">
                      <div class="raterow">
                        <span class="k">BLINDAGE</span>
                        <Pips n={v.armor} />
                      </div>
                      <div class="raterow">
                        <span class="k">VITESSE</span>
                        <Pips n={v.speed} />
                      </div>
                      <div class="raterow">
                        <span class="k">PUISSANCE</span>
                        <Pips n={v.fire} />
                      </div>
                    </div>
                    {v.notes && <p class="vnotes">{v.notes}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </main>
  );
});
