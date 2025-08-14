import { forwardToLaravel } from "@/lib/laravelProxy";
import type { NextRequest } from "next/server";

type Params = Promise<{ season: string; season_team: string }>;

export async function GET(req: NextRequest, { params }: { params: Params }) {
  const { season, season_team } = await params;
  return forwardToLaravel(req, `/seasons/${season}/season-teams/${season_team}`); // show
}

export async function PUT(req: NextRequest, { params }: { params: Params }) {
  const { season, season_team } = await params;
  return forwardToLaravel(req, `/seasons/${season}/season-teams/${season_team}`); // update
}

export async function PATCH(req: NextRequest, { params }: { params: Params }) {
  const { season, season_team } = await params;
  return forwardToLaravel(req, `/seasons/${season}/season-teams/${season_team}`); // update
}

export async function DELETE(req: NextRequest, { params }: { params: Params }) {
  const { season, season_team } = await params;
  return forwardToLaravel(req, `/seasons/${season}/season-teams/${season_team}`); // destroy
}