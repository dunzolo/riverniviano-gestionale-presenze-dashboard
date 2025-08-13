import { forwardToLaravel } from "@/lib/laravelProxy";
import type { NextRequest } from "next/server";

type Params = Promise<{ id: string }>;

export async function GET(req: NextRequest, { params }: { params: Params }) {
  const { id } = await params;
  return forwardToLaravel(req, `/users/${id}`);
}

export async function PUT(req: NextRequest, { params }: { params: Params }) {
  const { id } = await params;
  return forwardToLaravel(req, `/users/${id}`);
}

export async function PATCH(req: NextRequest, { params }: { params: Params }) {
  const { id } = await params;
  return forwardToLaravel(req, `/users/${id}`);
}

export async function DELETE(req: NextRequest, { params }: { params: Params }) {
  const { id } = await params;
  return forwardToLaravel(req, `/users/${id}`);
}