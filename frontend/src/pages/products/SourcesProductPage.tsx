import { useState } from "react"
import { DashboardCard, ProductPageShell } from "./ProductShared"
import { Download, Globe, Search } from "lucide-react"

const legendDomains = [
  { domain: "northstar.io" },
  { domain: "linkedin.com" },
  { domain: "signalworks.ai" },
  { domain: "reddit.com" },
  { domain: "cascadian.ai" },
  { domain: "g2.com" },
]

const domainTypes = [
  { label: "Competitor", value: 33, color: "#EF4444" },
  { label: "Editorial", value: 20, color: "#F59E0B" },
  { label: "You", value: 18, color: "#10B981" },
  { label: "Social", value: 14, color: "#EC4899" },
  { label: "UGC", value: 10, color: "#3B82F6" },
  { label: "Corporate", value: 5, color: "#8B5CF6" },
]

const domainRows = [
  { domain: "northstar.io", type: "You", used: "48%", citations: "78.5", urls: 3 },
  { domain: "linkedin.com", type: "Social", used: "42%", citations: "50.4", urls: 1 },
  { domain: "reddit.com", type: "UGC", used: "34%", citations: "41.2", urls: 2 },
  { domain: "g2.com", type: "Editorial", used: "31%", citations: "36.8", urls: 2 },
  { domain: "signalworks.ai", type: "Competitor", used: "27%", citations: "29.5", urls: 1 },
  { domain: "cascadian.ai", type: "Competitor", used: "24%", citations: "26.1", urls: 1 },
  { domain: "vantageloop.com", type: "Corporate", used: "19%", citations: "18.4", urls: 1 },
]

const typePillClasses: Record<string, string> = {
  You: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Social: "border-pink-200 bg-pink-50 text-pink-700",
  UGC: "border-blue-200 bg-blue-50 text-blue-700",
  Competitor: "border-rose-200 bg-rose-50 text-rose-700",
  Editorial: "border-amber-200 bg-amber-50 text-amber-700",
  Corporate: "border-violet-200 bg-violet-50 text-violet-700",
}

function Favicon({ domain, size = 16 }: { domain: string; size?: number }) {
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-md border border-zinc-200 bg-white shadow-sm"
      style={{ width: size + 8, height: size + 8 }}
    >
      <img
        src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`}
        alt=""
        width={size}
        height={size}
        className="rounded-[3px]"
        loading="lazy"
      />
    </span>
  )
}

function SourceUsageChart() {
  return (
    <svg viewBox="0 0 720 170" className="h-[170px] w-full">
      {[0, 1, 2, 3, 4].map((i) => (
        <line key={i} x1="30" x2="700" y1={14 + i * 32} y2={14 + i * 32} stroke="#EEF2F8" strokeDasharray="4 5" />
      ))}
      {["60%", "45%", "30%", "15%", "0%"].map((label, i) => (
        <text key={label} x="0" y={18 + i * 32} fontSize="10" fontWeight={600} fill="#A1A8B5">
          {label}
        </text>
      ))}

      <path d="M30,86 C110,79 190,104 270,108 C350,112 430,68 510,64 C580,61 640,75 700,43" fill="none" stroke="#71717A" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M30,72 C110,76 190,86 270,79 C350,72 430,93 510,97 C580,99 640,108 700,104" fill="none" stroke="#06B6D4" strokeWidth="2" strokeLinecap="round" opacity="0.9" />
      <path d="M30,108 C110,93 190,72 270,83 C350,93 430,108 510,101 C580,95 640,92 700,93" fill="none" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" opacity="0.9" />
      <path d="M30,79 C110,101 190,111 270,101 C350,90 430,79 510,86 C580,92 640,101 700,108" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" opacity="0.9" />
      <path d="M30,104 C110,108 190,93 270,75 C350,58 430,72 510,83 C580,90 640,97 700,101" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" opacity="0.9" />
      <path d="M30,97 C110,86 190,79 270,93 C350,108 430,101 510,75 C580,58 640,65 700,58" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" opacity="0.9" />

      {["25 Jun", "27 Jun", "29 Jun", "1 Jul", "3 Jul", "5 Jul", "7 Jul", "9 Jul"].map((label, i) => (
        <text key={label} x={30 + i * 96} y="164" fontSize="10" fontWeight={600} fill="#A1A8B5">
          {label}
        </text>
      ))}
    </svg>
  )
}

function DomainTypeDonut() {
  const total = domainTypes.reduce((sum, d) => sum + d.value, 0)
  let cumulative = 0
  const stops = domainTypes
    .map((d) => {
      const start = (cumulative / total) * 100
      cumulative += d.value
      const end = (cumulative / total) * 100
      return `${d.color} ${start}% ${end}%`
    })
    .join(", ")
  const top = domainTypes[0]

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-32 w-32 rounded-full" style={{ background: `conic-gradient(${stops})` }}>
        <div className="absolute inset-5 flex flex-col items-center justify-center rounded-full bg-white shadow-inner">
          <span className="text-[22px] font-black tracking-[-0.03em] text-zinc-950">{Math.round((top.value / total) * 100)}%</span>
          <span className="text-[10px] font-bold text-zinc-400">{top.label}</span>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-x-4 gap-y-2">
        {domainTypes.map((d) => (
          <span key={d.label} className="inline-flex items-center gap-1.5 text-[10.5px] font-bold text-zinc-500">
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: d.color }} />
            {d.label}
          </span>
        ))}
      </div>
    </div>
  )
}

export function SourcesProductPage() {
  const [tab, setTab] = useState<"domains" | "urls" | "gaps">("domains")

  return (
    <ProductPageShell
      eyebrow="Source Intelligence"
      active="Sources"
      title={<>Find the pages AI models trust in your category.</>}
      description="Discover which articles, review pages, communities, and competitor URLs influence AI answers before users ever reach your website."
      metrics={[
        { label: "Sources", value: "40", note: "Domains influencing answers", accent: "blue" },
        { label: "Top used", value: "48%", note: "Most cited source share", accent: "green" },
        { label: "Gap URLs", value: "12", note: "Competitor-only mentions", accent: "orange" },
        { label: "Types", value: "6", note: "Editorial, UGC, social, more", accent: "slate" },
      ]}
    >
      <div className="w-full">
        {/* Tabs */}
        <div className="mb-3 inline-flex items-center gap-1 rounded-xl border border-zinc-200 bg-white p-1 shadow-sm">
          {[
            { key: "domains" as const, label: "Domains" },
            { key: "urls" as const, label: "URLs" },
            { key: "gaps" as const, label: "Brand gaps" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={[
                "rounded-lg px-3.5 py-1.5 text-[12.5px] font-bold transition",
                tab === t.key ? "bg-zinc-950 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-900",
              ].join(" ")}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="grid gap-3 xl:grid-cols-[1fr_0.62fr]">
          <DashboardCard className="w-full">
            <div className="flex items-center gap-2 border-b border-zinc-100 px-5 py-2.5">
              <Globe size={14} className="text-zinc-500" />
              <p className="text-[13.5px] font-black text-zinc-950">Source Usage by Domain</p>
            </div>
            <div className="px-5 pb-2 pt-3">
              <div className="mb-3 flex flex-wrap gap-3">
                {legendDomains.map((l) => (
                  <span key={l.domain} className="inline-flex items-center gap-1.5 text-[11.5px] font-bold text-zinc-500">
                    <Favicon domain={l.domain} size={12} />
                    {l.domain}
                  </span>
                ))}
              </div>
              <SourceUsageChart />
            </div>
          </DashboardCard>

          <DashboardCard className="w-full">
            <div className="border-b border-zinc-100 px-5 py-2.5">
              <p className="text-[13.5px] font-black text-zinc-950">Domain type</p>
            </div>
            <div className="flex flex-1 items-center justify-center px-5 py-4">
              <DomainTypeDonut />
            </div>
          </DashboardCard>
        </div>

        <DashboardCard className="mt-3 w-full">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 px-5 py-3">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-zinc-950">
                <Globe size={15} className="text-white" />
              </span>
              <div>
                <p className="text-[14.5px] font-black text-zinc-950">All Domains</p>
                <p className="text-[12px] font-medium text-zinc-400">Click a domain to inspect the URLs influencing AI answers.</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  placeholder="Search domains"
                  className="h-9 w-56 rounded-xl border border-zinc-200 bg-zinc-50/60 pl-8 pr-3 text-[12px] font-medium text-zinc-700 outline-none transition placeholder:text-zinc-400 focus:border-zinc-300 focus:bg-white"
                />
              </div>
              <button className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3.5 text-[12.5px] font-bold text-zinc-700 shadow-sm transition hover:bg-zinc-50">
                <Download size={13} />
                Export
              </button>
            </div>
          </div>

          <div className="space-y-2 px-4 pb-4 md:hidden">
            {domainRows.map((row, i) => (
              <div key={row.domain} className="rounded-2xl border border-zinc-100 bg-white p-3 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <Favicon domain={row.domain} />
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-black text-zinc-950">{row.domain}</p>
                      <p className="text-[11px] font-bold text-zinc-400">#{i + 1} source</p>
                    </div>
                  </div>
                  <span className={`inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[10.5px] font-black ${typePillClasses[row.type]}`}>
                    {row.type}
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-[11.5px]">
                  <div className="rounded-xl bg-zinc-50 p-2">
                    <p className="font-black uppercase tracking-[0.12em] text-zinc-400">Used</p>
                    <p className="mt-1 font-black text-zinc-950">{row.used}</p>
                  </div>
                  <div className="rounded-xl bg-zinc-50 p-2">
                    <p className="font-black uppercase tracking-[0.12em] text-zinc-400">Cites</p>
                    <p className="mt-1 font-bold text-zinc-700">{row.citations}</p>
                  </div>
                  <div className="rounded-xl bg-zinc-50 p-2">
                    <p className="font-black uppercase tracking-[0.12em] text-zinc-400">URLs</p>
                    <p className="mt-1 font-bold text-zinc-700">{row.urls}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden w-full overflow-hidden md:block">
            <table className="w-full min-w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50/70 text-[9px] font-black uppercase tracking-[0.1em] text-zinc-400">
                  <th className="whitespace-nowrap px-5 py-2.5 font-black">#</th>
                  <th className="whitespace-nowrap px-4 py-2.5 font-black">Source</th>
                  <th className="whitespace-nowrap px-4 py-2.5 font-black">Domain Type</th>
                  <th className="whitespace-nowrap px-4 py-2.5 font-black">Used</th>
                  <th className="whitespace-nowrap px-4 py-2.5 font-black">Avg. Citations</th>
                  <th className="whitespace-nowrap px-5 py-2.5 text-right font-black">URLs</th>
                </tr>
              </thead>
              <tbody>
                {domainRows.map((row, i) => (
                  <tr key={row.domain} className="border-b border-zinc-100 text-[12.5px] transition last:border-b-0 hover:bg-zinc-50/60">
                    <td className="whitespace-nowrap px-5 py-2.5 font-bold text-zinc-400">{i + 1}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <Favicon domain={row.domain} />
                        <span className="truncate font-black text-zinc-950">{row.domain}</span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5">
                      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10.5px] font-black ${typePillClasses[row.type]}`}>
                        {row.type}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 font-black tabular-nums text-zinc-950">{row.used}</td>
                    <td className="whitespace-nowrap px-4 py-2.5 font-bold tabular-nums text-zinc-600">{row.citations}</td>
                    <td className="whitespace-nowrap px-5 py-2.5 text-right font-bold tabular-nums text-zinc-600">{row.urls}</td>
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
