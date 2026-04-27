import { NextResponse } from "next/server";
import { requireSession } from "@/lib/session";
import { lockFight } from "@/lib/fight/lock";

export const maxDuration = 120;

type Params = Promise<{ id: string }>;

export async function POST(_request: Request, { params }: { params: Params }) {
  try {
    await requireSession();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  try {
    await lockFight(id);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Lock failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
