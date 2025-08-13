import { forwardToLaravel } from "@/lib/laravelProxy";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  return forwardToLaravel(req, `/users/${params.id}`);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  return forwardToLaravel(req, `/users/${params.id}`);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  return forwardToLaravel(req, `/users/${params.id}`);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  return forwardToLaravel(req, `/users/${params.id}`);
}