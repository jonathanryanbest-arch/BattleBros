import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { isValidTraitInput, normalizeTraitTag, tidyDisplayTag, TRAIT_MAX_LENGTH } from "@/lib/traits";
import { runSanityGate } from "@/lib/prompts/sanity-gate";

const Body = z.object({
  tag: z.string().min(1).max(120),
});

type Params = Promise<{ id: string }>;

function startOfTodayUtc(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

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

  const displayTag = tidyDisplayTag(parsed.tag);
  if (!isValidTraitInput(displayTag)) {
    return NextResponse.json(
      { error: `Tag must be 1–${TRAIT_MAX_LENGTH} characters of letters/numbers.` },
      { status: 400 },
    );
  }

  const friend = await prisma.friend.findUnique({
    where: { id: friendId },
    select: { id: true },
  });
  if (!friend) {
    return NextResponse.json({ error: "Friend not found" }, { status: 404 });
  }

  // Rate limit: 1 submit per (contributor, friend) per UTC day.
  const since = startOfTodayUtc();
  const existingToday = await prisma.friendTraitContribution.findFirst({
    where: {
      friendId,
      contributorId: session.friendId,
      kind: "submit",
      createdAt: { gte: since },
    },
    select: { id: true },
  });
  if (existingToday) {
    return NextResponse.json(
      { error: "Already submitted a trait for this friend today. Try again tomorrow." },
      { status: 429 },
    );
  }

  // Sanity gate.
  let verdict;
  try {
    verdict = await runSanityGate(displayTag);
  } catch (e) {
    console.error("sanity-gate failed", e);
    return NextResponse.json({ error: "Could not validate the tag right now." }, { status: 503 });
  }
  if (verdict.decision === "reject") {
    return NextResponse.json(
      { error: verdict.reason ?? "That trait can't be submitted." },
      { status: 422 },
    );
  }

  const tag = normalizeTraitTag(displayTag);
  await prisma.friendTraitContribution.create({
    data: {
      friendId,
      contributorId: session.friendId,
      tag,
      displayTag,
      kind: "submit",
    },
  });

  return NextResponse.json({
    ok: true,
    tag,
    displayTag,
    appliesAt: "next-nightly-refresh",
  });
}
