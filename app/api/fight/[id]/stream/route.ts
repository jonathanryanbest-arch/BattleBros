import { runFightStream } from "@/lib/fight/narrate";
import { requireSession } from "@/lib/session";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;

function sse(data: unknown): Uint8Array {
  return new TextEncoder().encode(`data: ${JSON.stringify(data)}\n\n`);
}

export async function GET(_request: Request, { params }: { params: Params }) {
  try {
    await requireSession();
  } catch {
    return new Response("Unauthorized", { status: 401 });
  }
  const { id } = await params;

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const event of runFightStream(id)) {
          controller.enqueue(sse(event));
        }
        controller.enqueue(sse({ type: "end" }));
      } catch (e) {
        const message = e instanceof Error ? e.message : "Stream failed";
        controller.enqueue(sse({ type: "error", message }));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
