import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { normalizeTraitTag } from "@/lib/traits";
import { refreshFriendSnapshot } from "@/lib/cron/refresh-traits";

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

  try {
    await prisma.friendTraitContribution.create({
      data: {
        friendId,
        contributorId: session.friendId,
        tag,
        displayTag: existing.displayTag,
        kind: "upvote",
      },
    });
  } catch (e: unknown) {
    if (typeof e === "object" && e !== null && "code" in e && (e as { code: string }).code === "P2002") {
      return NextResponse.json({ ok: true, alreadyUpvoted: true });
    }
    throw e;
  }

  try {
    await refreshFriendSnapshot(friendId);
  } catch (e) {
    console.error("inline snapshot refresh failed", e);
  }

  return NextResponse.json({ ok: true });
}
