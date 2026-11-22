import { creators } from "@/lib/data";
import { negotiateLive, scripted, Turn } from "@/lib/agents";
import { youSearch } from "@/lib/youcom";

export const dynamic = "force-dynamic";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Streams brand-agent ↔ creator-agent negotiations for all shortlisted creators in parallel (NDJSON).
export async function GET(req: Request) {
  const forceMock = new URL(req.url).searchParams.get("mock") === "1";
  const live = !forceMock && Boolean(process.env.ANTHROPIC_API_KEY);
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (obj: unknown) => controller.enqueue(encoder.encode(JSON.stringify(obj) + "\n"));
      send({ type: "mode", live });

      await Promise.all(
        creators.map(async (c, idx) => {
          send({ type: "thinking", creatorId: c.id, from: "brand" });
          let last: Turn | undefined;
          try {
            if (live) {
              const evidence = await youSearch(`${c.handle} ${c.niche[0]} keyboard`, 2);
              for await (const t of negotiateLive(c, evidence)) {
                send({ type: "turn", creatorId: c.id, turn: t });
                last = t;
                if (t.status !== "accept" && t.status !== "walk")
                  send({ type: "thinking", creatorId: c.id, from: t.from === "brand" ? "creator" : "brand" });
              }
            } else {
              await sleep(400 + idx * 350);
              for (const t of scripted[c.id]) {
                await sleep(1300 + Math.min(t.text.length * 12, 1600));
                send({ type: "turn", creatorId: c.id, turn: t });
                last = t;
                if (t.status !== "accept") send({ type: "thinking", creatorId: c.id, from: t.from === "brand" ? "creator" : "brand" });
              }
            }
          } catch (e) {
            send({ type: "error", creatorId: c.id, message: e instanceof Error ? e.message : String(e) });
          }
          send({ type: "done", creatorId: c.id, outcome: last?.status === "accept" ? "agreed" : "no-deal", terms: last?.terms });
        })
      );
      send({ type: "end" });
      controller.close();
    },
  });

  return new Response(stream, { headers: { "Content-Type": "application/x-ndjson", "Cache-Control": "no-store" } });
}
