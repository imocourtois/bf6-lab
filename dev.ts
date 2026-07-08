#!/usr/bin/env -S deno run -A --watch=static/,routes/
import { Builder } from "fresh/dev";

const builder = new Builder();

if (Deno.args.includes("build")) {
  // Build de production (génère le dossier _fresh/).
  await builder.build();
} else {
  // Serveur de dev avec rechargement à chaud.
  await builder.listen(() => import("./main.ts"));
}
