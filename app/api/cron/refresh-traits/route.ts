import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { refreshAllProfiles } from "@/lib/cron/refresh-traits";

// Long-running: each friend's emergent-content derivation is a Claude call.
export const maxDuration = 300;
export const dynamic = "force-dynamic";

function authorized(request: Request): boolean {
  const expected = process.env.CRON_SECRET;
  if (!expected) {
    if (process.env.NODE_ENV === "production") return false;
    return true;
  }
  const header = request.headers.get("authorization");
  if (!header) return false;
  const provided = header.startsWith("Bearer ") ? header.slice("Bearer ".length) : header;
  try {
    return timingSafeEqual(
      Buffer.from(provided),
      Buffer.from(expected),
    );
  } catch {
    return false;
  }
}

async function handle(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const summaries = await refreshAllProfiles();
  return NextResponse.json({
    ok: true,
    refreshed: summaries.length,
    summaries,
  });
}

export async function GET(request: Request) {
  return handle(request);
}

export async function POST(request: Request) {
  return handle(request);
}
