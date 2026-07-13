import { useState } from "react"
import { DashboardCard, ProductPageShell } from "./ProductShared"
import { ChevronDown, Eye, Plus, Search, Trash2 } from "lucide-react"

const stats = [
  { label: "Tracked", value: "5" },
  { label: "Discovered", value: "0" },
  { label: "Mentioned", value: "6" },
  { label: "Avg Visibility", value: "60%" },
]

const competitors = [
  { name: "Vantage Loop", domain: "vantageloop.com", visibility: "62%", sentiment: 67, position: "2.8", mentions: 178, status: "Tracked" },
  { name: "Signalworks", domain: "signalworks.ai", visibility: "60%", sentiment: 65, position: "3.0", mentions: 162, status: "Tracked" },
  { name: "Cascadian", domain: "cascadian.ai", visibility: "58%", sentiment: 64, position: "3.1", mentions: 155, status: "Tracked" },
  { name: "Ionway", domain: "ionway.io", visibility: "55%", sentiment: 61, position: "3.2", mentions: 149, status: "Tracked" },
  { name: "HaloMetrics", domain: "halometrics.com", visibility: "53%", sentiment: 66, position: "3.4", mentions: 141, status: "Tracked" },
]

function Favicon({ domain }: { domain: string }) {
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-zinc-200 bg-white shadow-sm">
      <img
        src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`}
        alt=""
        width={16}
        height={16}
        className="rounded-[3px]"
        loading="lazy"
      />
    </span>
  )
}

function SentimentDot({ score }: { score: number }) {
  const color = score >= 70 ? "bg-emerald-500" : score >= 50 ? "bg-amber-500" : "bg-rose-500"
  return <span className={`h-1.5 w-1.5 rounded-full ${color}`} />
}

function MentionBars({ value }: { value: number }) {
  const filled = Math.min(5, Math.max(1, Math.round(value / 40)))
  return (
    <span className="flex items-end gap-[2px]">
      {[4, 7, 10, 13, 16].map((h, i) => (
        <span
          key={h}
          className={`w-[3px] rounded-sm ${i < filled ? "bg-emerald-500" : "bg-zinc-200"}`}
          style={{ height: h }}
        />
      ))}
    </span>
  )
}

export function CompetitorsProductPage() {
  const [tab, setTab] = useState<"tracked" | "discovered" | "ignored">("tracked")

  return (
    <ProductPageShell
      eyebrow="Competitor Intelligence"
      active="Competitors"
      title={<>See why competitors get recommended before you.</>}
      description="Benchmark every tracked competitor by prompt, source, sentiment, and answer position so you can explain exactly where the market is pulling ahead."
      metrics={[
        { label: "Tracked", value: "5", note: "Competitors monitored", accent: "blue" },
        { label: "Gap prompts", value: "18", note: "Prompts with competitor pressure", accent: "orange" },
        { label: "Fastest mover", value: "+5.6", note: "Visibility increase this period", accent: "green" },
        { label: "Risk", value: "3", note: "High-priority competitor threats", accent: "slate" },
      ]}
    >
      <div className="w-full">
        <DashboardCard className="w-full">
          <div className="flex items-center justify-between gap-4 px-5 py-4">
            <div>
              <p className="text-[16px] font-black tracking-[-0.02em] text-zinc-950">Competitors</p>
              <p className="mt-0.5 text-[12px] font-medium text-zinc-400">
                Manage brands tracked across AI answers for Refractone
              </p>
            </div>
            <button className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl bg-black px-3.5 text-[12px] font-black text-white shadow-[0_14px_28px_-18px_rgba(0,0,0,0.85)] transition hover:bg-zinc-800">
              <Plus size={14} />
              Add competitor
            </button>
          </div>

          <div className="grid grid-cols-2 border-y border-zinc-100 sm:grid-cols-4">
            {stats.map((s, i) => (
              <div key={s.label} className={`px-5 py-3.5 ${i > 0 ? "border-l border-zinc-100" : ""}`}>
                <p className="text-[9px] font-black uppercase tracking-[0.14em] text-zinc-400">{s.label}</p>
                <p className="mt-1 text-[21px] font-black tracking-[-0.03em] tabular-nums text-zinc-950">{s.value}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
            <div className="flex items-center gap-1.5">
              {[
                { key: "tracked" as const, label: "Tracked", count: 5 },
                { key: "discovered" as const, label: "Discovered", count: 0 },
                { key: "ignored" as const, label: "Ignored", count: 0 },
              ].map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={[
                    "inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-[12px] font-bold transition",
                    tab === t.key ? "bg-zinc-100 text-zinc-950" : "text-zinc-400 hover:text-zinc-700",
                  ].join(" ")}
                >
                  {t.label}
                  <span className={`rounded-full px-1.5 py-0.5 text-[9.5px] font-black ${tab === t.key ? "bg-white text-zinc-600 shadow-sm" : "bg-zinc-100 text-zinc-400"}`}>
                    {t.count}
                  </span>
                </button>
              ))}
            </div>
            <div className="relative flex-1 sm:max-w-xs sm:flex-none">
              <Search size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                placeholder="Search competitors"
                className="h-9 w-full rounded-xl border border-zinc-200 bg-zinc-50/60 pl-8 pr-3 text-[12px] font-medium text-zinc-700 outline-none transition placeholder:text-zinc-400 focus:border-zinc-300 focus:bg-white"
              />
            </div>
          </div>

          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-full border-collapse text-left">
              <thead>
                <tr className="border-y border-zinc-100 bg-zinc-50/70 text-[9px] font-black uppercase tracking-[0.1em] text-zinc-400">
                  <th className="whitespace-nowrap px-5 py-2.5 font-black">Brand</th>
                  <th className="whitespace-nowrap px-4 py-2.5 font-black">
                    <span className="inline-flex items-center gap-1">Visibility <ChevronDown size={10} /></span>
                  </th>
                  <th className="whitespace-nowrap px-4 py-2.5 font-black">Sentiment</th>
                  <th className="whitespace-nowrap px-4 py-2.5 font-black">Position</th>
                  <th className="whitespace-nowrap px-4 py-2.5 font-black">Mentions</th>
                  <th className="whitespace-nowrap px-4 py-2.5 font-black">Status</th>
                  <th className="whitespace-nowrap px-5 py-2.5 text-right font-black">Actions</th>
                </tr>
              </thead>
              <tbody>
                {competitors.map((c) => (
                  <tr key={c.name} className="group border-b border-zinc-100 text-[12.5px] transition last:border-b-0 hover:bg-zinc-50/60">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Favicon domain={c.domain} />
                        <div className="min-w-0">
                          <p className="truncate font-black text-zinc-950">{c.name}</p>
                          <p className="truncate text-[11px] font-medium text-zinc-400">https://{c.domain}</p>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-black tabular-nums text-zinc-950">{c.visibility}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 font-bold tabular-nums text-zinc-700">
                        <SentimentDot score={c.sentiment} /> {c.sentiment}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-bold tabular-nums text-zinc-700"># {c.position}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span className="inline-flex items-center gap-2 font-bold tabular-nums text-zinc-700">
                        <MentionBars value={c.mentions} /> {c.mentions}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-black text-emerald-700">
                        {c.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <button className="inline-flex h-7 items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-2.5 text-[11px] font-bold text-zinc-700 shadow-sm transition hover:border-zinc-300 hover:bg-zinc-50">
                          <Eye size={12} className="text-zinc-500" />
                          View
                        </button>
                        <button className="inline-flex h-7 items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-2.5 text-[11px] font-bold text-rose-600 transition hover:border-rose-300 hover:bg-rose-100">
                          <Trash2 size={12} />
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DashboardCard>
      </div>
    </ProductPageShell>
  )
}
