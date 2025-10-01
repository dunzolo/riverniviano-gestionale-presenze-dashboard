// app/api/attachments/[storage]/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { forwardToLaravelStream } from "@/lib/laravelProxyStream";
import type { NextRequest } from "next/server";

type Params = Promise<{ storage: string }>;

export async function POST(req: NextRequest, { params }: { params: Params }) {
  const { storage } = await params;
  return forwardToLaravelStream(req, `/attachments/${storage}`, { method: "POST" });
}