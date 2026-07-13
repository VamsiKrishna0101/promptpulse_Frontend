import {
  BarChart3,
  Crown,
  Layers,
  Search,
  Trophy,
} from "lucide-react"
import { ProductPageShell } from "./ProductShared"

const brandRows = [
  { name: "Northstar", domain: "refractone.com", visibility: "96%", vDelta: "+9.0", sentiment: "72", sDelta: "+3.3", position: "#4.1", pDelta: "+0.2", isYou: true },
  { name: "PromptWatch", domain: "promptwatch.com", visibility: "60%", vDelta: "-1.1", sentiment: "65", sDelta: "+0.8", position: "#3.1", pDelta: "-0.1" },
  { name: "Peec AI", domain: "peec.ai", visibility: "60%", vDelta: "-1.1", sentiment: "65", sDelta: "-0.2", position: "#3.0", pDelta: "0" },
  { name: "PromptMonitor", domain: "promptmonitor.ai", visibility: "60%", vDelta: "+0.5", sentiment: "65", sDelta: "+0.1", position: "#3.0", pDelta: "0" },
  { name: "Profound", domain: "tryprofound.com", visibility: "60%", vDelta: "+0.5", sentiment: "65", sDelta: "+1.3", position: "#2.9", pDelta: "+0.1" },
]

const sources = [
  { domain: "refractone.com", used: "48%", citations: "0.8", type: "Owned" },
  { domain: "g2.com", used: "38%", citations: "0.7", type: "Review" },
  { domain: "reddit.com", used: "31%", citations: "0.5", type: "Community" },
]

const sourceTypes = [
  { label: "Owned", value: 32, color: "#2563EB" },
  { label: "Review", value: 22, color: "#F59E0B" },
  { label: "Community", value: 18, color: "#7C3AED" },
  { label: "Editorial", value: 16, color: "#F43F5E" },
  { label: "Other", value: 12, color: "#CBD5E1" },
]

const modelCoverage = [
  { name: "ChatGPT", share: 41, color: "#10A37F" },
  { name: "Gemini", share: 27, color: "#4285F4" },
  { name: "Claude", share: 19, color: "#D97757" },
  { name: "Perplexity", share: 13, color: "#7C3AED" },
]

function Favicon({ domain, size = 16, ring = false }: { domain: string; size?: number; ring?: boolean }) {
  return (
    <span
      className={[
        "inline-flex shrink-0 items-center justify-center rounded-[7px] bg-white",
        ring ? "ring-2 ring-amber-300/70 ring-offset-1 ring-offset-white" : "border border-slate-200/80",
      ].join(" ")}
      style={{ width: size + 4, height: size + 4 }}
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

function DeltaPill({ value }: { value: string }) {
  if (value === "0") {
    return <span className="text-[9px] font-bold text-slate-300">— flat</span>
  }

  const negative = value.startsWith("-")

  return (
    <span
      className={[
        "inline-flex h-[19px] items-center gap-0.5 rounded-full border px-1.5 text-[9px] font-black tabular-nums",
        negative
          ? "border-rose-200/70 bg-rose-50 text-rose-600"
          : "border-emerald-200/70 bg-emerald-50 text-emerald-700",
      ].join(" ")}
    >
      <span className="text-[8px]">{negative ? "▼" : "▲"}</span>
      {value.replace("-", "")}
    </span>
  )
}

function CardHeader({
  icon: Icon,
  iconTint,
  title,
  subtitle,
  action,
}: {
  icon: React.ElementType
  iconTint: string
  title: string
  subtitle: string
  action?: string
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
      <div className="flex items-center gap-2.5">
        <span
          className="flex h-7 w-7 items-center justify-center rounded-lg border"
          style={{ backgroundColor: `${iconTint}14`, borderColor: `${iconTint}26` }}
        >
          <Icon size={13} strokeWidth={2.4} style={{ color: iconTint }} />
        </span>
        <div>
          <p className="text-[12.5px] font-black leading-tight tracking-[-0.01em] text-slate-950">{title}</p>
          <p className="text-[10.5px] font-semibold leading-tight text-slate-400">{subtitle}</p>
        </div>
      </div>
      {action && (
        <button className="shrink-0 text-[9.5px] font-black tracking-wide text-slate-500 transition hover:text-slate-950">
          {action} ↗
        </button>
      )}
    </div>
  )
}

function MetricCard({
  label,
  value,
  delta,
  note,
  badge,
  accent,
}: {
  label: string
  value: string
  delta?: string
  note: string
  badge: string
  accent: string
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white px-4 py-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(15,23,42,0.08)]">
      <span
        className="absolute inset-x-0 top-0 h-[3px] rounded-t-2xl"
        style={{ background: `linear-gradient(90deg, ${accent}, ${accent}00)` }}
      />
      <div className="flex items-center justify-between gap-2">
        <p className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">{label}</p>
        <span className="rounded-full border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[8.5px] font-black text-slate-500">
          {badge}
        </span>
      </div>
      <div className="mt-2.5 flex items-end gap-2">
        <span className="text-[26px] font-black leading-none tracking-[-0.02em] text-slate-950 tabular-nums">
          {value}
        </span>
        {delta && <DeltaPill value={delta} />}
      </div>
      <p className="mt-2 text-[9.5px] font-semibold leading-4 text-slate-400">{note}</p>
    </div>
  )
}

function MiniLineChart() {
  return (
    <svg viewBox="0 0 520 190" className="h-[185px] w-full">
      <defs>
        <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2563EB" stopOpacity="0.16" />
          <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
        </linearGradient>
      </defs>

      {[0, 1, 2, 3, 4].map((i) => (
        <line key={i} x1="34" x2="500" y1={22 + i * 35} y2={22 + i * 35} stroke="#EEF2F8" strokeDasharray="3 5" />
      ))}

      {["100%", "80%", "60%", "40%", "20%"].map((label, i) => (
        <text key={label} x="0" y={26 + i * 35} fontSize="10" fontWeight={600} fill="#A7B2C2">
          {label}
        </text>
      ))}

      <path
        d="M34,34 C90,29 110,23 150,25 C200,27 220,25 260,25 C310,26 350,30 380,36 C420,40 460,43 500,45 L500,162 L34,162 Z"
        fill="url(#areaFill)"
      />

      <path d="M34,34 C90,29 110,23 150,25 C200,27 220,25 260,25 C310,26 350,30 380,36 C420,40 460,43 500,45" fill="none" stroke="#2563EB" strokeWidth="3.4" strokeLinecap="round" />
      <path d="M34,92 C90,86 120,80 150,82 C190,84 230,90 260,88 C300,89 340,89 380,90 C420,86 460,81 500,79" fill="none" stroke="#10B981" strokeWidth="2.2" strokeLinecap="round" opacity="0.85" />
      <path d="M34,78 C90,83 120,88 150,86 C190,84 230,78 260,80 C300,76 340,66 380,70 C420,74 460,79 500,82" fill="none" stroke="#F59E0B" strokeWidth="2.2" strokeLinecap="round" opacity="0.85" />
      <path d="M34,88 C90,84 120,78 150,76 C190,74 230,70 260,68 C300,71 340,76 380,78 C420,76 460,73 500,71" fill="none" stroke="#7C3AED" strokeWidth="2.2" strokeLinecap="round" opacity="0.85" />
      <path d="M34,68 C90,70 120,73 150,75 C190,79 230,83 260,86 C300,83 340,80 380,78 C420,75 460,73 500,71" fill="none" stroke="#EF4444" strokeWidth="2.2" strokeLinecap="round" opacity="0.85" />

      <circle cx="500" cy="45" r="4.5" fill="#fff" stroke="#2563EB" strokeWidth="2.4" />
      <text x="507" y="48" fontSize="10.5" fill="#0F172A" fontWeight={800}>89%</text>
      <text x="507" y="82" fontSize="10" fill="#10B981" fontWeight={800}>67%</text>
      <text x="507" y="74" fontSize="10" fill="#7C3AED" fontWeight={800}>61%</text>

      {["3 Jul", "4 Jul", "5 Jul", "6 Jul", "7 Jul"].map((label, i) => (
        <text key={label} x={34 + i * 116} y="176" fontSize="10" fontWeight={600} fill="#A7B2C2">
          {label}
        </text>
      ))}
    </svg>
  )
}

function ChartCard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <CardHeader icon={BarChart3} iconTint="#2563EB" title="Visibility" subtitle="Percentage of chats mentioning each brand" />
      <div className="p-4">
        <MiniLineChart />
        <div className="flex flex-wrap gap-1.5 border-t border-slate-100 pt-3">
          {brandRows.slice(0, 5).map((brand) => (
            <span key={brand.name} className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50/60 px-2 py-1 text-[9px] font-bold text-slate-600">
              <Favicon domain={brand.domain} size={11} />
              {brand.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

function BrandsCard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <CardHeader icon={Trophy} iconTint="#D97706" title="Brands" subtitle="with highest visibility" action="Show All" />

      <div className="grid grid-cols-[26px_1fr_70px_74px_60px] border-b border-slate-100 bg-slate-50/70 px-4 py-1.5 text-[8px] font-black uppercase tracking-[0.12em] text-slate-400">
        <span>#</span>
        <span>Brand</span>
        <span>Visibility</span>
        <span>Sentiment</span>
        <span>Position</span>
      </div>

      {brandRows.map((brand, index) => (
        <div
          key={brand.name}
          className={[
            "grid grid-cols-[26px_1fr_70px_74px_60px] items-center border-b border-slate-100 px-4 py-2.5 text-[10px] last:border-b-0",
            brand.isYou ? "bg-gradient-to-r from-indigo-50/70 via-white to-white" : "",
          ].join(" ")}
        >
          <span className="font-black text-slate-400">
            {index === 0 ? <Crown size={13} className="fill-amber-400 text-amber-500" /> : index + 1}
          </span>
          <div className="flex min-w-0 items-center gap-1.5">
            <Favicon domain={brand.domain} ring={brand.isYou} />
            <span className="truncate font-black text-slate-950">{brand.name}</span>
            {brand.isYou && (
              <span className="shrink-0 rounded-full border border-indigo-200 bg-indigo-50 px-1.5 py-[1px] text-[7.5px] font-black uppercase tracking-wide text-indigo-600">
                You
              </span>
            )}
          </div>
          <span className="flex items-center gap-1.5 font-black tabular-nums text-slate-950">
            <DeltaPill value={brand.vDelta} /> {brand.visibility}
          </span>
          <span className="flex items-center gap-1.5 font-bold tabular-nums text-slate-700">
            <span className="h-1 w-1 rounded-full bg-emerald-500" />
            <DeltaPill value={brand.sDelta} /> {brand.sentiment}
          </span>
          <span className="flex items-center gap-1.5 font-bold tabular-nums text-slate-700">
            <DeltaPill value={brand.pDelta} /> {brand.position}
          </span>
        </div>
      ))}
    </div>
  )
}

function SourcesCard() {
  const total = sourceTypes.reduce((sum, s) => sum + s.value, 0)
  let cumulative = 0
  const stops = sourceTypes
    .map((s) => {
      const start = (cumulative / total) * 100
      cumulative += s.value
      const end = (cumulative / total) * 100
      return `${s.color} ${start}% ${end}%`
    })
    .join(", ")

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] xl:col-span-8">
      <CardHeader icon={Search} iconTint="#7C3AED" title="Top Sources" subtitle="Sources cited across active models" action="Show All" />

      <div className="grid grid-cols-[168px_1fr]">
        <div className="border-r border-slate-100 p-4">
          <p className="text-[8px] font-black uppercase tracking-[0.14em] text-slate-400">Sources type</p>
          <div className="mt-3 flex items-center justify-center">
            <div
              className="relative h-24 w-24 rounded-full"
              style={{ background: `conic-gradient(${stops})` }}
            >
              <div className="absolute inset-[9px] rounded-full bg-white shadow-inner" />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[19px] font-black tabular-nums text-slate-950">40</span>
                <span className="text-[7px] font-black uppercase tracking-wide text-slate-400">sources</span>
              </div>
            </div>
          </div>
          <div className="mt-3 space-y-1">
            {sourceTypes.map((s) => (
              <div key={s.label} className="flex items-center justify-between text-[9px] font-bold text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: s.color }} />
                  {s.label}
                </span>
                <span className="tabular-nums text-slate-700">{Math.round((s.value / total) * 100)}%</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="grid grid-cols-[1fr_60px_92px_76px] border-b border-slate-100 bg-slate-50/70 px-4 py-1.5 text-[8px] font-black uppercase tracking-[0.12em] text-slate-400">
            <span>Domain</span>
            <span className="text-right">Used</span>
            <span className="text-right">Avg. citations</span>
            <span className="text-right">Type</span>
          </div>

          {sources.map((source) => (
            <div key={source.domain} className="grid grid-cols-[1fr_60px_92px_76px] items-center border-b border-slate-100 px-4 py-3 text-[10px] last:border-b-0">
              <div className="flex min-w-0 items-center gap-1.5">
                <Favicon domain={source.domain} />
                <span className="truncate font-black text-slate-900">{source.domain}</span>
              </div>
              <span className="text-right font-black tabular-nums text-slate-900">{source.used}</span>
              <span className="text-right font-bold tabular-nums text-slate-600">{source.citations}</span>
              <span className="text-right">
                <span className="rounded-full border border-slate-200 bg-white px-1.5 py-0.5 text-[8px] font-black text-slate-600">{source.type}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ModelCoverageCard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] xl:col-span-4">
      <CardHeader icon={Layers} iconTint="#0F172A" title="Model Coverage" subtitle="Where your visibility comes from" />
      <div className="space-y-3 p-4">
        {modelCoverage.map((m) => (
          <div key={m.name}>
            <div className="mb-1 flex items-center justify-between text-[10px] font-black text-slate-700">
              <span>{m.name}</span>
              <span className="tabular-nums text-slate-400">{m.share}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full"
                style={{ width: `${m.share}%`, backgroundColor: m.color }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function AnalyticsProductPage() {
  return (
    <ProductPageShell
      eyebrow="AI Visibility Analytics"
      active="Overview"
      title={<>Know where your brand appears in AI answers.</>}
      description="Track visibility, rank, sentiment, competitors, and source evidence across ChatGPT, Gemini, Claude, and Perplexity from one clean GEO dashboard."
      metrics={[]}
    >
      <div className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Visibility" value="96%" delta="+9.0" note="Northstar share across AI answers" badge="Brand line" accent="#2563EB" />
          <MetricCard label="Position" value="4.1" delta="+0.2" note="Average rank when mentioned" badge="Rank" accent="#7C3AED" />
          <MetricCard label="Sentiment" value="72" delta="+3.3" note="Weighted response sentiment" badge="Tone" accent="#10B981" />
          <MetricCard label="Sources" value="9" note="Domains influencing answers" badge="Evidence" accent="#F59E0B" />
        </div>

        <div className="grid gap-4 xl:grid-cols-12">
          <div className="xl:col-span-7">
            <ChartCard />
          </div>
          <div className="xl:col-span-5">
            <BrandsCard />
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-12">
          <SourcesCard />
          <ModelCoverageCard />
        </div>
      </div>
    </ProductPageShell>
  )
}
