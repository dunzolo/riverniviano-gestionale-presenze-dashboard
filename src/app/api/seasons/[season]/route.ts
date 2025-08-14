import { forwardToLaravel } from "@/lib/laravelProxy";
import type { NextRequest } from "next/server";

type Params = Promise<{ season: string }>;

export async function GET(req: NextRequest, { params }: { params: Params }) {
  const { season } = await params;
  return forwardToLaravel(req, `/seasons/${season}`);
}

export async function PUT(req: NextRequest, { params }: { params: Params }) {
  const { season } = await params;
  return forwardToLaravel(req, `/seasons/${season}`);
}

export async function PATCH(req: NextRequest, { params }: { params: Params }) {
  const { season } = await params;
  return forwardToLaravel(req, `/seasons/${season}`);
}

export async function DELETE(req: NextRequest, { params }: { params: Params }) {
  const { season } = await params;
  return forwardToLaravel(req, `/seasons/${season}`);
}