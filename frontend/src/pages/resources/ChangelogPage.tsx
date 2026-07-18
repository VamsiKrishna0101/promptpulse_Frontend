import { CalendarDays, CheckCircle2, Sparkles } from "lucide-react"
import { ResourceCard, ResourceShell, SectionTitle } from "./ResourceShared"

const releases = [
  {
    date: "July 2026",
    title: "Sara streaming assistant and stronger exports",
    items: ["Sara answers from project evidence", "Cleaner PDF and CSV export controls", "Improved dashboard movement indicators"],
  },
  {
    date: "July 2026",
    title: "Opportunity Engine and GEO Articles",
    items: ["Prioritized gaps from prompts and competitors", "Article briefs from DB evidence", "Source gaps and content refresh suggestions"],
  },
  {
    date: "June 2026",
    title: "Core AI visibility dashboard",
    items: ["Visibility, position, sentiment tracking", "Competitor benchmarking", "Top sources and chat evidence"],
  },
]

const upcoming = ["Weekly email reports", "More alert rules", "Cleaner shareable reports", "Deeper source detail pages"]

export function ChangelogPage() {
  return (
    <ResourceShell
      eyebrow="Changelog"
      title={<>See what shipped and what is getting better.</>}
      description="A simple product timeline so users know PromptPulse is actively improving across analytics, recommendations, reports, and Sara."
    >
      <div className="grid gap-5 lg:grid-cols-[1fr_0.72fr]">
        <ResourceCard className="p-6">
          <SectionTitle eyebrow="Product updates" title="Recent releases" description="Keep this page honest and short. It should make the product feel alive, not bloated." />
          <div className="relative space-y-4">
            {releases.map((release) => (
              <article key={release.title} className="rounded-2xl border border-zinc-200 bg-white p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-[11px] font-black text-zinc-500">
                      <CalendarDays size={13} /> {release.date}
                    </span>
                    <h3 className="mt-3 text-[20px] font-black tracking-[-0.035em] text-zinc-950">{release.title}</h3>
                  </div>
                  <span className="w-fit rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[11px] font-black text-emerald-700">Shipped</span>
                </div>
                <div className="mt-4 grid gap-2 sm:grid-cols-3">
                  {release.items.map((item) => (
                    <div key={item} className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-[12px] font-bold leading-5 text-zinc-600">{item}</div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </ResourceCard>

        <ResourceCard className="p-6">
          <SectionTitle eyebrow="Next" title="What is coming soon" description="Use this as a lightweight roadmap without overpromising." />
          <div className="space-y-3">
            {upcoming.map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-4">
                <CheckCircle2 size={18} className="text-blue-600" />
                <p className="text-[14px] font-black text-zinc-800">{item}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-2xl bg-black p-5 text-white">
            <Sparkles size={18} />
            <p className="mt-3 text-[18px] font-black tracking-[-0.035em]">Building from customer feedback.</p>
            <p className="mt-2 text-[13px] font-medium leading-6 text-zinc-300">The roadmap should stay close to what users ask for: better reporting, clearer actions, and stronger evidence.</p>
          </div>
        </ResourceCard>
      </div>
    </ResourceShell>
  )
}
