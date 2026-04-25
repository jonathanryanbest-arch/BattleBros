import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { normalizeTraitTag, tidyDisplayTag } from "@/lib/traits";

type Params = Promise<{ id: string; traitTag: string }>;

export async function POST(_request: Request, { params }: { params: Params }) {
  let session;
  try {
    session = await requireSession();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: friendId, traitTag } = await params;
  const tag = normalizeTraitTag(decodeURIComponent(traitTag));
  if (!tag) {
    return NextResponse.json({ error: "Invalid tag" }, { status: 400 });
  }

  // Make sure the tag exists for this friend (i.e. somebody has already submitted it).
  const existing = await prisma.friendTraitContribution.findFirst({
    where: { friendId, tag, kind: "submit" },
    select: { displayTag: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "No such trait for this friend" }, { status: 404 });
  }

  // Idempotent: already upvoted?
  const already = await prisma.friendTraitContribution.findFirst({
    where: {
      friendId,
      tag,
      kind: "upvote",
      contributorId: session.friendId,
    },
    select: { id: true },
  });
  if (already) {
    return NextResponse.json({ ok: true, alreadyUpvoted: true });
  }

  await prisma.friendTraitContribution.create({
    data: {
      friendId,
      contributorId: session.friendId,
      tag,
      displayTag: tidyDisplayTag(existing.displayTag),
      kind: "upvote",
    },
  });

  return NextResponse.json({ ok: true });
}
