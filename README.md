# BF6 LAB

**Ce que font vraiment tes armes & véhicules.** Fiches balistiques Battlefield 6 — TTK réel par distance,
profils de dégâts, garage véhicules. Le pendant BF6 de [CHAMP LAB](https://github.com/imocourtois/champ-lab),
même stack, même philosophie : sobre, honnête, statique.

- **Deno 2 + Fresh 2** (architecture îlots) : un seul composant hydraté
  ([islands/WeaponLab.tsx](islands/WeaponLab.tsx)), tout le reste est rendu serveur sans JS.
- **Zéro image, zéro tracker** : l'interface est 100 % CSS (cadres, dithering, scanlines).
- **Zéro appel réseau** en production : les données sont des snapshots versionnés et commités.
- **Pas de stats joueur** : uniquement les données du jeu.

## Lancer en local

```sh
deno task dev     # serveur de dev avec rechargement à chaud
deno task check   # fmt + lint + types
deno task test    # tests du moteur balistique
deno task build   # build de production (_fresh/)
```

## D'où viennent les données

Il n'existe **aucune API officielle EA / DICE** pour les données de jeu, et les API communautaires
(gametools.network, tracker.gg) ne couvrent que les stats joueur.

| Données        | Source                                                                                                                            | Mise à jour                 |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| Armes (58)     | [BF6-Weapon-Analyzer](https://github.com/raymdl/BF6-Weapon-Analyzer) (raymdl) — valeurs extraites du jeu, suivies patch par patch | `deno task data -- <patch>` |
| Véhicules (15) | Fiches éditoriales maintenues à la main ([data/vehicles.ts](data/vehicles.ts))                                                    | à la main, PR bienvenues    |

À chaque patch :

```sh
deno task data -- 1.3.4.0
```

régénère [data/generated/weapons.gen.ts](data/generated/weapons.gen.ts) (identité, cadence, chargeur,
vélocité, multiplicateur tête, paliers de dégâts) depuis la branche `main` de la source.

## Le modèle (résumé)

- Dégâts interpolés linéairement entre les paliers de distance du jeu.
- **BTK** = ⌈PV / dégâts⌉, tirs à la tête alloués en premier (multiplicateur par arme).
- **TTK** = temps entre le premier et le dernier tir, rafales comprises ; temps de vol en option.
- Non modélisé (assumé) : recul, dispersion, membres, ADS, latence. Le TTK affiché est un plancher théorique,
  fait pour **comparer** les armes.

Détails dans la page **MÉTHODE** du site ; moteur pur dans [lib/engine.ts](lib/engine.ts), testé par
[lib/engine_test.ts](lib/engine_test.ts).

## Structure

```
routes/               pages serveur (accueil, /armes, /labo/[arme], /vehicules, /methode)
islands/WeaponLab.tsx l'unique îlot interactif (cible, arsenal comparatif, readout TTK)
components/Chrome.tsx HUD, nav, pied — 0 JS client
lib/engine.ts         moteur balistique pur (sans DOM, sans valeur en dur)
data/types.ts         types du domaine
data/vehicles.ts      fiches véhicules (éditorial)
data/generated/       snapshot armes généré (ne pas éditer à la main)
scripts/fetch-data.ts pipeline de données
static/styles.css     design system terminal/HUD (hérité de CHAMP LAB)
```

## Licence

MIT. Données armes © communauté BF6-Weapon-Analyzer (créditée dans l'app). BF6 LAB n'est pas affilié à EA ni
DICE ; Battlefield est une marque de ses propriétaires respectifs.
