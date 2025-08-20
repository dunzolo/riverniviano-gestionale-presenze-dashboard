import { forwardToLaravel } from "@/lib/laravelProxy";

export async function GET(req: Request) {
  return forwardToLaravel(req, "/training-scopes/all");
}