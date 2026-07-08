import { define } from "@/utils.ts";
import { WEAPON_LIST, WEAPONS_BY_ID } from "@/data/weapons.ts";
import WeaponLab from "@/islands/WeaponLab.tsx";

export default define.page(function LaboPage(ctx) {
  const id = ctx.params.arme;
  const weapon = WEAPONS_BY_ID[id];

  // Arme inconnue : message + retour au roster (pas de 500).
  if (!weapon) {
    return (
      <main>
        <div class="divider">
          &gt;<b>INCONNU</b>&lt;
        </div>
        <div class="panel" style="max-width:520px;margin:0 auto">
          <div class="phead">
            <span class="tag">404</span>
          </div>
          <div class="pbody">
            <p>Aucune arme « {id} » dans le snapshot courant.</p>
            <p style="margin-top:10px">
              <a href="/armes" class="cta small">← Retour à l'arsenal</a>
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main>
      <div class="divider">
        &gt;<b>LABO&nbsp;·&nbsp;{weapon.name.toUpperCase()}</b>&lt;
      </div>

      {
        /* Sélecteur d'arme = liens serveur (aucun JS). Bande défilable ;
          le picker principal reste /armes. Chaque arme est sa propre route. */
      }
      <nav class="chswitch" aria-label="Changer d'arme">
        <a href="/armes" class="chswitch-all">◄ ARSENAL</a>
        {WEAPON_LIST.map((w) => (
          <a href={`/labo/${w.id}`} class={`chswitch-btn${w.id === weapon.id ? " on" : ""}`}>
            {w.name.toUpperCase()}
          </a>
        ))}
      </nav>

      {/* Tout l'interactif est dans cet unique îlot : c'est le seul JS hydraté de la page. */}
      <WeaponLab weapon={weapon} />
    </main>
  );
});
