import { forwardToLaravel } from "@/lib/laravelProxy";
import type { NextRequest } from "next/server";

type Params = Promise<{ session: string }>;

export async function POST(req: NextRequest, { params }: { params: Params }) {
  const { session } = await params;
  return forwardToLaravel(req, `/sessions/${session}/attendances/bulk-update`);
}