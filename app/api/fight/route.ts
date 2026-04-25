import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { rollLocation, rollWeapon } from "@/lib/fight/setup";

const Body = z.object({
  fighterAId: z.string().min(1),
  fighterBId: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    await requireSession();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let parsed;
  try {
    parsed = Body.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  if (parsed.fighterAId === parsed.fighterBId) {
    return NextResponse.json({ error: "Pick two different fighters" }, { status: 400 });
  }

  const fighters = await prisma.friend.findMany({
    where: { id: { in: [parsed.fighterAId, parsed.fighterBId] } },
    select: { id: true, status: true },
  });
  if (fighters.length !== 2) {
    return NextResponse.json({ error: "Fighter not found" }, { status: 404 });
  }
  for (const f of fighters) {
    if (f.status !== "unlocked") {
      return NextResponse.json(
        { error: "Both fighters must be unlocked (5+ traits each)." },
        { status: 400 },
      );
    }
  }

  const locationKey = await rollLocation(parsed.fighterAId, parsed.fighterBId);
  const [weaponAKey, weaponBKey] = await Promise.all([
    rollWeapon(parsed.fighterAId, locationKey),
    rollWeapon(parsed.fighterBId, locationKey),
  ]);

  const fight = await prisma.fight.create({
    data: {
      fighterAId: parsed.fighterAId,
      fighterBId: parsed.fighterBId,
      locationKey,
      weaponAKey,
      weaponBKey,
      status: "spinning",
    },
  });

  return NextResponse.json({ ok: true, fightId: fight.id });
}
