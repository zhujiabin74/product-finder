import { creators, campaign } from "@/lib/data";
import { youSearch } from "@/lib/youcom";

// Runs You.com checks for each shortlisted creator: niche relevance and brand-safety signals.
export async function GET() {
  const live = Boolean(process.env.YDC_API_KEY);
  const results = await Promise.all(
    creators.map(async (c) => {
      const [relevance, market] = await Promise.all([
        youSearch(`${c.handle} ${c.niche[0]} ${campaign.category.toLowerCase()} review`, 2),
        youSearch(`silent mechanical keyboard ${c.niche[1]} trend 2026`, 2),
      ]);
      return { id: c.id, evidence: [...relevance, ...market] };
    })
  );
  return Response.json({ live, results });
}
