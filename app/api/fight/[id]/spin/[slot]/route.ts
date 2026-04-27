import { NextResponse } from "next/server";
import { requireSession } from "@/lib/session";
import { spinSlot, type Slot } from "@/lib/fight/setup";

const VALID_SLOTS: Slot[] = ["location", "weaponA", "weaponB"];

type Params = Promise<{ id: string; slot: string }>;

export async function POST(_request: Request, { params }: { params: Params }) {
  try {
    await requireSession();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id, slot } = await params;

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
