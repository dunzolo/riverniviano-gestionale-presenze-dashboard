import { forwardToLaravel } from "@/lib/laravelProxy";
import type { NextRequest } from "next/server";

type Params = Promise<{ session: string }>;

export async function GET(req: NextRequest, { params }: { params: Params }) {
  const { session } = await params;
  return forwardToLaravel(req, `/sessions/${session}`);
}

export async function PUT(req: NextRequest, { params }: { params: Params }) {
  const { session } = await params;
  return forwardToLaravel(req, `/sessions/${session}`);
}

export async function PATCH(req: NextRequest, { params }: { params: Params }) {
  const { session } = await params;
  return forwardToLaravel(req, `/sessions/${session}`);
}

export async function DELETE(req: NextRequest, { params }: { params: Params }) {
  const { session } = await params;
  return forwardToLaravel(req, `/sessions/${session}`);
}