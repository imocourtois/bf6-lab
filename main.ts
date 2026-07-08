import { App, staticFiles } from "fresh";
import type { State } from "@/utils.ts";

export const app = new App<State>()
  // staticFiles() est requis avec le routing par fichiers :
  // sinon le JS des îlots n'est pas servi au navigateur.
  .use(staticFiles())
  .fsRoutes();

if (import.meta.main) {
  await app.listen();
}
