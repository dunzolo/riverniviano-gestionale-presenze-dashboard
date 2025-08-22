import { forwardToLaravel } from "@/lib/laravelProxy";
import type { NextRequest } from "next/server";

type Params = Promise<{ session: string; attendance: string }>;

export async function GET(req: NextRequest, { params }: { params: Params }) {
  const { session, attendance } = await params;
  return forwardToLaravel(req, `/sessions/${session}/attendances/${attendance}`); // show
}

export async function PUT(req: NextRequest, { params }: { params: Params }) {
  const { session, attendance } = await params;
  return forwardToLaravel(req, `/sessions/${session}/attendances/${attendance}`); // update
}

export async function PATCH(req: NextRequest, { params }: { params: Params }) {
  const { session, attendance } = await params;
  return forwardToLaravel(req, `/sessions/${session}/attendances/${attendance}`); // update
}

export async function DELETE(req: NextRequest, { params }: { params: Params }) {
  const { session, attendance } = await params;
  return forwardToLaravel(req, `/sessions/${session}/attendances/${attendance}`); // destroy
}