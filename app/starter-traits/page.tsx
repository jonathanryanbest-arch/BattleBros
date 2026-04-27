import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { OperatorPanel } from "@/components/OperatorPanel";

export const dynamic = "force-dynamic";

export default async function OperatorPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const friends = await prisma.friend.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, heightInches: true, weightLbs: true },
  });

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="mx-auto max-w-2xl px-6 py-10 space-y-6">
        <Link href="/roster" className="text-sm text-neutral-400 hover:text-neutral-200">
          ← Roster
        </Link>

        <header className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Operator</h1>
          <p className="text-sm text-neutral-400">
            Pick a friend, set their height and weight, and bulk-seed starter
            traits. Skips the sanity gate and the daily rate limit — meant for
            curated bootstrap content.
          </p>
        </header>

        <OperatorPanel friends={friends} />
      </div>
    </main>
  );
}
