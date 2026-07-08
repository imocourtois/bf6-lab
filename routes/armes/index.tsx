import { define } from "@/utils.ts";
import { CLASSES, CLS_CODE, WEAPON_LIST } from "@/data/weapons.ts";

/** Roster complet, groupé par classe — chaque tuile mène au labo. */
export default define.page(function Armes() {
  return (
    <main>
      <div class="divider">
        &gt;<b>ARSENAL</b>&lt;
      </div>
      <p class="page-lede">
        Toutes les armes du snapshot courant. Clique une arme pour ouvrir son labo : profil de dégâts, TTK
        contre une cible réglable, comparaison avec le reste de l'arsenal.
      </p>
      {CLASSES.map(([cls, label]) => {
        const list = WEAPON_LIST.filter((w) => w.cls === cls);
        if (list.length === 0) return null;
        return (
          <section>
            <div class="divider">
              <b>{label}</b>
            </div>
            <div class="roster" style="margin-bottom:16px">
              {list.map((w) => (
                <a class="rtile" href={`/labo/${w.id}`}>
                  <span class="rt-badge">{CLS_CODE[w.cls]}</span>
                  <span class="rt-name">{w.name}</span>
                  <span class="rt-sub">{w.rpm ? `${w.rpm} tr/min` : "cadence n/r"} · {w.mag} cps</span>
                </a>
              ))}
            </div>
          </section>
        );
      })}
    </main>
  );
});
