"use client";

import { useEffect, useRef, useState } from "react";
import { campaign, creators, funnel, Creator, Terms } from "@/lib/data";
import type { Turn } from "@/lib/agents";
import type { Evidence } from "@/lib/youcom";

type Step = 1 | 2 | 3;
type Lane = { turns: Turn[]; thinking: "brand" | "creator" | null; outcome?: "agreed" | "no-deal"; terms?: Terms; error?: string };

const fmt = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K` : String(n));

export default function Home() {
  const [step, setStep] = useState<Step>(1);
  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-8">
      {/* Top bar: logo and step tabs */}
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-black text-sm font-bold text-white">PF</div>
          <span className="text-lg font-semibold">Product Finder</span>
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-800">agentic marketplace</span>
        </div>
        <nav className="flex gap-1 rounded-full bg-white p-1 text-sm shadow-sm">
          {(["Brand brief", "AI screening", "Agent negotiation"] as const).map((label, i) => (
            <button
              key={label}
              onClick={() => setStep((i + 1) as Step)}
              className={`rounded-full px-4 py-1.5 ${step === i + 1 ? "bg-black text-white" : "text-neutral-600 hover:bg-neutral-100"}`}
            >
              {i + 1}. {label}
            </button>
          ))}
        </nav>
      </header>
      {step === 1 && <Brief onNext={() => setStep(2)} />}
      {step === 2 && <Screening onNext={() => setStep(3)} />}
      {step === 3 && <Negotiation />}
    </main>
  );
}

function Brief({ onNext }: { onNext: () => void }) {
  const t = campaign.openingTerms;
  const rows: [string, string][] = [
    ["SKU", campaign.sku],
    ["Compatibility", campaign.compatibility],
    ["Deliverable", t.deliverable],
    ["Flat fee", `$${t.fee} USD`],
    ["Deadline", t.deadline],
    ["Usage rights", t.usageRights],
    ["Sample", t.keepSample ? "Creator keeps the unit" : "Loaner, return required"],
    ["Ships to", campaign.shipTo],
    ["Sample slots", String(campaign.samples)],
    ["Posting required", campaign.type === "Brand-owned content" ? "No, brand-owned content" : "Yes"],
  ];
  return (
    <section className="pop grid gap-6 lg:grid-cols-[1.2fr_1fr]">
      {/* Campaign card: product, pitch and goals */}
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <p className="text-sm text-neutral-500">{campaign.brand} · {campaign.category} · {campaign.type}</p>
        <h1 className="mt-1 text-3xl font-semibold">{campaign.product}</h1>
        <p className="mt-3 text-neutral-700">{campaign.pitch}</p>
        <div className="mt-6 aspect-[16/7] rounded-xl bg-gradient-to-br from-neutral-800 to-neutral-950 p-6 text-white">
          <div className="text-xs uppercase tracking-widest text-neutral-400">Launch Dec 12</div>
          <div className="mt-2 text-2xl font-semibold">28 dB. Type at 2am.</div>
          <div className="mt-6 grid grid-cols-10 gap-1 opacity-80">
            {Array.from({ length: 40 }).map((_, i) => (
              <div key={i} className="h-5 rounded bg-neutral-700" />
            ))}
          </div>
        </div>
        <h3 className="mt-6 font-medium">What the brand wants</h3>
        <ul className="mt-2 space-y-1 text-sm text-neutral-700">
          {campaign.goals.map((g) => <li key={g}>• {g}</li>)}
        </ul>
      </div>
      {/* Offer terms panel */}
      <div className="flex flex-col rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="font-semibold">Offer terms (visible to every creator)</h2>
        <dl className="mt-4 divide-y text-sm">
          {rows.map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 py-2">
              <dt className="text-neutral-500">{k}</dt>
              <dd className="text-right font-medium">{v}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-4 rounded-lg bg-amber-50 p-3 text-xs text-amber-900">Creators keep full control of their opinions. Endorsement disclosure required.</div>
        <div className="mt-auto pt-6">
          <div className="mb-3 flex items-center justify-between text-sm">
            <span className="text-neutral-500">Published Nov 15 · status</span>
            <span className="font-semibold text-emerald-700">1,247 applications</span>
          </div>
          <button onClick={onNext} className="w-full rounded-xl bg-black py-3 font-medium text-white hover:bg-neutral-800">
            Screen applicants with AI →
          </button>
        </div>
      </div>
    </section>
  );
}

function Screening({ onNext }: { onNext: () => void }) {
  const [shown, setShown] = useState(0);
  const [evidence, setEvidence] = useState<Record<string, Evidence[]>>({});
  const [live, setLive] = useState<boolean | null>(null);

  useEffect(() => {
    const id = setInterval(() => setShown((s) => (s < funnel.length ? s + 1 : s)), 450);
    fetch("/api/screen")
      .then((r) => r.json())
      .then((d) => {
        setLive(d.live);
        setEvidence(Object.fromEntries(d.results.map((r: { id: string; evidence: Evidence[] }) => [r.id, r.evidence])));
      })
      .catch(() => setLive(false));
    return () => clearInterval(id);
  }, []);

  const max = funnel[0].count;
  return (
    <section className="pop grid gap-6 lg:grid-cols-[1fr_1.4fr]">
      {/* Screening funnel: 1,247 applications down to 3 */}
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Decision engine</h2>
          <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs text-violet-800">powered by You.com</span>
        </div>
        <div className="mt-5 space-y-3">
          {funnel.map((f, i) => (
            <div key={f.label} className={`transition-opacity duration-500 ${i < shown ? "opacity-100" : "opacity-0"}`}>
              <div className="flex justify-between text-sm">
                <span>{f.label}</span>
                <span className="font-mono font-semibold">{f.count.toLocaleString()}</span>
              </div>
              <div className="mt-1 h-2 rounded-full bg-neutral-100">
                <div
                  className="h-2 rounded-full bg-black transition-all duration-700"
                  style={{ width: i < shown ? `${Math.max((f.count / max) * 100, 1.5)}%` : "0%" }}
                />
              </div>
            </div>
          ))}
        </div>
        <p className="mt-6 text-xs text-neutral-500">
          Ranked by product-to-portfolio relevance, not follower count. Inferred politics and income are never used.
        </p>
      </div>
      {/* Shortlist cards with match reasons and web evidence */}
      <div className="space-y-3">
        {creators.map((c) => (
          <CreatorCard key={c.id} c={c} evidence={evidence[c.id]} live={live} />
        ))}
        <button onClick={onNext} className="w-full rounded-xl bg-black py-3 font-medium text-white hover:bg-neutral-800">
          Start agent negotiation with all 3 →
        </button>
      </div>
    </section>
  );
}

function Avatar({ c, size = "h-10 w-10" }: { c: Creator; size?: string }) {
  const hue = { maya: "bg-rose-200 text-rose-900", jordan: "bg-sky-200 text-sky-900", priya: "bg-amber-200 text-amber-900" }[c.id];
  return <div className={`grid shrink-0 place-items-center rounded-full text-sm font-semibold ${size} ${hue}`}>{c.avatar}</div>;
}

function CreatorCard({ c, evidence, live }: { c: Creator; evidence?: Evidence[]; live: boolean | null }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <Avatar c={c} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2">
            <span className="font-semibold">{c.name}</span>
            <span className="text-sm text-neutral-500">{c.handle} · {c.platform}</span>
          </div>
          <div className="text-xs text-neutral-500" title={c.followersSource}>
            {fmt(c.followers)} followers · {fmt(c.avgViews)} avg views · source: {c.followersSource}
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-semibold">{c.matchScore}</div>
          <div className="text-[10px] uppercase text-neutral-500">match</div>
        </div>
      </div>
      <ul className="mt-3 space-y-1 text-sm">
        {c.matchReasons.map((r) => (
          <li key={r} className="flex gap-2"><span className="text-emerald-600">✓</span>{r}</li>
        ))}
      </ul>
      <div className="mt-3 flex gap-2 overflow-x-auto">
        {c.portfolio.map((p) => (
          <div key={p.title} className="w-40 shrink-0 rounded-lg bg-neutral-100 p-2 text-xs">
            <div className="mb-1 aspect-[9/12] max-h-16 rounded bg-neutral-300" />
            <div className="line-clamp-2 font-medium">{p.title}</div>
            <div className="text-neutral-500">{fmt(p.views)} views · {p.date}</div>
          </div>
        ))}
      </div>
      <div className="mt-3 border-t pt-2 text-xs">
        <span className="text-violet-700">You.com evidence: </span>
        {live === null && <span className="text-neutral-400">searching…</span>}
        {live === false && <span className="text-neutral-400">demo mode (add YDC_API_KEY for live search)</span>}
        {live && evidence?.length === 0 && <span className="text-neutral-400">no public results</span>}
        {live && evidence?.slice(0, 2).map((e) => (
          <a key={e.url} href={e.url} target="_blank" rel="noreferrer" className="mr-3 underline decoration-neutral-300 hover:decoration-black">
            {e.title.slice(0, 60)}
          </a>
        ))}
      </div>
    </div>
  );
}

function Negotiation() {
  const [lanes, setLanes] = useState<Record<string, Lane>>(() =>
    Object.fromEntries(creators.map((c) => [c.id, { turns: [], thinking: null }]))
  );
  const [live, setLive] = useState<boolean | null>(null);
  const [running, setRunning] = useState(false);
  const [approved, setApproved] = useState<Record<string, boolean>>({});
  const started = useRef(false);

  async function run(mock = false) {
    setRunning(true);
    setApproved({});
    setLanes(Object.fromEntries(creators.map((c) => [c.id, { turns: [], thinking: null }])));
    const res = await fetch(`/api/negotiate${mock ? "?mock=1" : ""}`);
    const reader = res.body!.getReader();
    const dec = new TextDecoder();
    let buf = "";
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      const lines = buf.split("\n");
      buf = lines.pop()!;
      for (const line of lines) {
        if (!line) continue;
        const ev = JSON.parse(line);
        if (ev.type === "mode") setLive(ev.live);
        if (!ev.creatorId) continue;
        setLanes((prev) => {
          const l = { ...prev[ev.creatorId] };
          if (ev.type === "thinking") l.thinking = ev.from;
          if (ev.type === "turn") { l.turns = [...l.turns, ev.turn]; l.thinking = null; }
          if (ev.type === "done") { l.outcome = ev.outcome; l.terms = ev.terms; l.thinking = null; }
          if (ev.type === "error") l.error = ev.message;
          return { ...prev, [ev.creatorId]: l };
        });
      }
    }
    setRunning(false);
  }

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    run();
  }, []);

  const agreed = creators.filter((c) => lanes[c.id].outcome === "agreed");
  const total = agreed.reduce((s, c) => s + (lanes[c.id].terms?.fee ?? 0), 0);

  return (
    <section className="pop">
      {/* Negotiation header: brand agent status and run controls */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-black px-5 py-4 text-white">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-white text-sm font-bold text-black">HW</div>
          <div>
            <div className="font-semibold">Hushwerk brand agent</div>
            <div className="text-xs text-neutral-400">Negotiating with 3 creator agents in parallel · budget cap private</div>
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className={`rounded-full px-2 py-0.5 text-xs ${live ? "bg-emerald-500/20 text-emerald-300" : "bg-neutral-700 text-neutral-300"}`}>
            {live === null ? "connecting" : live ? "live Claude agents" : "replay mode"}
          </span>
          <button disabled={running} onClick={() => run()} className="rounded-full bg-white px-4 py-1.5 text-black disabled:opacity-40">
            {running ? "Negotiating…" : "Re-run"}
          </button>
        </div>
      </div>

      {/* Three negotiation lanes, one per creator */}
      <div className="grid gap-4 lg:grid-cols-3">
        {creators.map((c) => (
          <LaneView key={c.id} c={c} lane={lanes[c.id]} approved={approved[c.id]} onApprove={() => setApproved((a) => ({ ...a, [c.id]: true }))} />
        ))}
      </div>

      {/* Deal summary bar */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white px-5 py-4 shadow-sm">
        <div className="text-sm">
          <span className="font-semibold">{agreed.length}/3 deals agreed by agents</span>
          <span className="text-neutral-500"> · total ${total.toLocaleString()} · avg ${agreed.length ? Math.round(total / agreed.length) : 0} per video</span>
        </div>
        <div className="text-xs text-neutral-500">Agents shortlist and draft. Brand and creator approve every final term sheet.</div>
      </div>
    </section>
  );
}

function LaneView({ c, lane, approved, onApprove }: { c: Creator; lane: Lane; approved?: boolean; onApprove: () => void }) {
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    box.current?.scrollTo({ top: box.current.scrollHeight, behavior: "smooth" });
  }, [lane.turns.length, lane.thinking]);
  const base = campaign.openingTerms;

  return (
    <div className="flex h-[620px] flex-col rounded-2xl bg-white shadow-sm">
      {/* Lane header: creator identity */}
      <div className="flex items-center gap-3 border-b px-4 py-3">
        <Avatar c={c} size="h-9 w-9" />
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold">{c.name}&apos;s agent</div>
          <div className="text-xs text-neutral-500">{c.handle} · {fmt(c.followers)}</div>
        </div>
        <StatusPill lane={lane} />
      </div>
      {/* Chat transcript between brand agent and creator agent */}
      <div ref={box} className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
        {lane.turns.map((t, i) => (
          <div key={i} className={`pop flex ${t.from === "brand" ? "justify-start" : "justify-end"}`}>
            <div className={`max-w-[88%] rounded-2xl px-3 py-2 text-sm ${t.from === "brand" ? "rounded-bl-sm bg-neutral-100" : "rounded-br-sm bg-black text-white"}`}>
              <div className={`mb-0.5 text-[10px] uppercase tracking-wide ${t.from === "brand" ? "text-neutral-500" : "text-neutral-400"}`}>
                {t.from === "brand" ? "Hushwerk agent" : `${c.name.split(" ")[0]}'s agent`} · {t.status}
              </div>
              {t.text}
              <div className="mt-1.5 flex flex-wrap gap-1">
                <Chip on={t.status === "accept"}>${t.terms.fee}</Chip>
                {t.terms.deadline !== base.deadline && <Chip on={t.status === "accept"}>{t.terms.deadline}</Chip>}
                {t.terms.usageRights !== base.usageRights && <Chip on={t.status === "accept"}>{t.terms.usageRights.replace("Organic + paid ads, ", "ads ")}</Chip>}
              </div>
            </div>
          </div>
        ))}
        {lane.thinking && (
          <div className={`flex ${lane.thinking === "brand" ? "justify-start" : "justify-end"}`}>
            <div className="rounded-2xl bg-neutral-100 px-3 py-2 text-lg leading-none">
              <span className="dot">•</span><span className="dot">•</span><span className="dot">•</span>
            </div>
          </div>
        )}
        {lane.error && <div className="text-xs text-red-600">{lane.error}</div>}
      </div>
      {/* Final term sheet with approval */}
      {lane.outcome === "agreed" && lane.terms && (
        <div className="pop border-t bg-emerald-50/60 px-4 py-3 text-xs">
          <div className="mb-1 font-semibold text-emerald-900">Draft term sheet</div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-neutral-700">
            <span>Fee</span><span className="text-right font-medium">${lane.terms.fee}</span>
            <span>Due</span><span className="text-right font-medium">{lane.terms.deadline}</span>
            <span>Usage</span><span className="text-right font-medium">{lane.terms.usageRights}</span>
            <span>Sample</span><span className="text-right font-medium">{lane.terms.keepSample ? "Keeps unit" : "Return"}</span>
          </div>
          <button
            onClick={onApprove}
            disabled={approved}
            className={`mt-2 w-full rounded-lg py-1.5 font-medium ${approved ? "bg-emerald-600 text-white" : "bg-black text-white hover:bg-neutral-800"}`}
          >
            {approved ? "✓ Approved · sample slot reserved" : "Approve & reserve sample"}
          </button>
        </div>
      )}
    </div>
  );
}

function StatusPill({ lane }: { lane: Lane }) {
  if (lane.outcome === "agreed") return <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] text-emerald-800">deal</span>;
  if (lane.outcome === "no-deal") return <span className="rounded-full bg-red-100 px-2 py-0.5 text-[11px] text-red-800">no deal</span>;
  if (lane.turns.length || lane.thinking) return <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] text-amber-800">round {Math.ceil((lane.turns.length + 1) / 2)}</span>;
  return null;
}

function Chip({ children, on }: { children: React.ReactNode; on?: boolean }) {
  return <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${on ? "bg-emerald-500 text-white" : "bg-white/20 ring-1 ring-current/20"}`}>{children}</span>;
}
