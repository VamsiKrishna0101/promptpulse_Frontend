import { CardHeader, DashboardCard, ProductPageShell } from "./ProductShared"

const opportunities = [
  ["Outranked", "QueryPilot is ranking ahead", "Comparison proof is weak for commercial-intent prompts.", "48"],
  ["Source gap", "Competitors cited on G2", "AI answers trust G2 and Reddit more than owned pages.", "44"],
  ["Create page", "Missing alternatives page", "No strong page answers 'best AI visibility tools for startups'.", "39"],
  ["Sentiment", "Positioning unclear", "Models describe the category but not your product advantage.", "32"],
]

export function OpportunitiesProductPage() {
  return (
    <ProductPageShell
      eyebrow="Opportunity Engine"
      active="Opportunities"
      title={<>Turn AI visibility gaps into the next action.</>}
      description="Score content gaps, source gaps, competitor pressure, and sentiment issues so your team knows what to fix first instead of staring at charts."
      metrics={[
        { label: "Open gaps", value: "29", note: "Prioritized issues", accent: "blue" },
        { label: "High impact", value: "8", note: "Likely to move visibility", accent: "green" },
        { label: "Create pages", value: "6", note: "Missing content angles", accent: "orange" },
        { label: "Refresh", value: "23", note: "Existing pages needing proof", accent: "slate" },
      ]}
    >
      <DashboardCard>
        <CardHeader title="Prioritized opportunities" subtitle="Filtered by impact, effort, prompt evidence, and competitor pressure" />
        <div className="grid gap-4 p-5 xl:grid-cols-2">
          {opportunities.map(([tag, title, body, score]) => (
            <article key={title} className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-[0_14px_40px_-34px_rgba(15,23,42,0.7)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="mb-3 flex flex-wrap gap-2">
                    <span className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-[11px] font-black text-orange-700">{tag}</span>
                    <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-black text-blue-700">MEDIUM impact</span>
                    <span className="rounded-full border border-zinc-200 bg-zinc-100 px-3 py-1 text-[11px] font-black text-zinc-600">MEDIUM effort</span>
                  </div>
                  <h3 className="text-[18px] font-black tracking-[-0.03em] text-zinc-950">{title}</h3>
                  <p className="mt-2 text-[13px] font-medium leading-6 text-zinc-500">{body}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-zinc-400">Score</p>
                  <p className="text-[36px] font-black tracking-[-0.06em] text-zinc-950">{score}</p>
                </div>
              </div>
              <div className="mt-5 rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-zinc-400">Recommended action</p>
                <p className="mt-1 text-[13px] font-bold text-zinc-700">Create or refresh the page with direct answer blocks, comparison proof, and citation-worthy source references.</p>
              </div>
            </article>
          ))}
        </div>
      </DashboardCard>
    </ProductPageShell>
  )
}
