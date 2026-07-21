# BF6 LAB — ce que font vraiment tes armes & véhicules

**Site en ligne : <https://simon256px.github.io/bf6-lab/>**

Fiches balistiques Battlefield 6: profil de dégâts par distance, TTK réel contre une cible réglable,
comparaison de tout l'arsenal, garage véhicules. **Deno 2 + Fresh 2**, look
terminal/HUD 100 % CSS, philosophie: sobre, honnête, statique. Pas de stats joueur, pas de pub, pas de
tracker.

<img width="1175" height="882" alt="bf6" src="https://github.com/user-attachments/assets/97d64150-24b7-4a5b-ba87-22e6192b1fa3" />

## Les pages

| Page                       | Contenu                                                                                                       |
| -------------------------- | ------------------------------------------------------------------------------------------------------------- |
| **Accueil** `/`            | Présentation + les 5 TTK les plus rapides à 30 m torse                                                        |
| **Armes** `/armes`         | Roster complet (58 armes), groupé par classe : assaut, carabine, SMG, LMG, DMR, sniper, pompe, poing          |
| **Labo** `/labo/[arme]`    | La page centrale : fiche technique, courbe de dégâts 0–150 m, cible réglable, arsenal comparatif, readout TTK |
| **Véhicules** `/vehicules` | Garage par classe (chars, IFV, hélicos, jets, AA, transports, motos) : places, armement, contre-mesures       |
| **Méthode** `/methode`     | Sources des données, formules du modèle, limites assumées                                                     |

### Le labo en détail

- **CIBLE** — distance (0–150 m), PV (50–150), zone de tir (torse / +1 tête / tout tête), temps de vol
  optionnel. Le readout affiche le TTK, les balles nécessaires, la répartition tête/corps et l'état du
  chargeur.
- **ARSENAL** — les 58 armes triées du TTK le plus rapide au plus lent _contre ta cible actuelle_. En **MODE
  IMPACT**, chaque arme affiche son Δ TTK face à l'arme sélectionnée — vert = elle tue plus vite, rouge = plus
  lentement.
- **Honnêteté d'affichage** — quand la source ne renseigne pas une valeur (ex. cadence de certains pompes), le
  site affiche « non renseignée » plutôt qu'un chiffre inventé.

Un seul composant est hydraté côté client ([islands/WeaponLab.tsx](islands/WeaponLab.tsx)) ; tout le reste est
rendu serveur, sans JavaScript.

## D'où viennent les données

Il n'existe **aucune API officielle EA / DICE** pour les données de jeu, et les API communautaires
(gametools.network, tracker.gg) ne couvrent que les stats joueur.

| Données        | Source                                                                                                                            | Mise à jour                 |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| Armes (58)     | [BF6-Weapon-Analyzer](https://github.com/raymdl/BF6-Weapon-Analyzer) (raymdl) — valeurs extraites du jeu, suivies patch par patch | `deno task data -- <patch>` |
| Véhicules (15) | Fiches éditoriales maintenues à la main ([data/vehicles.ts](data/vehicles.ts)), jauges indicatives                                | à la main, PR bienvenues    |

Les données sont figées dans un snapshot versionné et commité
([data/generated/weapons.gen.ts](data/generated/weapons.gen.ts)) : le site ne fait aucun appel réseau en
dehors de ses propres fichiers. À chaque patch :

```sh
deno task data -- 1.3.4.0
```

## Le modèle TTK (résumé)

- Dégâts **interpolés linéairement** entre les paliers de distance du jeu.
- **BTK** = ⌈PV / dégâts⌉, tirs à la tête alloués en premier, au multiplicateur propre à l'arme (1,34 par
  défaut ; 1,5 DMR ; 1,75 snipers ; 1,0 pompes).
- **TTK** = temps entre le premier et le dernier tir, cycles de rafale compris ; temps de vol
  `distance / vélocité` en option.
- **Non modélisé, et assumé** : recul, dispersion, tirs manqués, multiplicateurs de membres, ADS, latence. Le
  TTK affiché est un plancher théorique, fait pour **comparer** les armes.

Moteur pur dans [lib/engine.ts](lib/engine.ts), testé par [lib/engine_test.ts](lib/engine_test.ts).

## Développement

```sh
deno task dev     # serveur de dev avec rechargement à chaud (port 8000)
deno task check   # fmt + lint + types
deno task test    # tests du moteur balistique
deno task build   # build de production (_fresh/)
```

## Déploiement — GitHub Pages

Le site est **pré-rendu en statique** : toutes les routes sont énumérables, donc
[scripts/build-static.ts](scripts/build-static.ts) fige chaque page en HTML via le handler de production Fresh
et copie les assets buildés dans `dist/`, en préfixant les URL internes du sous-chemin Pages
(`BASE_PATH=/bf6-lab`).

Le workflow [.github/workflows/pages.yml](.github/workflows/pages.yml) vérifie, teste, builde et publie
automatiquement à chaque push sur `main`. Pour reproduire en local :

```sh
deno task build
BASE_PATH=/bf6-lab deno run -A scripts/build-static.ts   # → dist/
```

## Structure

```
routes/                 pages serveur (/, /armes, /labo/[arme], /vehicules, /methode)
islands/WeaponLab.tsx   l'unique îlot interactif (cible, arsenal comparatif, readout TTK)
components/Chrome.tsx   HUD, nav, bandeau snapshot, pied — 0 JS client
lib/engine.ts           moteur balistique pur (sans DOM, sans valeur en dur)
data/types.ts           types du domaine
data/vehicles.ts        fiches véhicules (éditorial)
data/generated/         snapshot armes généré — ne pas éditer à la main
scripts/fetch-data.ts   pipeline de données (source → snapshot)
scripts/build-static.ts export statique pour GitHub Pages
static/styles.css       design system terminal/HUD (cadres, dithering, scanlines)
```

## Licence & affiliation

Code sous licence [MIT](LICENSE). Données armes © communauté BF6-Weapon-Analyzer, créditée dans l'app et
ci-dessus. BF6 LAB n'est pas affilié à EA ni DICE ; Battlefield est une marque de ses propriétaires
respectifs.
