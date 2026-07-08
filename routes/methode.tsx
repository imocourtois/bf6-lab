import { define } from "@/utils.ts";
import { DATA_META } from "@/data/weapons.ts";

export default define.page(function Methode() {
  return (
    <main>
      <div class="divider">
        &gt;<b>MÉTHODE</b>&lt;
      </div>
      <div class="prose">
        <div class="panel doc">
          <div class="phead">
            <span class="tag">D'OÙ VIENNENT LES DONNÉES</span>
          </div>
          <div class="pbody">
            <p>
              Il n'existe <b>aucune API officielle EA / DICE</b>{" "}
              pour les données de jeu de Battlefield 6, et les API communautaires (gametools.network,
              tracker.gg) ne servent que des stats joueur. BF6 LAB s'appuie donc sur le meilleur dataset
              communautaire disponible :
            </p>
            <ul>
              <li>
                <b>Armes</b> :{" "}
                <a href={DATA_META.sourceUrl} target="_blank" rel="noopener noreferrer">
                  BF6-Weapon-Analyzer
                </a>{" "}
                (raymdl) — valeurs extraites du jeu, suivies patch par patch. Snapshot actuel :{" "}
                <b>
                  patch {DATA_META.patch}
                </b>, généré le {DATA_META.generatedAt}.
              </li>
              <li>
                <b>Véhicules</b> : fiches éditoriales maintenues à la main dans <code>data/vehicles.ts</code>
                {" "}
                — corrections bienvenues.
              </li>
            </ul>
            <p>
              Comme sur CHAMP LAB, les données sont figées dans un snapshot versionné et commité (<code>
                data/generated/
              </code>) : le site ne fait <b>aucun appel réseau</b> en dehors de ses propres fichiers.
            </p>
          </div>
        </div>

        <div class="panel doc">
          <div class="phead">
            <span class="tag">LE MODÈLE TTK</span>
          </div>
          <div class="pbody">
            <p>
              Les dégâts d'une balle sont <b>interpolés linéairement</b>{" "}
              entre les paliers de distance du jeu. Ensuite :
            </p>
            <ul>
              <li>
                <b>BTK</b> (balles pour tuer) :{" "}
                <code>⌈PV / dégâts⌉</code>. Les tirs à la tête sont alloués en premier, au multiplicateur
                propre à l'arme (1,34 par défaut ; 1,5 sur les DMR ; 1,75 sur les snipers ; 1,0 sur les
                pompes).
              </li>
              <li>
                <b>TTK</b>{" "}
                : temps entre le premier et le dernier tir, à la cadence de l'arme — cycles de rafale compris
                pour les armes en burst. Option : temps de vol <code>distance / vélocité</code>.
              </li>
              <li>
                <b>Pompes</b>{" "}
                : dégâts par plomb × nombre de plombs, en supposant la gerbe complète au contact.
              </li>
            </ul>
            <p>
              <b>Non modélisé, et assumé</b>{" "}
              : recul, dispersion, tirs manqués, multiplicateurs de membres, temps de visée et de sortie
              d'arme, latence réseau. Le TTK affiché est donc un <b>plancher théorique</b>{" "}
              — parfait pour comparer les armes entre elles, pas pour prédire un duel réel. Le moteur tient
              dans <code>lib/engine.ts</code>, testé par <code>deno task test</code>.
            </p>
          </div>
        </div>

        <div class="panel doc">
          <div class="phead">
            <span class="tag">METTRE À JOUR</span>
          </div>
          <div class="pbody">
            <p>
              À chaque patch : <code>deno task data -- 1.3.4.0</code> régénère{" "}
              <code>data/generated/weapons.gen.ts</code>{" "}
              depuis la source. Les véhicules s'éditent directement dans <code>data/vehicles.ts</code>.
            </p>
          </div>
        </div>

        <div class="panel doc">
          <div class="phead">
            <span class="tag">LICENCE &amp; AFFILIATION</span>
          </div>
          <div class="pbody">
            <p>
              Code sous licence{" "}
              <b>MIT</b>, interface 100 % CSS, zéro image, zéro tracker. Données armes © communauté
              BF6-Weapon-Analyzer, créditées ci-dessus. BF6 LAB n'est <b>pas affilié</b>{" "}
              à EA ni à DICE ; Battlefield est une marque de leurs propriétaires respectifs.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
});
