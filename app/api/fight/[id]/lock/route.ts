import { NextResponse } from "next/server";
import { requireSession } from "@/lib/session";
import { lockFight } from "@/lib/fight/lock";
import { prisma } from "@/lib/prisma";

export const maxDuration = 120;

type Params = Promise<{ id: string }>;

export async function POST(_request: Request, { params }: { params: Params }) {
  let session;
  try {
    session = await requireSession();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  const fight = await prisma.fight.findUnique({
    where: { id },
    select: { fighterAId: true, fighterBId: true },
  });
  if (!fight) {
    return NextResponse.json({ error: "Fight not found" }, { status: 404 });
  }
  if (session.friendId !== fight.fighterAId && session.friendId !== fight.fighterBId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await lockFight(id);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Lock failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
