import { CardHeader, DashboardCard, ProductPageShell } from "./ProductShared"
import { CheckCircle2, ChevronRight, FileText, Sparkles, Target } from "lucide-react"

const outline = [
  "Answer the target query directly in the opening section",
  "Compare Northstar against Signalworks, Cascadian, and Vantage Loop",
  "Reference sources already shaping AI answers",
  "Add short FAQ blocks for answer-engine snippets",
]

const sourceDomains = ["g2.com", "reddit.com", "hubspot.com", "cascadian.ai"]

const briefs = [
  {
    title: "Best tools to monitor competitor visibility across AI answer engines",
    status: "Selected",
    words: "1,450 words",
    query: "best AI visibility tools for B2B SaaS teams",
  },
  {
    title: "Which sources influence ChatGPT answers for AI visibility software?",
    status: "Ready",
    words: "1,120 words",
    query: "sources ChatGPT cites for AI visibility software",
  },
  {
    title: "How B2B SaaS teams improve AI search visibility",
    status: "Ready",
    words: "980 words",
    query: "improve AI search visibility B2B SaaS",
  },
]

function Favicon({ domain }: { domain: string }) {
  return (
    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-zinc-200 bg-white shadow-sm">
      <img
        src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`}
        alt=""
        width={13}
        height={13}
        className="rounded-[2px]"
        loading="lazy"
      />
    </span>
  )
}

export function GeoArticlesProductPage() {
  return (
    <ProductPageShell
      eyebrow="GEO Article Briefs"
      active="GEO Articles"
      title={<>Create article briefs from your AI answer evidence.</>}
      description="Use prompt responses, source mentions, competitor gaps, and sentiment evidence from your database to create useful GEO article briefs."
      metrics={[
        { label: "Evidence", value: "42", note: "Recent AI response samples", accent: "blue" },
        { label: "Sources", value: "8", note: "Domains to reference", accent: "green" },
        { label: "Competitors", value: "5", note: "Brands shaping answers", accent: "orange" },
        { label: "Window", value: "14d", note: "Evidence lookback", accent: "slate" },
      ]}
    >
      <div className="grid gap-4 xl:grid-cols-[0.85fr_1fr]">
        <DashboardCard className="w-full">
          <CardHeader title="Generated briefs" subtitle="A clean list first, article detail only after selection" />
          <div>
            {briefs.map((brief, index) => {
              const selected = index === 0
              return (
                <button
                  key={brief.title}
                  className={[
                    "block w-full border-b border-zinc-100 p-4 text-left transition last:border-b-0",
                    selected ? "bg-blue-50/40" : "hover:bg-zinc-50/70",
                  ].join(" ")}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span
                      className={[
                        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9.5px] font-black",
                        selected ? "border-blue-200 bg-blue-100/70 text-blue-700" : "border-zinc-200 bg-zinc-50 text-zinc-500",
                      ].join(" ")}
                    >
                      {selected && <CheckCircle2 size={10} />}
                      {brief.status}
                    </span>
                    <ChevronRight size={14} className={selected ? "text-blue-400" : "text-zinc-300"} />
                  </div>
                  <h3 className="mt-2.5 text-[14.5px] font-black leading-snug tracking-[-0.02em] text-zinc-950">{brief.title}</h3>
                  <div className="mt-2 flex items-center gap-3 text-[11px] font-bold text-zinc-400">
                    <span className="inline-flex items-center gap-1">
                      <FileText size={11} /> {brief.words}
                    </span>
                    <span className="inline-flex items-center gap-1 truncate">
                      <Target size={11} /> {brief.query}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </DashboardCard>

        <DashboardCard className="w-full">
          <CardHeader
            title="Article brief"
            subtitle="Structured for answer engines and human readers"
            action={
              <button className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-black px-3.5 text-[12px] font-black text-white shadow-[0_14px_28px_-18px_rgba(0,0,0,0.85)] transition hover:bg-zinc-800">
                <Sparkles size={13} />
                Generate article
              </button>
            }
          />
          <div className="p-5">
            <h3 className="text-[20px] font-black leading-tight tracking-[-0.03em] text-zinc-950">
              Best tools to monitor competitor visibility across AI answer engines
            </h3>
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-[11.5px] font-bold text-zinc-600">
              <Target size={12} className="text-zinc-400" />
              Target query: best AI visibility tools for B2B SaaS teams
            </div>

            <p className="mt-5 text-[10px] font-black uppercase tracking-[0.14em] text-zinc-400">Outline</p>
            <div className="mt-2.5 space-y-2">
              {outline.map((item, index) => (
                <div key={item} className="flex items-start gap-3 rounded-xl border border-zinc-200 bg-zinc-50/70 px-3.5 py-3 transition hover:border-zinc-300 hover:bg-white hover:shadow-sm">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-950 text-[10px] font-black text-white">
                    {index + 1}
                  </span>
                  <span className="text-[12.5px] font-bold leading-5 text-zinc-700">{item}</span>
                </div>
              ))}
            </div>

            <p className="mt-5 text-[10px] font-black uppercase tracking-[0.14em] text-zinc-400">Sources to reference</p>
            <div className="mt-2.5 grid gap-2 sm:grid-cols-2">
              {sourceDomains.map((domain) => (
                <div key={domain} className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-[12px] font-bold text-zinc-700 shadow-sm transition hover:border-zinc-300">
                  <Favicon domain={domain} /> {domain}
                </div>
              ))}
            </div>
          </div>
        </DashboardCard>
      </div>
    </ProductPageShell>
  )
}