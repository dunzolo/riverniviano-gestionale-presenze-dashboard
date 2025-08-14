import { forwardToLaravel } from "@/lib/laravelProxy";

export async function GET(req: Request) {
  return forwardToLaravel(req, "/seasons");
}

export async function POST(req: Request) {
  return forwardToLaravel(req, "/seasons");
}