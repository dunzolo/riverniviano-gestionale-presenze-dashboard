import { forwardToLaravel } from "@/lib/laravelProxy";
import type { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  // Pass-through: body JSON { season_id, media_id? }
  return forwardToLaravel(req, "/players/import", { method: "POST" });
}