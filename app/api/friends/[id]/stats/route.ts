import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

const Body = z.object({
  heightInches: z.number().int().min(36).max(96).nullable(),
  weightLbs: z.number().int().min(40).max(600).nullable(),
});

type Params = Promise<{ id: string }>;

export async function POST(request: Request, { params }: { params: Params }) {
  try {
    await requireSession();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: friendId } = await params;

  let parsed;
  try {
    parsed = Body.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const friend = await prisma.friend.findUnique({
    where: { id: friendId },
    select: { id: true },
  });
  if (!friend) {
    return NextResponse.json({ error: "Friend not found" }, { status: 404 });
  }

  await prisma.friend.update({
    where: { id: friendId },
    data: {
      heightInches: parsed.heightInches,
      weightLbs: parsed.weightLbs,
    },
  });

  return NextResponse.json({ ok: true });
}
