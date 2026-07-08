import { define } from "@/utils.ts";
import { WEAPON_IDS } from "@/data/weapons.ts";

// /labo sans arme -> redirige vers la première arme du roster.
export const handler = define.handlers({
  GET() {
    return new Response(null, {
      status: 307,
      headers: { location: `/labo/${WEAPON_IDS[0]}` },
    });
  },
});
