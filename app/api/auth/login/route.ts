import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createSession, setSessionCookie } from "@/lib/session";

const Body = z.object({
  name: z.string().min(1).max(64),
  password: z.string().min(1).max(256),
});

export async function POST(request: Request) {
  let parsed;
  try {
    parsed = Body.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const friend = await prisma.friend.findUnique({
    where: { name: parsed.name },
    select: { id: true, name: true, hashedPassword: true },
  });
  if (!friend) {
    return NextResponse.json({ error: "Wrong name or password" }, { status: 401 });
  }

  const ok = await bcrypt.compare(parsed.password, friend.hashedPassword);
  if (!ok) {
    return NextResponse.json({ error: "Wrong name or password" }, { status: 401 });
  }

  const token = await createSession({ friendId: friend.id, name: friend.name });
  await setSessionCookie(token);
  return NextResponse.json({ ok: true });
}
