import { define } from "@/utils.ts";

export default define.page(function App({ Component }) {
  return (
    <html lang="fr">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>BF6 // LAB — ce que font vraiment tes armes &amp; véhicules</title>
        <meta
          name="description"
          content="Fiches balistiques Battlefield 6 : dégâts par distance, TTK réel, garage véhicules. Données communautaires versionnées par patch. Open source, sobre, propulsé par Deno/Fresh."
        />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="stylesheet" href="/styles.css" />
      </head>
      <body>
        <Component />
      </body>
    </html>
  );
});
