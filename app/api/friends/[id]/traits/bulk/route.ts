import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import {
  isValidTraitInput,
  normalizeTraitTag,
  tidyDisplayTag,
} from "@/lib/traits";

const Body = z.object({
  tags: z.array(z.string()).min(1).max(200),
});

type Params = Promise<{ id: string }>;

export async function POST(request: Request, { params }: { params: Params }) {
  let session;
  try {
    session = await requireSession();
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

  let inserted = 0;
  let duplicates = 0;
  const invalid: string[] = [];

  for (const raw of parsed.tags) {
    const displayTag = tidyDisplayTag(raw);
    if (!isValidTraitInput(displayTag)) {
      invalid.push(raw);
      continue;
    }
    const tag = normalizeTraitTag(displayTag);
    try {
      await prisma.friendTraitContribution.create({
        data: {
          friendId,
          contributorId: session.friendId,
          tag,
          displayTag,
          kind: "submit",
        },
      });
      inserted++;
    } catch (e: unknown) {
      if (
        typeof e === "object" &&
        e !== null &&
        "code" in e &&
        (e as { code: string }).code === "P2002"
      ) {
        duplicates++;
      } else {
        throw e;
      }
    }
  }

  return NextResponse.json({ inserted, duplicates, invalid });
}
