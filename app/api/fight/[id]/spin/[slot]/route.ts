import { NextResponse } from "next/server";
import { requireSession } from "@/lib/session";
import { spinSlot, type Slot } from "@/lib/fight/setup";
import { prisma } from "@/lib/prisma";

const VALID_SLOTS: Slot[] = ["location", "weaponA", "weaponB"];

type Params = Promise<{ id: string; slot: string }>;

export async function POST(_request: Request, { params }: { params: Params }) {
  let session;
  try {
    session = await requireSession();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id, slot } = await params;

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

  if (!VALID_SLOTS.includes(slot as Slot)) {
    return NextResponse.json({ error: "Unknown slot" }, { status: 400 });
  }
  try {
    await spinSlot(id, slot as Slot);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Re-roll failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
