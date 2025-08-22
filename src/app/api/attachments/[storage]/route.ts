// src/app/api/attachments/[storage]/route.ts
import { forwardToLaravel } from "@/lib/laravelProxy";
import type { NextRequest } from "next/server";

type Params = Promise<{ storage: string }>;

export const runtime = "nodejs"; // consigliato per stream FormData

export async function POST(req: NextRequest, { params }: { params: Params }) {
  const { storage } = await params;
  return forwardToLaravel(req, `/attachments/${storage}`, { method: "POST" });
}