/**
 * Chrome du site — composants serveur (0 JS envoyé au client).
 * La barre HUD, la nav et le pied reprennent l'esthétique terminal/HUD
 * de CHAMP LAB, adaptée BF6 (marque = réticule 100% CSS).
 */

import { DATA_META } from "@/data/weapons.ts";

interface NavItem {
  href: string;
  label: string;
}

const NAV: NavItem[] = [
  { href: "/", label: "ACCUEIL" },
  { href: "/armes", label: "ARMES" },
  { href: "/vehicules", label: "VÉHICULES" },
  { href: "/methode", label: "MÉTHODE" },
];

export function TopBar() {
  return (
    <div class="hud">
      <a class="cell logo" href="/" aria-label="Accueil BF6 LAB">
        <div class="mark">
          <i></i>
        </div>
        <div class="brand">
          <b>BF6</b>_LAB<br />
          // v0.1
        </div>
      </a>
      <div class="cell title-cell">
        <div class="t">CE QUE FONT VRAIMENT TES ARMES &amp; VÉHICULES.</div>
        <div class="s">fiches balistiques battlefield 6 — open source</div>
      </div>
      <div class="cell globes">
        <div class="globe"></div>
        <div class="globe"></div>
        <div class="globe"></div>
      </div>
    </div>
  );
}

export function Nav({ active }: { active: string }) {
  return (
    <nav class="mainnav" aria-label="Navigation principale">
      {NAV.map((item) => {
        const on = item.href === "/"
          ? active === "/"
          : active.startsWith(item.href) || (item.href === "/armes" && active.startsWith("/labo"));
        return (
          <a href={item.href} class={`navlink${on ? " on" : ""}`} aria-current={on ? "page" : undefined}>
            {item.label}
          </a>
        );
      })}
      <a
        href={DATA_META.sourceUrl}
        class="navlink ghost"
        target="_blank"
        rel="noopener noreferrer"
      >
        DONNÉES ↗
      </a>
    </nav>
  );
}

export function Strip() {
  return (
    <div class="strip">
      <div class="labels">
        SNAPSHOT — patch <b>{DATA_META.patch}</b> · {DATA_META.weapons} armes<br />
        source communautaire, rafraîchie le {DATA_META.generatedAt}
      </div>
      <div class="loadbar" aria-hidden="true">
        <span></span>
        <span></span>
      </div>
    </div>
  );
}

export function Footer() {
  return (
    <footer class="foot">
      <span>
        <span class="warn">⚠ DONNÉES COMMUNAUTAIRES</span> — armes : BF6-Weapon-Analyzer (patch{" "}
        {DATA_META.patch}) · véhicules : fiches éditoriales. BF6 LAB n'est pas affilié à EA ni DICE.
      </span>
      <span>MIT · look 100% CSS</span>
    </footer>
  );
}
