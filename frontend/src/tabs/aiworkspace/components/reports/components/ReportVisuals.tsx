import type { ElementType } from "react"
import { ArrowDownRight, ArrowUpRight, CircleDot, Minus } from "lucide-react"
import {
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  RadarChart,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
} from "recharts"

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ")
}

export function toFiniteNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (typeof value === "string") {
    const parsed = Number(value.replace(/[^0-9.-]+/g, ""))
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

export function clampPercent(value: number | null | undefined) {
  if (value === null || value === undefined || !Number.isFinite(value)) return 0
  return Math.max(0, Math.min(100, value))
}

export type VisualTone = "good" | "watch" | "risk" | "neutral"

export function toneForScore(score: number | null): VisualTone {
  if (score === null) return "neutral"
  if (score >= 70) return "good"
  if (score >= 45) return "watch"
  return "risk"
}

export function toneClasses(tone: VisualTone) {
  if (tone === "good") {
    return { text: "text-emerald-700", border: "border-emerald-200", bg: "bg-emerald-50", fill: "#10b981", soft: "bg-emerald-500" }
  }
  if (tone === "watch") {
    return { text: "text-amber-700", border: "border-amber-200", bg: "bg-amber-50", fill: "#d97706", soft: "bg-amber-500" }
  }
  if (tone === "risk") {
    return { text: "text-red-700", border: "border-red-200", bg: "bg-red-50", fill: "#ef4444", soft: "bg-red-500" }
  }
  return { text: "text-zinc-600", border: "border-zinc-200", bg: "bg-zinc-50", fill: "#71717a", soft: "bg-zinc-400" }
}

/* ---------- Score ring (real recharts radial chart) ---------- */

export function ScoreRing({
  value,
  label,
  caption,
  size = "lg",
}: {
  value: number | null
  label: string
  caption?: string
  size?: "sm" | "lg"
}) {
  const score = value === null ? null : Math.round(value)
  const pct = clampPercent(score)
  const tone = toneClasses(toneForScore(score))
  const dimensions = size === "sm" ? 84 : 116
  const valueClass = size === "sm" ? "text-[20px]" : "text-[28px]"

  const data = [{ value: pct, fill: tone.fill }]

  return (
    <div className="flex items-center gap-4">
      <div className="relative shrink-0" style={{ width: dimensions, height: dimensions }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            data={data}
            innerRadius="78%"
            outerRadius="100%"
            startAngle={90}
            endAngle={-270}
            barSize={size === "sm" ? 7 : 9}
          >
            <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
            <RadialBar dataKey="value" cornerRadius={20} background={{ fill: "#f0f0f1" }} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("font-bold leading-none tracking-[-0.04em] text-zinc-950 tabular-nums", valueClass)}>
            {score === null ? "NA" : score}
          </span>
          {score !== null && <span className="mt-0.5 text-[9.5px] font-semibold text-zinc-400">/ 100</span>}
        </div>
      </div>

      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-700">{label}</p>
        {caption && (
          <p className="mt-1 max-w-[260px] text-[12.5px] font-medium leading-5 text-zinc-600">{caption}</p>
        )}
      </div>
    </div>
  )
}

/* ---------- Delta pill ---------- */

export function DeltaPill({
  value,
  unit = "",
  positiveWhenDown = false,
}: {
  value: number
  unit?: string
  positiveWhenDown?: boolean
}) {
  const neutral = value === 0
  const good = positiveWhenDown ? value < 0 : value > 0
  const bad = positiveWhenDown ? value > 0 : value < 0
  const Icon = neutral ? Minus : good ? ArrowUpRight : ArrowDownRight

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full border px-2 py-0.5 text-[10.5px] font-semibold tabular-nums",
        good && "border-emerald-200 bg-emerald-50 text-emerald-700",
        bad && "border-red-200 bg-red-50 text-red-700",
        neutral && "border-zinc-200 bg-zinc-50 text-zinc-500",
      )}
    >
      <Icon size={11} strokeWidth={2.35} />
      {value > 0 ? "+" : ""}
      {value}
      {unit}
    </span>
  )
}

/* ---------- Horizontal bar list (compact rows) ---------- */

export type BarDatum = {
  label: string
  value: number
  meta?: string
  tone?: VisualTone
  icon?: ElementType
}

export function HorizontalBarList({
  items,
  max,
  empty = "No chart data available.",
  valueSuffix = "",
}: {
  items: BarDatum[]
  max?: number
  empty?: string
  valueSuffix?: string
}) {
  if (!items.length) {
    return <p className="text-[12.5px] font-medium text-zinc-500">{empty}</p>
  }

  const chartMax = max ?? Math.max(...items.map((item) => item.value), 1)

  return (
    <div className="flex flex-col gap-2">
      {items.map((item) => {
        const Icon = item.icon ?? CircleDot
        const tone = toneClasses(item.tone ?? "neutral")
        const width = clampPercent((item.value / chartMax) * 100)

        return (
          <div
            key={item.label}
            className="grid grid-cols-[minmax(92px,180px)_1fr_auto] items-center gap-3 rounded-xl px-1.5 py-1 transition hover:bg-zinc-50"
          >
            <div className="flex min-w-0 items-center gap-2">
              <span className={cn("grid h-6 w-6 shrink-0 place-items-center rounded-lg", tone.bg, tone.text)}>
                <Icon size={12} strokeWidth={2.2} />
              </span>
              <span className="truncate text-[12.5px] font-semibold text-zinc-800">{item.label}</span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-zinc-100">
              <div className={cn("h-full rounded-full transition-all duration-500", tone.soft)} style={{ width: `${width}%` }} />
            </div>

            <div className="min-w-[54px] text-right">
              <p className="text-[12.5px] font-semibold tabular-nums text-zinc-950">
                {item.value}
                {valueSuffix}
              </p>
              {item.meta && <p className="text-[9.5px] font-semibold uppercase tracking-[0.08em] text-zinc-400">{item.meta}</p>}
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ---------- Real bar chart (recharts) ---------- */

export function ComparisonBarChart({
  items,
  valueSuffix = "%",
  height = 220,
}: {
  items: BarDatum[]
  valueSuffix?: string
  height?: number
}) {
  if (!items.length) {
    return <p className="text-[12.5px] font-medium text-zinc-500">No chart data available.</p>
  }

  const data = items.map((item) => ({
    name: item.label,
    value: item.value,
    fill: toneClasses(item.tone ?? "neutral").fill,
  }))

  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 24, top: 4, bottom: 4 }}>
          <CartesianGrid horizontal={false} stroke="#f0f0f1" />
          <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: "#a1a1aa" }} axisLine={false} tickLine={false} />
          <YAxis
            type="category"
            dataKey="name"
            width={110}
            tick={{ fontSize: 12, fontWeight: 600, fill: "#3f3f46" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            cursor={{ fill: "#fafafa" }}
            formatter={(value) => [`${toFiniteNumber(value) ?? 0}${valueSuffix}`, ""]}
            contentStyle={{ borderRadius: 12, border: "1px solid #e4e4e7", fontSize: 12, fontWeight: 600 }}
          />
          <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={16}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

/* ---------- Before / after grouped bar chart ---------- */

export function BeforeAfterBarChart({
  items,
  height = 220,
}: {
  items: Array<{ label: string; previous: number; current: number }>
  height?: number
}) {
  if (!items.length) {
    return <p className="text-[12.5px] font-medium text-zinc-500">No comparison data available.</p>
  }

  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={items} margin={{ left: -12, right: 8, top: 4, bottom: 4 }}>
          <CartesianGrid vertical={false} stroke="#f0f0f1" />
          <XAxis dataKey="label" tick={{ fontSize: 11, fontWeight: 600, fill: "#71717a" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "#a1a1aa" }} axisLine={false} tickLine={false} width={32} />
          <Tooltip
            cursor={{ fill: "#fafafa" }}
            contentStyle={{ borderRadius: 12, border: "1px solid #e4e4e7", fontSize: 12, fontWeight: 600 }}
          />
          <Bar dataKey="previous" name="Previous" fill="#e4e4e7" radius={[4, 4, 0, 0]} barSize={18} />
          <Bar dataKey="current" name="Current" fill="#d97706" radius={[4, 4, 0, 0]} barSize={18} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

/* ---------- Radar chart ---------- */

export function ComponentRadarChart({
  items,
  height = 260,
}: {
  items: Array<{ label: string; value: number }>
  height?: number
}) {
  if (!items.length) {
    return <p className="text-[12.5px] font-medium text-zinc-500">No score components available.</p>
  }

  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={items} outerRadius="72%">
          <PolarGrid stroke="#e4e4e7" />
          <PolarAngleAxis dataKey="label" tick={{ fontSize: 10.5, fontWeight: 600, fill: "#71717a" }} />
          <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
          <Radar dataKey="value" stroke="#d97706" fill="#f59e0b" fillOpacity={0.35} strokeWidth={2} />
          <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e4e4e7", fontSize: 12, fontWeight: 600 }} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}

/* ---------- Stacked segment bar (positive/neutral/negative) ---------- */

export function StackedSegmentBar({
  positive,
  neutral,
  negative,
  height = 10,
}: {
  positive: number
  neutral: number
  negative: number
  height?: number
}) {
  const total = Math.max(positive + neutral + negative, 1)
  const pPct = (positive / total) * 100
  const nPct = (neutral / total) * 100
  const rPct = (negative / total) * 100

  return (
    <div className="flex w-full overflow-hidden rounded-full" style={{ height }}>
      <div style={{ width: `${pPct}%`, background: "#10b981" }} />
      <div style={{ width: `${nPct}%`, background: "#e4e4e7" }} />
      <div style={{ width: `${rPct}%`, background: "#ef4444" }} />
    </div>
  )
}

export function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-zinc-500">
      <span className="h-2 w-2 rounded-full" style={{ background: color }} />
      {label}
    </span>
  )
}

/* ---------- Data table shell ---------- */

export function DataTable({
  columns,
  children,
}: {
  columns: Array<{ label: string; align?: "left" | "right" }>
  children: React.ReactNode
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
      <div
        className="grid gap-3 border-b border-zinc-200 bg-zinc-50 px-4 py-2.5"
        style={{ gridTemplateColumns: `minmax(160px,1.6fr) repeat(${columns.length - 1}, minmax(70px,1fr))` }}
      >
        {columns.map((col) => (
          <span
            key={col.label}
            className={cn(
              "text-[10px] font-semibold uppercase tracking-[0.1em] text-zinc-400",
              col.align === "right" && "text-right",
            )}
          >
            {col.label}
          </span>
        ))}
      </div>
      <div className="divide-y divide-zinc-100">{children}</div>
    </div>
  )
}

/* ---------- Insight panel shell ---------- */

export function InsightPanel({
  title,
  eyebrow,
  children,
  icon: Icon,
}: {
  title: string
  eyebrow?: string
  children: React.ReactNode
  icon?: ElementType
}) {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-[0_1px_3px_rgba(9,9,11,0.04)]">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          {eyebrow && <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-700">{eyebrow}</p>}
          <h3 className="text-[13.5px] font-semibold tracking-[-0.01em] text-zinc-950">{title}</h3>
        </div>
        {Icon && (
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-zinc-950 text-white">
            <Icon size={14} strokeWidth={2.2} />
          </div>
        )}
      </div>
      {children}
    </section>
  )
}

/* ---------- Small stat card ---------- */

export function StatCard({
  label,
  value,
  tone = "neutral",
}: {
  label: string
  value: string | number
  tone?: VisualTone
}) {
  const t = toneClasses(tone)
  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5">
      <p className="text-[9.5px] font-semibold uppercase tracking-[0.12em] text-zinc-400">{label}</p>
      <p className={cn("mt-1 text-[20px] font-semibold tracking-[-0.03em]", tone === "neutral" ? "text-zinc-950" : t.text)}>
        {value}
      </p>
    </div>
  )
}
