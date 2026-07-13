import { useEffect, useMemo, useRef, useState } from "react"
import { useFilters } from "@/hooks/useFilters"
import { useProjects } from "@/hooks/useProjects"
import { useSources, type DomainSourceRow, type SourceGapRow, type SourceTrendPoint, type TopSourceRow, type UrlSourceRow } from "@/hooks/useSources"
import { Fav, Sk, timeAgo } from "@/tabs/overview/overview"
import { api } from "@/lib/api"
import { downloadCsvExport } from "@/lib/exportDownload"

const TCFG: Record<string, { label: string; color: string; tw: string }> = {
  COMPETITOR: { label: "Competitor", color: "#ef4444", tw: "bg-red-50 text-red-600 border border-red-100" },
  YOU: { label: "You", color: "#22c55e", tw: "bg-emerald-50 text-emerald-600 border border-emerald-100" },
  UGC: { label: "UGC", color: "#3b82f6", tw: "bg-blue-50 text-blue-600 border border-blue-100" },
  EDITORIAL: { label: "Editorial", color: "#f59e0b", tw: "bg-amber-50 text-amber-600 border border-amber-100" },
  CORPORATE: { label: "Corporate", color: "#8b5cf6", tw: "bg-violet-50 text-violet-600 border border-violet-100" },
  REFERENCE: { label: "Reference", color: "#06b6d4", tw: "bg-cyan-50 text-cyan-600 border border-cyan-100" },
  INSTITUTIONAL: { label: "Institutional", color: "#10b981", tw: "bg-teal-50 text-teal-600 border border-teal-100" },
  SOCIAL: { label: "Social", color: "#ec4899", tw: "bg-pink-50 text-pink-600 border border-pink-100" },
  OTHER: { label: "Other", color: "#a1a1aa", tw: "bg-zinc-100 text-zinc-500 border border-zinc-200" },
}

const SOURCE_LINE_COLORS = ["#2563EB", "#10B981", "#F59E0B", "#7C3AED", "#EF4444", "#0891B2"]

const SortIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 text-zinc-300">
    <path d="M7 9l5-5 5 5" />
    <path d="M17 15l-5 5-5-5" />
  </svg>
)

const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <path d="M21 21l-4.35-4.35" />
  </svg>
)

const ExportIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
)

const GlobeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
)

const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

const ExternalIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
)

function sourcePct(row: DomainSourceRow | TopSourceRow) {
  return row.used_percentage ?? ("retrieval_rate" in row ? row.retrieval_rate : undefined) ?? ("usage_percentage" in row ? row.usage_percentage : undefined) ?? 0
}

function sourceCitations(row: DomainSourceRow | TopSourceRow) {
  return row.avg_citations ?? ("citation_rate" in row ? row.citation_rate : undefined) ?? 0
}

function sourceType(type?: string | null) {
  return type?.toUpperCase() || "OTHER"
}

function Badge({ type }: { type?: string | null }) {
  const cfg = TCFG[sourceType(type)] ?? TCFG.OTHER
  return <span className={`inline-flex items-center rounded px-1.5 py-[2px] text-[10.5px] font-semibold leading-none ${cfg.tw}`}>{cfg.label}</span>
}

function SegmentButton({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`h-7 rounded-md px-3 text-[12.5px] font-semibold transition-all ${active
        ? "bg-white text-zinc-900 shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
        : "text-zinc-500 hover:text-zinc-800"
      }`}
    >
      {children}
    </button>
  )
}

function brandDomainForLogo(name: string) {
  const key = name.toLowerCase().replace(/[^a-z0-9]/g, "")
  const known: Record<string, string> = {
    "6sense": "6sense.com",
    alphasense: "alpha-sense.com",
    apollo: "apollo.io",
    apolloio: "apollo.io",
    bloomberg: "bloomberg.com",
    cbinsights: "cbinsights.com",
    clay: "clay.com",
    clearbit: "clearbit.com",
    crunchbase: "crunchbase.com",
    demandbase: "demandbase.com",
    dnb: "dnb.com",
    dnbhoovers: "dnb.com",
    forrester: "forrester.com",
    g2: "g2.com",
    gartner: "gartner.com",
    linkedin: "linkedin.com",
    linkedinsalesnavigator: "linkedin.com",
    peopledataLabs: "peopledatalabs.com",
    peopledatalabs: "peopledatalabs.com",
    pitchbook: "pitchbook.com",
    refractone: "refractone.com",
    zoominfo: "zoominfo.com",
  }
  return known[key] ?? `${key}.com`
}

function MentionChip({ name }: { name: string }) {
  const domain = brandDomainForLogo(name)
  const fallbackColor = name.toLowerCase().includes("refract") ? "#111827" : "#E11D48"
  return (
    <span title={name} className="inline-flex h-[22px] w-[22px] items-center justify-center overflow-hidden rounded-md border border-slate-200 bg-white shadow-[0_1px_1px_rgba(15,23,42,0.04)]">
      <img
        src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
        alt={name}
        width={16}
        height={16}
        className="rounded-[3px] object-contain"
        onError={(event) => {
          const image = event.currentTarget
          image.style.display = "none"
          const parent = image.parentElement
          if (parent) {
            parent.style.background = fallbackColor
            parent.style.borderColor = fallbackColor
            parent.innerHTML = `<span style="color:white;font-size:9px;font-weight:800;line-height:1">${name[0]?.toUpperCase() ?? "?"}</span>`
          }
        }}
      />
    </span>
  )
}

function sourceSmoothPath(points: { x: number; y: number }[]) {
  if (points.length === 0) return ""
  if (points.length === 1) return `M ${points[0].x - 2} ${points[0].y} L ${points[0].x + 2} ${points[0].y}`
  if (points.length === 2) return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`

  let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`
  for (let index = 0; index < points.length - 1; index += 1) {
    const p0 = points[index - 1] ?? points[index]
    const p1 = points[index]
    const p2 = points[index + 1]
    const p3 = points[index + 2] ?? p2
    const cp1x = p1.x + (p2.x - p0.x) / 6
    const cp1y = p1.y + (p2.y - p0.y) / 6
    const cp2x = p2.x - (p3.x - p1.x) / 6
    const cp2y = p2.y - (p3.y - p1.y) / 6
    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`
  }
  return d
}

function SourceUsageChart({ domains, trend }: { domains: DomainSourceRow[], trend: SourceTrendPoint[] }) {
  const svgRef = useRef<SVGSVGElement>(null)
  const rows = domains
    .filter((domain) => domain.domain && sourcePct(domain) > 0)
    .slice(0, 6)
  const [hoverIdx, setHoverIdx] = useState<number | null>(null)
  const [pinnedIdx, setPinnedIdx] = useState<number | null>(null)
  const height = 210
  const width = 800
  const pad = { left: 38, right: 46, top: 20, bottom: 26 }
  const chartW = width - pad.left - pad.right
  const chartH = height - pad.top - pad.bottom
  const labels = trend.length ? trend : rows.length ? [{
    date: "current",
    label: "Today",
    total_chats: Math.max(...rows.map((row) => row.retrieval_count ?? 1), 1),
    domains: rows.map((row) => ({
      domain: row.domain,
      source_type: row.source_type,
      usage_percentage: sourcePct(row),
      citation_count: row.citation_count ?? Math.round(sourceCitations(row)),
    })),
  }] : []
  const series = rows.map((row, rowIndex) => {
    const points = labels.map((day, index) => {
      const found = day.domains.find((item) => item.domain === row.domain)
      const value = found?.usage_percentage ?? 0
      const citations = found?.citation_count ?? 0
      const x = labels.length === 1 ? pad.left + chartW / 2 : pad.left + (index / Math.max(1, labels.length - 1)) * chartW
      const y = pad.top + chartH - (value / 100) * chartH
      return { x, y, value, citations, label: day.label, date: day.date }
    })
    return {
      domain: row.domain,
      source_type: row.source_type,
      color: SOURCE_LINE_COLORS[rowIndex % SOURCE_LINE_COLORS.length],
      points,
    }
  })
  const maxVal = Math.max(10, Math.ceil(Math.max(...series.flatMap((line) => line.points.map((point) => point.value)), 0) / 10) * 10 + 5)
  const yTicks = maxVal <= 25 ? [0, 5, 10, 15, 20, 25] : maxVal <= 60 ? [0, 10, 20, 30, 40, 50, 60] : [0, 20, 40, 60, 80, 100]

  function xOf(index: number) {
    return labels.length <= 1 ? pad.left + chartW / 2 : pad.left + (index / (labels.length - 1)) * chartW
  }

  function yOf(value: number) {
    return pad.top + chartH - (value / maxVal) * chartH
  }

  function fmtLabel(day: SourceTrendPoint) {
    if (day.date === "current") return "Today"
    return new Date(`${day.date}T00:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short" })
  }

  function indexFromPointer(event: React.MouseEvent<SVGSVGElement>) {
    const rect = svgRef.current?.getBoundingClientRect()
    if (!rect || labels.length < 1) return null
    const relX = (event.clientX - rect.left) / rect.width
    const frac = Math.max(0, Math.min(1, (relX - pad.left / width) / (chartW / width)))
    const idx = Math.round(frac * (labels.length - 1))
    return Math.max(0, Math.min(labels.length - 1, idx))
  }

  function onMouseMove(event: React.MouseEvent<SVGSVGElement>) {
    const idx = indexFromPointer(event)
    if (idx !== null) setHoverIdx(idx)
  }

  function onClick(event: React.MouseEvent<SVGSVGElement>) {
    const idx = indexFromPointer(event)
    if (idx !== null) setPinnedIdx((current) => current === idx ? null : idx)
  }

  const activeIdx = hoverIdx ?? pinnedIdx
  const activeDay = activeIdx !== null ? labels[activeIdx] : null
  const tooltipX = activeIdx !== null ? (xOf(activeIdx) / width) * 100 : 0

  if (rows.length === 0 || labels.length === 0) {
    return (
      <div className="flex h-[250px] flex-col items-center justify-center rounded-2xl border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(248,250,252,0.74))] text-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
          <GlobeIcon />
        </div>
        <p className="mt-3 text-[13px] font-semibold text-slate-700">No real source data yet</p>
        <p className="mt-1 max-w-[360px] text-[12px] font-medium leading-relaxed text-slate-400">
          Sources appear here only after a scraped AI answer returns cited domains or extracted URLs.
        </p>
      </div>
    )
  }

  return (
    <div className="relative select-none">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
          className="cursor-pointer"
          style={{ width: "100%", height, display: "block" }}
          onMouseMove={onMouseMove}
          onMouseLeave={() => setHoverIdx(null)}
          onClick={onClick}
        >
          {yTicks.filter((tick) => tick <= maxVal).map((tick) => {
            const y = yOf(tick)
            return (
              <g key={tick}>
                <line x1={pad.left} x2={width - pad.right} y1={y.toFixed(1)} y2={y.toFixed(1)} stroke="#E8EDF4" strokeWidth="1" strokeDasharray={tick === 0 ? "0" : "3 5"} />
                <text x={pad.left - 6} y={(y + 3.2).toFixed(1)} fontSize="9.5" fill="#94A3B8" textAnchor="end" fontFamily="ui-sans-serif,system-ui,sans-serif">{tick}%</text>
              </g>
            )
          })}

          {labels.map((day, index) => {
            const x = xOf(index)
            return (
              <g key={day.date}>
                <text x={x.toFixed(1)} y={height - 6} fontSize="9.5" fill="#98A2B3" textAnchor="middle" fontFamily="ui-sans-serif,system-ui,sans-serif">{fmtLabel(day)}</text>
              </g>
            )
          })}

          {labels.map((day, index) => {
            const x = xOf(index)
            const bandWidth = Math.max(34, chartW / Math.max(labels.length - 1, 1))
            return <rect key={`${day.date}-hit-area`} x={x - bandWidth / 2} y={pad.top - 8} width={bandWidth} height={chartH + 16} fill="transparent" className="cursor-pointer" />
          })}

          {activeIdx !== null && (
            <>
              <rect x={xOf(activeIdx) - 14} y={pad.top} width="28" height={chartH} rx="10" fill="#2563EB" opacity="0.055" />
              <line x1={xOf(activeIdx).toFixed(1)} y1={pad.top} x2={xOf(activeIdx).toFixed(1)} y2={height - pad.bottom} stroke="#94A3B8" strokeWidth="1.4" strokeDasharray="4 4" />
            </>
          )}

          {series.map((line) => (
            <g key={line.domain}>
              <path
                d={sourceSmoothPath(line.points)}
                fill="none"
                stroke={line.color}
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
          ))}

          {activeIdx !== null && series.map((line) => {
            const point = line.points[activeIdx]
            return <circle key={line.domain} cx={xOf(activeIdx).toFixed(1)} cy={point.y.toFixed(1)} r="4.5" fill={line.color} stroke="white" strokeWidth="2.4" />
          })}
        </svg>

        {activeIdx !== null && activeDay && (
          <div
            className="pointer-events-none absolute top-1 z-20 min-w-[205px] rounded-xl bg-[#111113] px-3.5 py-3 text-white shadow-[0_14px_40px_rgba(0,0,0,0.22)]"
            style={{ left: `${Math.min(tooltipX + 2, 62)}%` }}
          >
            <p className="mb-2 flex items-center justify-between gap-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-zinc-400">
              {fmtLabel(activeDay)}
              {pinnedIdx === activeIdx && <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[8.5px] text-zinc-300">Pinned</span>}
            </p>
            <div className="flex flex-col gap-1.5">
              {series.map((line, index) => {
                const point = line.points[activeIdx]
                return (
                  <div key={line.domain} className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-1.5">
                      <span className="h-2 w-2 flex-shrink-0 rounded-full" style={{ background: SOURCE_LINE_COLORS[index % SOURCE_LINE_COLORS.length] }} />
                      <Fav domain={line.domain} />
                      <span className="truncate text-[11.5px] text-zinc-300">{line.domain}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11.5px] font-semibold tabular-nums text-white">
                      <span>{point.value.toFixed(0)}%</span>
                      <span className="text-zinc-500">{point.citations}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
    </div>
  )
}
function DomainDonut({ rows }: { rows: Array<DomainSourceRow | TopSourceRow> }) {
  const agg: Record<string, number> = {}
  for (const row of rows) agg[sourceType(row.source_type)] = (agg[sourceType(row.source_type)] ?? 0) + Math.max(1, sourcePct(row))

  const entries = Object.entries(agg).filter(([, value]) => value > 0)
  const total = entries.reduce((sum, [, value]) => sum + value, 0)
  const dominant = entries.length ? entries.sort((a, b) => b[1] - a[1])[0] : null
  const dominantPct = dominant && total > 0 ? Math.round((dominant[1] / total) * 100) : 0
  const radius = 50
  const circumference = 2 * Math.PI * radius
  let offset = 0

  const slices = entries.map(([type, value]) => {
    const cfg = TCFG[type] ?? TCFG.OTHER
    const dash = total > 0 ? (value / total) * (circumference - entries.length * 1.4) : 0
    const slice = { type, dash, offset, color: cfg.color, label: cfg.label }
    offset += dash + 1.4
    return slice
  })

  return (
    <div className="flex h-full flex-col p-4">
      <div className="rounded-2xl border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(248,250,252,0.74))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]">
        <p className="text-[12px] font-semibold text-slate-400">Domain type</p>
        <div className="flex flex-col items-center justify-center gap-4 pt-5">
          <div className="relative">
          <svg width="132" height="132" viewBox="0 0 132 132">
            <circle cx="66" cy="66" r={radius} fill="none" stroke="#E2E8F0" strokeWidth="13" />
            {slices.map((slice) => (
              <circle
                key={slice.type}
                cx="66"
                cy="66"
                r={radius}
                fill="none"
                stroke={slice.color}
                strokeWidth="13"
                strokeDasharray={`${slice.dash} ${circumference}`}
                strokeDashoffset={circumference / 4 - slice.offset}
              />
            ))}
          </svg>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[22px] font-bold leading-none text-slate-900">{dominantPct}%</span>
            <span className="mt-1 text-[10px] text-slate-400">{dominant ? (TCFG[dominant[0]] ?? TCFG.OTHER).label : "Sources"}</span>
          </div>
          </div>

          <div className="flex flex-wrap justify-center gap-x-3 gap-y-1.5">
          {slices.map((slice) => (
            <div key={slice.type} className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full" style={{ background: slice.color }} />
              <span className="text-[10.5px] font-medium text-slate-500">{slice.label}</span>
            </div>
          ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function DomainDetailHeader({
  row,
  onBack,
}: {
  row: DomainSourceRow | null
  onBack: () => void
}) {
  if (!row) return null

  return (
    <section className="dashboard-card">
      <div className="relative overflow-hidden p-5">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_12%_0%,rgba(37,99,235,0.10),transparent_22rem),linear-gradient(180deg,rgba(248,250,252,0.88),rgba(255,255,255,0))]" />
        <div className="relative flex flex-wrap items-start justify-between gap-5">
          <div className="min-w-0">
            <button
              type="button"
              onClick={onBack}
              className="mb-4 inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-[12px] font-bold text-slate-600 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition hover:bg-slate-50 hover:text-slate-900"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5" />
                <path d="M12 19l-7-7 7-7" />
              </svg>
              Back to all sources
            </button>

            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-[0_14px_34px_-24px_rgba(15,23,42,0.55)]">
                <Fav domain={row.domain} />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-black uppercase tracking-[0.14em] text-blue-600">Source detail</p>
                <h2 className="mt-1 truncate text-[24px] font-semibold tracking-[-0.04em] text-slate-950">{row.domain}</h2>
              </div>
            </div>
          </div>

          <div className="grid min-w-[520px] flex-1 grid-cols-4 gap-3">
            <div className="rounded-2xl border border-slate-200/80 bg-white/85 p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
              <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">Used</p>
              <p className="mt-2 text-[24px] font-semibold tracking-[-0.04em] text-slate-950">{sourcePct(row).toFixed(0)}%</p>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-white/85 p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
              <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">Avg. citations</p>
              <p className="mt-2 text-[24px] font-semibold tracking-[-0.04em] text-slate-950">{sourceCitations(row).toFixed(1)}</p>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-white/85 p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
              <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">URLs</p>
              <p className="mt-2 text-[24px] font-semibold tracking-[-0.04em] text-slate-950">{row.unique_urls ?? "-"}</p>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-white/85 p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
              <p className="mb-3 text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">Type</p>
              <Badge type={row.source_type} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function cleanUrl(url: string) {
  try {
    const parsed = new URL(url)
    return `${parsed.hostname}${parsed.pathname}`.replace(/\/$/, "")
  } catch {
    return url
  }
}

function hasOwnBrand(row: UrlSourceRow | SourceGapRow, ownBrand: string) {
  if ("mentioned_own_brand" in row && typeof row.mentioned_own_brand === "boolean") return row.mentioned_own_brand
  if (!("mentioned_brands" in row) || !row.mentioned_brands?.length) return false
  return row.mentioned_brands.some((brand) => brand.toLowerCase().includes(ownBrand.toLowerCase()))
}

function rowMentions(row: UrlSourceRow | SourceGapRow) {
  if ("mentioned_brands" in row && row.mentioned_brands) return row.mentioned_brands
  if ("mentioned_competitors" in row && row.mentioned_competitors) return row.mentioned_competitors
  return []
}

function RowSkeleton({ cols }: { cols: number }) {
  return (
    <tr className="h-[50px]">
      {Array.from({ length: cols }).map((_, index) => (
        <td key={index} className="px-4 py-3">
          <Sk cls="h-3 w-full" />
        </td>
      ))}
    </tr>
  )
}

type SourceContent = {
  title?: string | null
  content?: string | null
  snippet?: string | null
  content_length?: number
  source_type?: string | null
  url_type?: string | null
  platform?: string | null
  subreddit?: string | null
  mentioned_brands?: unknown
  fetch_status?: string | null
  error_reason?: string | null
  content_updated_at?: string | null
}

function sourceTitle(row: UrlSourceRow | SourceGapRow, content?: SourceContent | null) {
  return content?.title || row.title || cleanUrl(row.url)
}

function contentMentions(content?: SourceContent | null) {
  if (!Array.isArray(content?.mentioned_brands)) return []
  return content.mentioned_brands.filter((brand): brand is string => typeof brand === "string")
}

function SourceDetailsDrawer({
  row,
  content,
  contentLoading,
  ownBrand,
  onClose,
}: {
  row: UrlSourceRow | SourceGapRow
  content: SourceContent | null
  contentLoading: boolean
  ownBrand: string
  onClose: () => void
}) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [onClose])

  const mentions = [...new Set([...rowMentions(row), ...contentMentions(content)])]
  const ownMentioned = hasOwnBrand(row, ownBrand)
  const usedTotal = row.retrievals ?? 0
  const citations = row.citations ?? ("citation_rate" in row ? row.citation_rate ?? 0 : 0)
  const updatedAt = ("content_updated_at" in row ? row.content_updated_at : null) ?? content?.content_updated_at ?? null
  const suggestion = "suggested_action" in row ? row.suggested_action : null
  const gapScore = "gap_score" in row ? row.gap_score : null
  const bodyText = content?.content || content?.snippet || ("snippet" in row ? row.snippet : null)

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-zinc-950/25 backdrop-blur-[2px]" onClick={onClose}>
      <aside
        className="flex h-full w-full max-w-[520px] flex-col border-l border-zinc-200 bg-[#f7f7f8] shadow-[-18px_0_45px_rgba(15,23,42,0.16)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-5">
          <div className="flex min-w-0 items-center gap-2">
            <Fav domain={row.domain} />
            <div className="min-w-0">
              <p className="truncate text-[13px] font-semibold text-zinc-900">Source details</p>
              <p className="truncate text-[11px] font-medium text-zinc-400">{row.domain}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <div className="rounded-xl border border-zinc-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <div className="border-b border-zinc-100 px-4 py-4">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="line-clamp-2 text-[16px] font-semibold leading-snug text-zinc-900">
                    {sourceTitle(row, content)}
                  </h2>
                  <p className="mt-1 line-clamp-1 text-[11.5px] font-medium text-zinc-400">{cleanUrl(row.url)}</p>
                </div>
                <a
                  href={row.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-8 shrink-0 items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-2.5 text-[12px] font-semibold text-zinc-700 shadow-[0_1px_1px_rgba(0,0,0,0.04)] hover:bg-zinc-50"
                >
                  Open <ExternalIcon />
                </a>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Badge type={row.url_type || row.source_type || content?.url_type || content?.source_type} />
                {row.platform && <span className="rounded border border-zinc-200 bg-zinc-50 px-1.5 py-[2px] text-[10.5px] font-semibold text-zinc-500">{row.platform}</span>}
                {row.subreddit && <span className="rounded border border-zinc-200 bg-zinc-50 px-1.5 py-[2px] text-[10.5px] font-semibold text-zinc-500">r/{row.subreddit}</span>}
                {updatedAt && <span className="text-[11px] font-medium text-zinc-400">Updated {timeAgo(updatedAt)}</span>}
              </div>
            </div>

            <div className="grid grid-cols-3 divide-x divide-zinc-100 border-b border-zinc-100">
              <div className="px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400">Used total</p>
                <p className="mt-1 text-[18px] font-bold tabular-nums text-zinc-900">{usedTotal}</p>
              </div>
              <div className="px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400">Citations</p>
                <p className="mt-1 text-[18px] font-bold tabular-nums text-zinc-900">{citations.toFixed(1)}</p>
              </div>
              <div className="px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400">{ownBrand}</p>
                <span className={`mt-1 inline-flex rounded-md px-2 py-1 text-[11px] font-semibold ${ownMentioned ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
                  {ownMentioned ? "Mentioned" : "Not mentioned"}
                </span>
              </div>
            </div>

            <div className="px-4 py-4">
              <p className="mb-2 text-[12px] font-semibold text-zinc-800">Brand mentions</p>
              {mentions.length ? (
                <div className="flex flex-wrap gap-1.5">
                  {mentions.map((name) => (
                    <span key={name} className="inline-flex items-center gap-1.5 rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1 text-[11.5px] font-semibold text-zinc-700">
                      <MentionChip name={name} />
                      {name}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="rounded-lg border border-dashed border-zinc-200 bg-zinc-50 px-3 py-3 text-[12px] font-medium text-zinc-400">
                  No brand mentions were captured for this URL.
                </p>
              )}
            </div>
          </div>

          {(suggestion || gapScore !== null) && (
            <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50/70 p-4 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-[12px] font-semibold text-amber-900">Gap analysis</p>
                {gapScore !== null && <span className="rounded-md bg-white px-2 py-1 text-[11px] font-bold tabular-nums text-amber-700">Score {gapScore}</span>}
              </div>
              <p className="text-[12.5px] font-medium leading-relaxed text-amber-900/80">
                {suggestion || "This source is useful for AI answers and should be reviewed for brand visibility opportunities."}
              </p>
            </div>
          )}

          <div className="mt-3 rounded-xl border border-zinc-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3">
              <p className="text-[12px] font-semibold text-zinc-800">Related prompts</p>
              {"prompts" in row && row.prompts?.length ? <span className="text-[11px] font-semibold text-zinc-400">{row.prompts.length}</span> : null}
            </div>
            {"prompts" in row && row.prompts?.length ? (
              <div className="divide-y divide-zinc-100">
                {row.prompts.slice(0, 6).map((prompt) => (
                  <div key={prompt} className="px-4 py-3 text-[12.5px] font-medium leading-relaxed text-zinc-700">
                    {prompt}
                  </div>
                ))}
              </div>
            ) : (
              <p className="px-4 py-6 text-center text-[12px] font-medium text-zinc-400">No prompt list available for this source.</p>
            )}
          </div>

          <div className="mt-3 rounded-xl border border-zinc-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3">
              <p className="text-[12px] font-semibold text-zinc-800">Page content</p>
              {content?.fetch_status && <span className="rounded bg-zinc-100 px-1.5 py-[2px] text-[10px] font-bold text-zinc-500">{content.fetch_status}</span>}
            </div>
            {contentLoading ? (
              <div className="space-y-2 p-4">
                <Sk cls="h-3 w-full" />
                <Sk cls="h-3 w-11/12" />
                <Sk cls="h-3 w-4/5" />
              </div>
            ) : bodyText ? (
              <p className="max-h-[280px] overflow-y-auto whitespace-pre-wrap px-4 py-3 text-[12.5px] font-medium leading-relaxed text-zinc-600">
                {bodyText}
              </p>
            ) : (
              <p className="px-4 py-6 text-center text-[12px] font-medium text-zinc-400">
                Full content is not available yet. The table metadata is still shown above.
              </p>
            )}
          </div>
        </div>
      </aside>
    </div>
  )
}

export function SourcesTab() {
  const { selectedProject } = useProjects()
  const projectId = selectedProject?.id ?? null
  const { queryString } = useFilters()
  const { domains, urls, gaps, top, trend, isLoading } = useSources(projectId, queryString)
  const [mode, setMode] = useState<"domains" | "urls">("domains")
  const [gapAnalysis, setGapAnalysis] = useState(false)
  const [search, setSearch] = useState("")
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null)
  const [selectedSource, setSelectedSource] = useState<UrlSourceRow | SourceGapRow | null>(null)
  const [sourceContent, setSourceContent] = useState<SourceContent | null>(null)
  const [sourceContentLoading, setSourceContentLoading] = useState(false)

  const ownBrand = selectedProject?.brand_name ?? "Refractone"
  const domainRows: DomainSourceRow[] = domains.length ? domains : top.map((row) => ({
    domain: row.domain,
    source_type: row.source_type,
    retrieval_rate: row.used_percentage ?? row.usage_percentage ?? 0,
    citation_rate: row.avg_citations ?? 0,
  }))

  const searchNeedle = search.trim().toLowerCase()

  const filteredDomains = useMemo(() => {
    return domainRows.filter((row) => !searchNeedle || row.domain.toLowerCase().includes(searchNeedle) || sourceType(row.source_type).toLowerCase().includes(searchNeedle))
  }, [domainRows, searchNeedle])

  const selectedDomainRow = useMemo(() => {
    if (!selectedDomain) return null
    return domainRows.find((row) => row.domain === selectedDomain) ?? null
  }, [domainRows, selectedDomain])

  const filteredUrls = useMemo(() => {
    const baseRows: Array<UrlSourceRow | SourceGapRow> = gapAnalysis ? gaps : urls
    return baseRows.filter((row) => {
      const domainMatch = !selectedDomain || row.domain === selectedDomain
      const text = `${row.url} ${row.domain} ${row.title ?? ""} ${row.url_type ?? ""}`.toLowerCase()
      return domainMatch && (!searchNeedle || text.includes(searchNeedle))
    })
  }, [gapAnalysis, gaps, searchNeedle, selectedDomain, urls])

  const visibleGapCount = useMemo(() => {
    return gaps.filter((row) => !selectedDomain || row.domain === selectedDomain).length
  }, [gaps, selectedDomain])

  const tableTitle = mode === "domains"
    ? "All Domains"
    : gapAnalysis
      ? "Brand gaps"
      : selectedDomain
        ? `${selectedDomain} URLs`
        : "All URLs"

  const tableSubtitle = mode === "domains"
    ? "Click a domain to inspect the URLs influencing AI answers."
    : gapAnalysis
      ? `URLs where competitors are mentioned but ${ownBrand} is missing.`
      : selectedDomain
        ? `URLs from ${selectedDomain} that appear in AI answers.`
        : "All source URLs found across tracked AI answers."

  useEffect(() => {
    if (!selectedSource || !projectId) {
      setSourceContent(null)
      return
    }

    let cancelled = false
    setSourceContentLoading(true)
    setSourceContent(null)

    api.get<SourceContent>(`/sources/${projectId}/url-content`, { params: { url: selectedSource.url } })
      .then((response) => {
        if (!cancelled) setSourceContent(response.data)
      })
      .catch(() => {
        if (!cancelled) setSourceContent(null)
      })
      .finally(() => {
        if (!cancelled) setSourceContentLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [projectId, selectedSource])

  return (
    <div className="flex flex-col gap-4 pb-10">
      {!selectedDomain && (
        <div className="flex items-center justify-between">
        <div className="inline-flex rounded-lg bg-zinc-100/80 p-1">
          <SegmentButton active={mode === "domains"} onClick={() => {
            setMode("domains")
            setSelectedDomain(null)
            setGapAnalysis(false)
          }}>
            Domains
          </SegmentButton>
          <SegmentButton active={mode === "urls" && !gapAnalysis} onClick={() => {
            setMode("urls")
            setGapAnalysis(false)
          }}>
            URLs
          </SegmentButton>
          <SegmentButton active={mode === "urls" && gapAnalysis} onClick={() => {
            setMode("urls")
            setGapAnalysis(true)
          }}>
            Brand gaps
          </SegmentButton>
        </div>

        {selectedDomain && (
          <button
            onClick={() => {
              setSelectedDomain(null)
              setMode("domains")
            }}
            className="text-[12px] font-semibold text-zinc-500 hover:text-zinc-900"
          >
            Sources <span className="mx-1 text-zinc-300">/</span> {selectedDomain}
          </button>
        )}
        </div>
      )}

      {selectedDomain ? (
        <DomainDetailHeader
          row={selectedDomainRow}
          onBack={() => {
            setSelectedDomain(null)
            setMode("domains")
          }}
        />
      ) : (
        <div data-product-tour-id="sources-overview" className="grid grid-cols-[minmax(0,1fr)_350px] gap-3">
          <section className="dashboard-card">
            <div className="dashboard-card-header justify-start">
              <div className="flex items-center gap-2">
                <GlobeIcon />
                <span className="dashboard-card-title">Source Usage by Domain</span>
              </div>
            </div>
            <div className="px-4 py-3">
              {isLoading ? <Sk cls="h-[286px] w-full" /> : <SourceUsageChart domains={domainRows} trend={trend} />}
            </div>
          </section>

          <section className="dashboard-card">
            {isLoading ? <div className="p-5"><Sk cls="h-[286px] w-full rounded-xl" /></div> : <DomainDonut rows={domainRows} />}
          </section>
        </div>
      )}

      <section data-product-tour-id="sources-table" className="dashboard-card">
        <div className="dashboard-card-header min-h-[64px]">
          <div className="flex min-w-0 items-center gap-3 [&>span.text-zinc-400]:hidden">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-slate-950 text-white shadow-[0_14px_28px_-20px_rgba(15,23,42,0.78)]">
              <GlobeIcon />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="dashboard-card-title">{tableTitle}</p>
                {mode === "urls" && gapAnalysis && (
                  <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10.5px] font-bold text-amber-700">
                    {visibleGapCount} opportunities
                  </span>
                )}
              </div>
              <p className="mt-0.5 truncate text-[11.5px] font-medium text-slate-400">{tableSubtitle}</p>
            </div>
              <span className="text-zinc-400">ⓘ</span>
          </div>

          <div className="flex items-center gap-2">
            {mode === "urls" && (
              <div className="mr-1 inline-flex rounded-lg border border-slate-200 bg-slate-100/80 p-1">
                <button
                  type="button"
                  onClick={() => setGapAnalysis(false)}
                  className={[
                    "h-7 rounded-md px-3 text-[11.5px] font-bold transition",
                    !gapAnalysis ? "bg-white text-slate-950 shadow-sm" : "text-slate-500 hover:text-slate-800",
                  ].join(" ")}
                >
                  All URLs
                </button>
                <button
                  type="button"
                  onClick={() => setGapAnalysis(true)}
                  className={[
                    "h-7 rounded-md px-3 text-[11.5px] font-bold transition",
                    gapAnalysis ? "bg-slate-950 text-white shadow-sm" : "text-slate-500 hover:text-slate-800",
                  ].join(" ")}
                >
                  Brand gaps
                </button>
              </div>
            )}
            <div className="relative">
              <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400">
                <SearchIcon />
              </span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={mode === "domains" ? "Search domains" : "Search URLs"}
                className="h-8 w-56 rounded-md border border-zinc-200 bg-white pl-8 pr-3 text-[12px] outline-none placeholder:text-zinc-400 focus:border-zinc-300"
              />
            </div>
            <button
              onClick={() => void downloadCsvExport(projectId, "sources", queryString)}
              className="flex h-8 items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-2.5 text-[12px] font-medium text-zinc-600 hover:bg-zinc-50"
            >
              <ExportIcon />
              Export
            </button>
          </div>
        </div>

        {mode === "domains" ? (
          <div className="overflow-x-auto">
            <table className="peec-table w-full min-w-[900px] text-left text-[12px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/90 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  <th className="w-12 px-4 py-3">#</th>
                  <th className="px-4 py-3">
                    <span className="flex items-center justify-between"><span className="flex items-center gap-1.5"><GlobeIcon /> Source</span><SortIcon /></span>
                  </th>
                  <th className="px-4 py-3">Domain Type</th>
                  <th className="px-4 py-3 text-right">
                    <span className="flex items-center justify-end gap-2">Used <SortIcon /></span>
                  </th>
                  <th className="px-4 py-3 text-right">Avg. Citations</th>
                  <th className="px-4 py-3 text-right">URLs</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && Array.from({ length: 7 }).map((_, index) => <RowSkeleton key={index} cols={6} />)}

                {!isLoading && filteredDomains.map((row, index) => (
                  <tr
                    key={row.domain}
                    onClick={() => {
                      setSelectedDomain(row.domain)
                      setMode("urls")
                    }}
                    className={`h-[46px] cursor-pointer transition-colors hover:bg-blue-50/70 ${index % 2 === 0 ? "premium-row-even" : "premium-row-odd"}`}
                  >
                    <td className="px-4 py-2.5 text-[12px] font-semibold tabular-nums text-zinc-700">{index + 1}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <Fav domain={row.domain} />
                        <span className="text-[13px] font-semibold text-zinc-800">{row.domain}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5"><Badge type={row.source_type} /></td>
                    <td className="px-4 py-2.5 text-right text-[13px] font-bold tabular-nums text-zinc-800">{sourcePct(row).toFixed(0)}%</td>
                    <td className="px-4 py-2.5 text-right text-[13px] font-semibold tabular-nums text-zinc-600">{sourceCitations(row).toFixed(1)}</td>
                    <td className="px-4 py-2.5 text-right text-[13px] font-semibold tabular-nums text-zinc-500">{row.unique_urls ?? "-"}</td>
                  </tr>
                ))}

                {!isLoading && filteredDomains.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-14 text-center text-sm text-zinc-500">No sources found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="peec-table w-full min-w-[1180px] text-left text-[12px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/90 text-[11px] font-semibold text-slate-400">
                  <th className="w-[34%] px-4 py-3">URL</th>
                  <th className="px-4 py-3">URL Type</th>
                  <th className="px-4 py-3">{ownBrand} mentioned</th>
                  <th className="px-4 py-3">Mentions</th>
                  <th className="px-4 py-3 text-right">
                    <span className="flex items-center justify-end gap-2">Used total <SortIcon /></span>
                  </th>
                  <th className="px-4 py-3 text-right">
                    <span className="flex items-center justify-end gap-2">Avg. Citations <SortIcon /></span>
                  </th>
                  <th className="px-4 py-3">Updated</th>
                  <th className="w-28 px-4 py-3 text-right" />
                </tr>
              </thead>
              <tbody>
                {isLoading && Array.from({ length: 8 }).map((_, index) => <RowSkeleton key={index} cols={8} />)}

                {!isLoading && filteredUrls.map((row, index) => {
                  const mentions = rowMentions(row)
                  const updatedAt = "content_updated_at" in row ? row.content_updated_at : null
                  const usedTotal = row.retrievals ?? 0
                  const avgCitations = row.citations ?? ("citation_rate" in row ? row.citation_rate ?? 0 : 0)

                  return (
                    <tr key={`${row.url}-${index}`} className={`h-[52px] transition-colors hover:bg-blue-50/70 ${index % 2 === 0 ? "premium-row-even" : "premium-row-odd"}`}>
                      <td className="px-4 py-2.5">
                        <div className="flex min-w-0 items-start gap-2">
                          <Fav domain={row.domain} />
                          <div className="min-w-0">
                            <div className="line-clamp-1 text-[12.5px] font-semibold text-zinc-800">{row.title || cleanUrl(row.url)}</div>
                            <div className="line-clamp-1 text-[11px] font-medium text-zinc-400">{cleanUrl(row.url)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2.5">
                        <Badge type={row.url_type || row.source_type} />
                      </td>
                      <td className="px-4 py-2.5">
                        <span className={`inline-flex rounded-md px-2 py-1 text-[11px] font-semibold ${hasOwnBrand(row, ownBrand) ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
                          {hasOwnBrand(row, ownBrand) ? "Yes" : "No"}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-1">
                          {mentions.slice(0, 4).map((name) => <MentionChip key={name} name={name} />)}
                          {mentions.length > 4 && <span className="text-[11px] font-medium text-zinc-400">+{mentions.length - 4}</span>}
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-right text-[13px] font-bold tabular-nums text-zinc-800">{usedTotal}</td>
                      <td className="px-4 py-2.5 text-right text-[13px] font-semibold tabular-nums text-zinc-600">{avgCitations.toFixed(1)}</td>
                      <td className="px-4 py-2.5 text-[12px] font-medium text-zinc-500">{updatedAt ? timeAgo(updatedAt) : "-"}</td>
                      <td className="px-4 py-2.5 text-right">
                        <button
                          onClick={() => setSelectedSource(row)}
                          className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-[12px] font-semibold text-zinc-700 shadow-[0_1px_1px_rgba(0,0,0,0.04)] hover:bg-zinc-50"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  )
                })}

                {!isLoading && filteredUrls.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-5 py-14 text-center text-sm text-zinc-500">No URLs found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {selectedSource && (
        <SourceDetailsDrawer
          row={selectedSource}
          content={sourceContent}
          contentLoading={sourceContentLoading}
          ownBrand={ownBrand}
          onClose={() => setSelectedSource(null)}
        />
      )}
    </div>
  )
}
