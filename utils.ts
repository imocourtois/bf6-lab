import { createDefine } from "fresh";

/** État partagé accessible dans les routes et handlers (vide pour l'instant). */
// deno-lint-ignore no-empty-interface
export interface State {}

export const define = createDefine<State>();
