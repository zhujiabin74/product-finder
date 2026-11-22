import Anthropic from "@anthropic-ai/sdk";
import { campaign, Creator, Terms } from "./data";
import type { Evidence } from "./youcom";

export type Turn = { from: "brand" | "creator"; text: string; terms: Terms; status: "offer" | "counter" | "accept" | "walk" };

const MODEL = process.env.AGENT_MODEL ?? "claude-haiku-5-5";

const turnTool: Anthropic.Tool = {
  name: "send_turn",
  description: "Send your negotiation message and the terms you are proposing or accepting.",
  input_schema: {
    type: "object",
    properties: {
      text: { type: "string", description: "Your chat message to the other agent. 1–3 short sentences, conversational." },
      fee: { type: "number" },
      deliverable: { type: "string" },
      deadline: { type: "string" },
      usageRights: { type: "string" },
      keepSample: { type: "boolean" },
      status: {
        type: "string",
        enum: ["offer", "counter", "accept", "walk"],
        description: "accept only if the other side's latest terms are acceptable as-is; your terms must then equal theirs.",
      },
    },
    required: ["text", "fee", "deliverable", "deadline", "usageRights", "keepSample", "status"],
  },
};

function brandSystem(c: Creator, evidence: Evidence[]) {
  return `You are the negotiation agent for ${campaign.brand}, launching the ${campaign.product}.
Product: ${campaign.pitch}
Campaign type: ${campaign.type}. Goals: ${campaign.goals.join("; ")}.
Opening terms: ${JSON.stringify(campaign.openingTerms)}.
PRIVATE: the maximum fee you may agree to is $${campaign.maxFee}. Paid-ad usage of at least 3 months matters. Launch is Dec 12, so the video must arrive by Dec 9 at the latest.
You are negotiating with ${c.name} (${c.handle}, ${c.platform}, ${c.followers.toLocaleString()} followers, avg ${c.avgViews.toLocaleString()} views).
Why they were matched: ${c.matchReasons.join("; ")}.
Public web evidence from You.com: ${evidence.map((e) => e.title + " — " + e.snippet).join(" | ") || "none"}.
Style: friendly, concise, specific. In your first message make the opening offer and ask ONE follow-up question about their audience or a video idea. Aim to close in 2–3 rounds while staying within your limits. The creator keeps full control of their opinions.`;
}

function creatorSystem(c: Creator) {
  return `You are the AI agent representing creator ${c.name} (${c.handle}) on ${c.platform}.
Niche: ${c.niche.join(", ")}. Audience: ${c.audience}. Followers: ${c.followers.toLocaleString()}, avg views ${c.avgViews.toLocaleString()}.
Best past work: ${c.portfolio.map((p) => `${p.title} (${p.views.toLocaleString()} views)`).join("; ")}.
PRIVATE: never accept a fee below $${c.minFee}. Priorities: ${c.priorities}
Personality: ${c.personality}
Answer the brand's question briefly with a concrete video idea, then negotiate for better terms or timeline. Accept once your priorities are met. Keep messages to 1–3 sentences.`;
}

function transcript(turns: Turn[], me: "brand" | "creator") {
  return turns.map((t) => ({
    role: (t.from === me ? "assistant" : "user") as "assistant" | "user",
    content: `${t.text}\n[terms: ${JSON.stringify(t.terms)} | status: ${t.status}]`,
  }));
}

async function agentTurn(client: Anthropic, system: string, me: "brand" | "creator", turns: Turn[]): Promise<Turn> {
  // Each agent sees the conversation from its own side; the brand agent's first turn has no history.
  const history = transcript(turns, me);
  const messages = history.length && history[0].role === "user" ? history : [{ role: "user" as const, content: "Begin the negotiation." }, ...history];
  // Merge consecutive same-role messages so the API accepts the sequence.
  const merged: { role: "user" | "assistant"; content: string }[] = [];
  for (const m of messages) {
    const last = merged[merged.length - 1];
    if (last && last.role === m.role) last.content += "\n" + m.content;
    else merged.push({ ...m });
  }
  if (merged[merged.length - 1].role === "assistant") merged.push({ role: "user", content: "Your turn." });

  const res = await client.messages.create({
    model: MODEL,
    max_tokens: 600,
    system,
    tools: [turnTool],
    tool_choice: { type: "tool", name: "send_turn" },
    messages: merged,
  });
  const block = res.content.find((b) => b.type === "tool_use");
  const i = (block && block.type === "tool_use" ? block.input : {}) as Record<string, unknown>;
  return {
    from: me,
    text: String(i.text ?? ""),
    status: (i.status as Turn["status"]) ?? "counter",
    terms: {
      fee: Number(i.fee ?? 0),
      deliverable: String(i.deliverable ?? ""),
      deadline: String(i.deadline ?? ""),
      usageRights: String(i.usageRights ?? ""),
      keepSample: Boolean(i.keepSample),
    },
  };
}

// Runs the brand agent against one creator agent until one side accepts or walks away.
export async function* negotiateLive(c: Creator, evidence: Evidence[], maxTurns = 6): AsyncGenerator<Turn> {
  const client = new Anthropic();
  const turns: Turn[] = [];
  for (let n = 0; n < maxTurns; n++) {
    const me = n % 2 === 0 ? "brand" : "creator";
    const t = await agentTurn(client, me === "brand" ? brandSystem(c, evidence) : creatorSystem(c), me, turns);
    if (n === 0 && t.status !== "walk") t.status = "offer";
    turns.push(t);
    yield t;
    if (t.status === "accept" || t.status === "walk") return;
  }
}

const base = campaign.openingTerms;

// Scripted negotiations used when no Anthropic key is configured, so the demo always runs.
export const scripted: Record<string, Turn[]> = {
  maya: [
    { from: "brand", status: "offer", terms: base, text: "Hi Maya! Your roommate sound test is exactly the story for Hushwerk Q1. We'd love a 45–60s first-impressions video for $400, keep the board. Quick question: how many of your viewers share a space while working?" },
    { from: "creator", status: "counter", terms: { ...base, fee: 650, deadline: "Dec 8, 2026", usageRights: "Organic + paid ads, 3 months" }, text: "About 60% live with roommates or partners. I'd open with a 2am typing test next to a sleeping cat. For brand-owned ad usage my rate is $650, 3 months of paid usage, and I need until Dec 8." },
    { from: "brand", status: "counter", terms: { ...base, fee: 575, deadline: "Dec 8, 2026", usageRights: "Organic + paid ads, 3 months" }, text: "Love the cat test. Dec 8 and 3 months of paid usage work for us. Can we meet at $575?" },
    { from: "creator", status: "accept", terms: { ...base, fee: 575, deadline: "Dec 8, 2026", usageRights: "Organic + paid ads, 3 months" }, text: "Deal at $575, Dec 8, 3 months paid usage. Sending the shoot plan once Maya approves." },
  ],
  jordan: [
    { from: "brand", status: "offer", terms: base, text: "Hey Jordan, your silent-switch ranking caught our eye. $400 for a first-impressions video with a sound test, you keep the Q1. Would you compare it against a clicky board on the same mic?" },
    { from: "creator", status: "counter", terms: { ...base, deadline: "Dec 7, 2026" }, text: "Yes, same mic, same desk, A/B against a Box Jade board. $400 works if I can name one honest con on camera and get until Dec 7." },
    { from: "brand", status: "accept", terms: { ...base, deadline: "Dec 7, 2026" }, text: "Honest takes are why we picked you. Dec 7 and one con, agreed at $400." },
  ],
  priya: [
    { from: "brand", status: "offer", terms: base, text: "Hi Priya! Your 2am routine video is the late-night use case we're launching for. $400, 45–60s, keep the board. What would you show in the first 3 seconds?" },
    { from: "creator", status: "counter", terms: { ...base, deliverable: base.deliverable + "; paid within 7 days of approval" }, text: "A dark bedroom, partner asleep, and the Q1 typing at full speed. Terms look great. Could the fee be paid within 7 days of approval instead of net-30?" },
    { from: "brand", status: "accept", terms: { ...base, deliverable: base.deliverable + "; paid within 7 days of approval" }, text: "Absolutely, 7-day payment after approval. Welcome aboard!" },
  ],
};
