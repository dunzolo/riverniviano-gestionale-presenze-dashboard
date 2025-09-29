// Usa Node runtime per avere accesso allo stream di request
export const runtime = "nodejs";
// Evita caching e qualunque prelettura
export const dynamic = "force-dynamic";

import { forwardToLaravelStream } from "@/lib/laravelProxyStream";
import type { NextRequest } from "next/server";

type Params = Promise<{ storage: string }>;

export async function POST(req: NextRequest, { params }: { params: Params }) {
  const { storage } = await params;
  // Pass-through verso Laravel
  return forwardToLaravelStream(req, `/attachments/${storage}`, { method: "POST" });
}