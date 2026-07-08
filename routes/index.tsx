import { define } from "@/utils.ts";
import { CLS_LABEL, DATA_META, WEAPONS } from "@/data/weapons.ts";
import { VEHICLES } from "@/data/vehicles.ts";
import { engage } from "@/lib/engine.ts";

const fr = (n: number) => Math.round(n).toLocaleString("fr-FR");

export default define.page(function Home() {
  // Vitrine : les 5 TTK les plus rapides à 30 m torse, calculés côté serveur.
  const top = WEAPONS
    .map((w) => ({ w, r: engage(w, { dist: 30 }) }))
    .sort((a, b) => a.r.totalMs - b.r.totalMs)
    .slice(0, 5);

  return (
    <main>
      <section class="hero">
        <h1 class="hero-title">
          CE QUE FONT<br />VRAIMENT TES <span class="accent">ARMES</span>.
        </h1>
        <p class="hero-lede">
          BF6 LAB lit les données communautaires extraites du jeu — paliers de dégâts, cadence, vélocité — et
          calcule le <em>temps pour tuer réel</em>{" "}
          de chaque arme, à la distance que tu choisis. Sans pub, sans compte, sans stats joueur.
        </p>
        <a class="cta" href="/armes">OUVRIR LE LABO →</a>
      </section>

      <div class="divider">
        <b>MODULES</b>
      </div>
      <div class="features">
        <div class="panel feat">
          <div class="phead">
            <span class="tag">ARSENAL</span>
            <span class="st">{DATA_META.weapons} armes</span>
          </div>
          <div class="pbody">
            <h3>Balistique honnête</h3>
            <p>
              Dégâts par palier de distance, cadence, rafales, multiplicateur tête :{" "}
              <em>patch {DATA_META.patch}</em>, rien d'inventé, tout est sourcé.
            </p>
          </div>
        </div>
        <div class="panel feat">
          <div class="phead">
            <span class="tag">CIBLE</span>
            <span class="st">réglable</span>
          </div>
          <div class="pbody">
            <h3>TTK à ta distance</h3>
            <p>
              Règle distance, PV et tirs à la tête ; chaque arme affiche <em>directement son delta</em>{" "}
              face à ton arme actuelle.
            </p>
          </div>
        </div>
        <div class="panel feat">
          <div class="phead">
            <span class="tag">GARAGE</span>
            <span class="st">{VEHICLES.length} véhicules</span>
          </div>
          <div class="pbody">
            <h3>Chars, hélicos, jets</h3>
            <p>
              Fiches par classe : places, armement, contre-mesures. <em>Éditorial assumé</em>{" "}
              tant qu'aucun dataset public n'existe.
            </p>
          </div>
        </div>
      </div>

      <div class="divider">
        <b>TTK LES PLUS RAPIDES À 30 M — TORSE</b>
      </div>
      <div class="champstrip">
        {top.map(({ w, r }) => (
          <a class="champtile" href={`/labo/${w.id}`}>
            <div class="ct-meta">
              <div class="ct-name">{w.name}</div>
              <div class="ct-sub">
                {CLS_LABEL[w.cls]} · {r.btk === 1 ? "1 balle" : `${fr(r.totalMs)} ms`} · {r.btk} balles
              </div>
            </div>
          </a>
        ))}
        <a class="champtile more" href="/armes">
          <div class="ct-meta">
            <div class="ct-name">+{WEAPONS.length - top.length} autres →</div>
          </div>
        </a>
      </div>
    </main>
  );
});
