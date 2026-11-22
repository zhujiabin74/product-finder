# Product Finder

Hackathon demo: an agentic marketplace that matches brands launching tech products with niche creators.

Demo flow (about 1 minute):
1. **Brand brief:** Hushwerk publishes a paid keyboard brief with clear terms. It has 1,247 applications.
2. **AI screening:** a You.com-powered funnel narrows the 1,247 applicants to 3. Each match shows its reasons and portfolio evidence.
3. **Agent negotiation:** the brand agent negotiates with 3 creator agents in parallel. A human approves each final term sheet.

## Run

```bash
npm install
cp .env.example .env.local   # fill in keys (optional)
npm run dev
```

- With no `ANTHROPIC_API_KEY`, the negotiation plays a scripted replay. This is safe for stage wifi.
- With `ANTHROPIC_API_KEY`, live Claude agents negotiate. Each agent has private limits: the brand's fee cap and each creator's minimum fee.
- `/api/negotiate?mock=1` forces the replay even when a key is set.
- `YDC_API_KEY` turns on live You.com evidence on the screening cards.

Mock data lives in `lib/data.ts`. The agent prompts and scripted replays are in `lib/agents.ts`.
