import { forwardToLaravel } from "@/lib/laravelProxy";
import type { NextRequest } from "next/server";

type Params = Promise<{ season: string }>;

export async function GET(req: NextRequest, { params }: { params: Params }) {
  const { season } = await params;
  return forwardToLaravel(req, `/seasons/${season}/season-teams`);
}

export async function POST(req: NextRequest, { params }: { params: Params }) {
  const { season } = await params;
  return forwardToLaravel(req, `/seasons/${season}/season-teams`);
}