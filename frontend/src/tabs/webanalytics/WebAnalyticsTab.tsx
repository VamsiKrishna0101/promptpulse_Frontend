import { useMemo, useState } from "react"
import { Activity, BarChart3, CalendarDays, Check, Copy, ExternalLink, Globe2, MousePointerClick, Plus, RotateCcw, Search, Timer, Users } from "lucide-react"
import { useFilters } from "@/hooks/useFilters"
import { useProjects } from "@/hooks/useProjects"
import { useWebAnalytics, type AnalyticsBreakdownRow, type AnalyticsPoint, type CustomEventRow } from "@/hooks/useWebAnalytics"
import { Fav, Sk } from "@/tabs/overview/overview"
import { downloadCsvExport } from "@/lib/exportDownload"

type Drawer = "setup" | "event" | null

const EVENT_TYPES: { label: string; value: CustomEventRow["type"] }[] = [
  { label: "Total chart", value: "TOTAL_CHART" },
  { label: "Average chart", value: "AVERAGE_CHART" },
  { label: "Total list", value: "TOTAL_LIST" },
  { label: "Average list", value: "AVERAGE_LIST" },
]

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-IN").format(value)
}

function formatDuration(ms: number) {
  if (!ms) return "0s"
  const seconds = Math.round(ms / 1000)
  if (seconds < 60) return `${seconds}s`
  const mins = Math.floor(seconds / 60)
  const rest = seconds % 60
  return rest ? `${mins}m ${rest}s` : `${mins}m`
}

function shortDate(date: string) {
  return new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
}

function CardTitle({ icon, title, subtitle, action }: { icon: React.ReactNode; title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex h-12 items-center justify-between border-b border-zinc-100 px-4">
      <div className="flex min-w-0 items-center gap-1.5">
        <span className="text-zinc-400">{icon}</span>
        <span className="text-[12.5px] font-semibold text-zinc-800">{title}</span>
        {subtitle && <span className="truncate text-[11.5px] text-zinc-400">{subtitle}</span>}
      </div>
      {action}
    </div>
  )
}

function MetricCell({ label, value, hint, icon }: { label: string; value: string; hint?: string; icon: React.ReactNode }) {
  return (
    <div className="flex min-h-[76px] items-center gap-3 px-4 py-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-500 shadow-[0_1px_1px_rgba(0,0,0,0.04)]">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400">{label}</p>
        <p className="mt-1 text-[19px] font-bold leading-none tabular-nums text-zinc-900">{value}</p>
        {hint && <p className="mt-1 text-[11px] font-medium text-zinc-400">{hint}</p>}
      </div>
    </div>
  )
}

function TrafficChart({ data, topPages, topReferrers }: { data: AnalyticsPoint[]; topPages: AnalyticsBreakdownRow[]; topReferrers: AnalyticsBreakdownRow[] }) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)
  const [pinnedIndex, setPinnedIndex] = useState<number | null>(null)
  const points = data.length ? data : []
  const max = Math.max(1, ...points.map(point => Math.max(point.page_views, point.visitors)))
  const width = 720
  const height = 250
  const pad = { top: 18, right: 24, bottom: 34, left: 42 }
  const innerW = width - pad.left - pad.right
  const innerH = height - pad.top - pad.bottom

  function xy(point: AnalyticsPoint, index: number, key: "page_views" | "visitors") {
    const x = pad.left + (points.length === 1 ? innerW : (index / (points.length - 1)) * innerW)
    const y = pad.top + innerH - (point[key] / max) * innerH
    return { x, y }
  }

  function smoothPathFor(key: "page_views" | "visitors") {
    if (points.length === 0) return ""
    if (points.length === 1) {
      const p = xy(points[0], 0, key)
      return `M ${p.x} ${p.y}`
    }
    const coords = points.map((point, index) => xy(point, index, key))
    return coords.reduce((path, point, index) => {
      if (index === 0) return `M ${point.x.toFixed(1)} ${point.y.toFixed(1)}`
      const prev = coords[index - 1]
      const cpX = prev.x + (point.x - prev.x) * 0.5
      return `${path} C ${cpX.toFixed(1)} ${prev.y.toFixed(1)}, ${cpX.toFixed(1)} ${point.y.toFixed(1)}, ${point.x.toFixed(1)} ${point.y.toFixed(1)}`
    }, "")
  }

  function areaPathFor(key: "page_views" | "visitors") {
    if (points.length === 0) return ""
    const line = smoothPathFor(key)
    const first = xy(points[0], 0, key)
    const last = xy(points[points.length - 1], points.length - 1, key)
    const baseY = pad.top + innerH
    return `${line} L ${last.x.toFixed(1)} ${baseY.toFixed(1)} L ${first.x.toFixed(1)} ${baseY.toFixed(1)} Z`
  }

  const activeIndex = hoverIndex ?? pinnedIndex ?? Math.max(points.length - 1, 0)
  const activePoint = points[activeIndex]
  const activeViews = activePoint ? xy(activePoint, activeIndex, "page_views") : null
  const activeVisitors = activePoint ? xy(activePoint, activeIndex, "visitors") : null
  const topPage = topPages[0]
  const topReferrer = topReferrers[0]

  function indexFromPointer(event: React.PointerEvent<SVGSVGElement>) {
    if (points.length === 0) return null

    const rect = event.currentTarget.getBoundingClientRect()
    const svgX = ((event.clientX - rect.left) / rect.width) * width
    const clampedX = Math.min(width - pad.right, Math.max(pad.left, svgX))
    const ratio = points.length === 1 ? 0 : (clampedX - pad.left) / innerW
    return Math.min(points.length - 1, Math.max(0, Math.round(ratio * (points.length - 1))))
  }

  function updateHoverFromPointer(event: React.PointerEvent<SVGSVGElement>) {
    const nextIndex = indexFromPointer(event)
    if (nextIndex !== null) setHoverIndex(nextIndex)
  }

  function pinFromPointer(event: React.PointerEvent<SVGSVGElement>) {
    const nextIndex = indexFromPointer(event)
    if (nextIndex !== null) setPinnedIndex(current => current === nextIndex ? null : nextIndex)
  }

  return (
    <div className="relative">
      <div className="pointer-events-none absolute left-4 top-4 z-10 rounded-xl border border-white/80 bg-white/85 px-3 py-2 shadow-[0_8px_28px_rgba(15,23,42,0.08)] backdrop-blur">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400">Top performer</p>
        <p className="mt-1 max-w-[220px] truncate text-[12.5px] font-bold text-zinc-900">{topPage?.name ?? "Waiting for page data"}</p>
        <p className="mt-0.5 text-[11px] font-medium text-zinc-500">{topPage ? `${topPage.count} views` : "Add visits to populate trend"}</p>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-[250px] w-full cursor-pointer overflow-visible"
        onPointerMove={updateHoverFromPointer}
        onPointerLeave={() => setHoverIndex(null)}
        onPointerDown={pinFromPointer}
      >
        <defs>
          <linearGradient id="trafficViewsFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#18181b" stopOpacity="0.14" />
            <stop offset="100%" stopColor="#18181b" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="trafficVisitorsFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.14" />
            <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
          </linearGradient>
          <filter id="softLineShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="7" stdDeviation="8" floodColor="#18181b" floodOpacity="0.10" />
          </filter>
        </defs>

        {[0, 0.25, 0.5, 0.75, 1].map((tick) => {
          const y = pad.top + innerH - tick * innerH
          const label = Math.round(max * tick)
          return (
            <g key={tick}>
              <line x1={pad.left} x2={width - pad.right} y1={y} y2={y} stroke="#ececef" strokeWidth="1" />
              <text x={pad.left - 10} y={y + 4} textAnchor="end" className="fill-zinc-400 text-[10px]">{label}</text>
            </g>
          )
        })}
        {points.map((point, index) => {
          const x = pad.left + (points.length === 1 ? innerW : (index / (points.length - 1)) * innerW)
          const bandWidth = Math.max(34, innerW / Math.max(points.length - 1, 1))
          return (
            <g key={point.date} className="cursor-pointer" onMouseEnter={() => setHoverIndex(index)}>
              <line x1={x} x2={x} y1={pad.top} y2={pad.top + innerH} stroke="#f3f3f5" strokeWidth="1" />
              {(index === 0 || index === points.length - 1 || index % 3 === 0) && (
                <text x={x} y={height - 8} textAnchor="middle" className="fill-zinc-400 text-[10px]">{shortDate(point.date)}</text>
              )}
              <rect x={x - bandWidth / 2} y={pad.top - 8} width={bandWidth} height={innerH + 18} fill="transparent" />
            </g>
          )
        })}
        <path d={areaPathFor("page_views")} fill="url(#trafficViewsFill)" />
        <path d={areaPathFor("visitors")} fill="url(#trafficVisitorsFill)" />
        <path d={smoothPathFor("page_views")} fill="none" stroke="#18181b" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" filter="url(#softLineShadow)" />
        <path d={smoothPathFor("visitors")} fill="none" stroke="#2563eb" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        {activeViews && activeVisitors && activePoint && (
          <g>
            <rect x={activeViews.x - 17} y={pad.top} width="34" height={innerH} rx="10" fill="#2563eb" opacity={pinnedIndex === activeIndex ? "0.075" : "0.045"} />
            <line x1={activeViews.x} x2={activeViews.x} y1={pad.top} y2={pad.top + innerH} stroke="#94a3b8" strokeWidth="1.4" strokeDasharray="4 4" />
            <circle cx={activeViews.x} cy={activeViews.y} r="7" fill="#18181b" opacity="0.12" />
            <circle cx={activeVisitors.x} cy={activeVisitors.y} r="7" fill="#2563eb" opacity="0.14" />
            <circle cx={activeViews.x} cy={activeViews.y} r="4.5" fill="#18181b" stroke="#fff" strokeWidth="2.2" />
            <circle cx={activeVisitors.x} cy={activeVisitors.y} r="4.5" fill="#2563eb" stroke="#fff" strokeWidth="2.2" />
            <foreignObject x={Math.min(activeViews.x + 12, width - 192)} y={Math.max(pad.top + 8, activeViews.y - 76)} width="180" height="98">
              <div className="rounded-xl bg-[#111113] px-3 py-2 text-white shadow-[0_14px_40px_rgba(0,0,0,0.22)]">
                <p className="flex items-center justify-between gap-3 text-[11px] font-bold">
                  {new Date(activePoint.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                  {pinnedIndex === activeIndex && <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[8.5px] font-semibold text-zinc-300">Pinned</span>}
                </p>
                <div className="mt-2 space-y-1.5">
                  <p className="flex items-center justify-between gap-3 text-[11.5px]"><span className="flex items-center gap-1.5 text-zinc-300"><span className="h-2 w-2 rounded-full bg-zinc-500" />Page views</span><b>{activePoint.page_views}</b></p>
                  <p className="flex items-center justify-between gap-3 text-[11.5px]"><span className="flex items-center gap-1.5 text-zinc-300"><span className="h-2 w-2 rounded-full bg-blue-500" />Visitors</span><b className="text-blue-200">{activePoint.visitors}</b></p>
                </div>
              </div>
            </foreignObject>
          </g>
        )}
        {points.map((point, index) => {
          const p = xy(point, index, "page_views")
          const isActive = index === activeIndex
          const visitorPoint = xy(point, index, "visitors")
          return (
            <g key={`${point.date}-points`} className="cursor-pointer" onMouseEnter={() => setHoverIndex(index)}>
              <circle cx={p.x} cy={p.y} r={isActive ? "4.5" : "2.8"} fill="#18181b" stroke={isActive ? "#fff" : "none"} strokeWidth="2" />
              <circle cx={visitorPoint.x} cy={visitorPoint.y} r={isActive ? "4.5" : "2.8"} fill="#2563eb" stroke={isActive ? "#fff" : "none"} strokeWidth="2" />
              <circle cx={p.x} cy={p.y} r="12" fill="transparent" />
              <circle cx={visitorPoint.x} cy={visitorPoint.y} r="12" fill="transparent" />
            </g>
          )
        })}
      </svg>

      <div className="flex items-center justify-between border-t border-zinc-100 px-4 py-3">
        <div className="flex items-center gap-4 text-[11.5px] font-medium text-zinc-500">
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-zinc-900" /> Page views</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-blue-600" /> Visitors</span>
        </div>
        <div className="hidden items-center gap-2 text-[11px] font-medium text-zinc-400 md:flex">
          <span>Top referrer</span>
          <span className="rounded-md border border-zinc-200 bg-white px-2 py-1 font-semibold text-zinc-700">{topReferrer?.name ?? "Direct"}</span>
        </div>
      </div>
    </div>
  )
}

function MiniShare({ value, max }: { value: number; max: number }) {
  const pct = max ? Math.max(5, Math.round((value / max) * 100)) : 0
  return (
    <div className="h-1.5 w-20 overflow-hidden rounded-full bg-zinc-100">
      <div className="h-full rounded-full bg-zinc-900" style={{ width: `${pct}%` }} />
    </div>
  )
}

function BreakdownTable({ title, rows }: { title: string; rows: AnalyticsBreakdownRow[] }) {
  const max = Math.max(1, ...rows.map(row => row.count))
  return (
    <div className="dashboard-card">
      <CardTitle icon={<BarChart3 size={13} />} title={title} />
      <table className="peec-table w-full text-left">
        <tbody>
          {(rows.length ? rows.slice(0, 5) : [{ name: "No data yet", count: 0 }]).map((row, index) => (
            <tr key={`${title}-${row.name}`} className={index % 2 === 0 ? "premium-row-even" : "premium-row-odd"}>
              <td className="px-4 py-2.5 text-[12.5px] font-semibold text-zinc-700">{row.name}</td>
              <td className="px-3 py-2.5">
                <MiniShare value={row.count} max={max} />
              </td>
              <td className="px-4 py-2.5 text-right text-[12.5px] font-bold tabular-nums text-zinc-800">{row.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function SetupDrawer({
  open,
  onClose,
  snippet,
  siteKey,
  isSaving,
  onRegenerate,
}: {
  open: boolean
  onClose: () => void
  snippet: string
  siteKey?: string
  isSaving: boolean
  onRegenerate: () => void
}) {
  const [copied, setCopied] = useState(false)
  if (!open) return null

  async function copySnippet() {
    await navigator.clipboard.writeText(snippet)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1400)
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-zinc-950/25 backdrop-blur-[2px]" onClick={onClose}>
      <aside className="flex h-full w-full max-w-[500px] flex-col border-l border-zinc-200 bg-[#f7f7f8] shadow-[-18px_0_45px_rgba(15,23,42,0.16)]" onClick={(event) => event.stopPropagation()}>
        <div className="flex h-14 items-center justify-between border-b border-zinc-200 bg-white px-5">
          <div>
            <p className="text-[14px] font-semibold text-zinc-900">Install tracker</p>
            <p className="text-[11px] font-medium text-zinc-400">Add this script to your website head tag</p>
          </div>
          <button onClick={onClose} className="rounded-md px-2 py-1 text-[12px] font-semibold text-zinc-500 hover:bg-zinc-100">Close</button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <p className="text-[12px] font-semibold text-zinc-800">Tracking script</p>
            <pre className="mt-3 overflow-x-auto rounded-lg border border-zinc-200 bg-[#111113] p-3 text-[11.5px] font-medium leading-relaxed text-zinc-100">{snippet}</pre>
            <button onClick={copySnippet} className="mt-3 inline-flex h-8 items-center gap-2 rounded-md bg-zinc-900 px-3 text-[12px] font-semibold text-white hover:bg-zinc-800">
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? "Copied" : "Copy script"}
            </button>
          </div>

          <div className="mt-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <p className="text-[12px] font-semibold text-zinc-800">Site key</p>
            <p className="mt-2 rounded-lg border border-zinc-200 bg-[#f8f8f9] px-3 py-2 font-mono text-[11.5px] text-zinc-700">{siteKey}</p>
            <button disabled={isSaving} onClick={onRegenerate} className="mt-3 inline-flex h-8 items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 text-[12px] font-semibold text-zinc-700 hover:bg-zinc-50 disabled:opacity-50">
              <RotateCcw size={14} />
              Regenerate key
            </button>
          </div>
        </div>
      </aside>
    </div>
  )
}

function CreateSiteCard({ brandName, isSaving, onCreate }: { brandName: string; isSaving: boolean; onCreate: (input: { name: string; domain: string }) => void }) {
  const [name, setName] = useState(brandName)
  const [domain, setDomain] = useState("")

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <div className="border-b border-zinc-100 px-5 py-4">
        <p className="text-[14px] font-semibold text-zinc-900">Set up web analytics</p>
        <p className="mt-1 text-[12px] font-medium text-zinc-500">Create your first tracked site to unlock traffic, source, and conversion analytics.</p>
      </div>
      <div className="grid grid-cols-[1fr_1fr_auto] gap-3 p-5">
        <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Site name" className="h-9 rounded-md border border-zinc-200 bg-white px-3 text-[13px] font-medium outline-none focus:border-zinc-300" />
        <input value={domain} onChange={(event) => setDomain(event.target.value)} placeholder="example.com" className="h-9 rounded-md border border-zinc-200 bg-white px-3 text-[13px] font-medium outline-none focus:border-zinc-300" />
        <button disabled={isSaving || !name.trim() || !domain.trim()} onClick={() => onCreate({ name, domain })} className="h-9 rounded-md bg-zinc-900 px-4 text-[12px] font-semibold text-white hover:bg-zinc-800 disabled:opacity-50">
          Create site
        </button>
      </div>
    </div>
  )
}

function AddEventDrawer({ open, isSaving, onClose, onCreate }: { open: boolean; isSaving: boolean; onClose: () => void; onCreate: (input: { title: string; type: CustomEventRow["type"]; key?: string }) => void }) {
  const [title, setTitle] = useState("")
  const [type, setType] = useState<CustomEventRow["type"]>("TOTAL_CHART")
  const [key, setKey] = useState("")
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-zinc-950/25 backdrop-blur-[2px]" onClick={onClose}>
      <aside className="flex h-full w-full max-w-[430px] flex-col border-l border-zinc-200 bg-[#f7f7f8] shadow-[-18px_0_45px_rgba(15,23,42,0.16)]" onClick={(event) => event.stopPropagation()}>
        <div className="flex h-14 items-center justify-between border-b border-zinc-200 bg-white px-5">
          <div>
            <p className="text-[14px] font-semibold text-zinc-900">Add custom event</p>
            <p className="text-[11px] font-medium text-zinc-400">Track clicks, leads, signups, and conversions</p>
          </div>
          <button onClick={onClose} className="rounded-md px-2 py-1 text-[12px] font-semibold text-zinc-500 hover:bg-zinc-100">Close</button>
        </div>
        <div className="flex flex-1 flex-col p-5">
          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <label className="text-[12px] font-semibold text-zinc-700">Event name</label>
            <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Book demo click" className="mt-2 h-9 w-full rounded-md border border-zinc-200 px-3 text-[13px] font-medium outline-none focus:border-zinc-300" />
            <label className="mt-4 block text-[12px] font-semibold text-zinc-700">Aggregation type</label>
            <select value={type} onChange={(event) => setType(event.target.value as CustomEventRow["type"])} className="mt-2 h-9 w-full rounded-md border border-zinc-200 bg-white px-3 text-[13px] font-medium outline-none focus:border-zinc-300">
              {EVENT_TYPES.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
            <label className="mt-4 block text-[12px] font-semibold text-zinc-700">Default key</label>
            <input value={key} onChange={(event) => setKey(event.target.value)} placeholder="CTA / signup / demo" className="mt-2 h-9 w-full rounded-md border border-zinc-200 px-3 text-[13px] font-medium outline-none focus:border-zinc-300" />
          </div>
          <div className="mt-auto flex justify-end gap-2">
            <button onClick={onClose} className="h-8 rounded-md border border-zinc-200 bg-white px-3 text-[12px] font-semibold text-zinc-600 hover:bg-zinc-50">Cancel</button>
            <button disabled={isSaving || !title.trim()} onClick={() => { onCreate({ title, type, key: key || undefined }); onClose() }} className="h-8 rounded-md bg-zinc-900 px-3 text-[12px] font-semibold text-white hover:bg-zinc-800 disabled:opacity-50">Create event</button>
          </div>
        </div>
      </aside>
    </div>
  )
}

export function WebAnalyticsTab() {
  const { selectedProject } = useProjects()
  const { queryString } = useFilters()
  const projectId = selectedProject?.id ?? null
  const analytics = useWebAnalytics(projectId, queryString || "?days=30")
  const [drawer, setDrawer] = useState<Drawer>(null)

  const facts = analytics.facts
  const summary = analytics.summary
  const maxReferrer = useMemo(() => Math.max(1, ...analytics.referrers.map(row => row.count)), [analytics.referrers])
  const hasSite = !!analytics.selectedSite

  if (!hasSite && !analytics.isLoading) {
    return (
      <div className="flex flex-col gap-3 pb-10">
        <CreateSiteCard
          brandName={selectedProject?.brand_name ?? "Website"}
          isSaving={analytics.isSaving}
          onCreate={(input) => void analytics.createSite(input)}
        />
      </div>
    )
  }

  return (
    <div data-product-tour-id="analytics-shell" className="flex flex-col gap-4 pb-10">
      <section className="dashboard-card">
        <div className="dashboard-card-header h-[58px]">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-950 text-white">
              <Globe2 size={15} />
            </div>
            <div className="min-w-0">
              <h1 className="dashboard-card-title truncate">Web Analytics</h1>
              <p className="dashboard-card-subtitle mt-0.5 truncate">{analytics.selectedSite?.domain ?? "Website traffic and conversion analytics"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {analytics.sites.length > 1 && (
              <select value={analytics.selectedSite?.id ?? ""} onChange={(event) => analytics.selectSite(event.target.value)} className="h-8 rounded-md border border-zinc-200 bg-white px-2 text-[12px] font-semibold text-zinc-700 outline-none">
                {analytics.sites.map(site => <option key={site.id} value={site.id}>{site.name}</option>)}
              </select>
            )}
            <button onClick={() => void analytics.refresh({ silent: true })} className="h-8 rounded-md border border-zinc-200 bg-white px-3 text-[12px] font-semibold text-zinc-700 shadow-sm hover:bg-zinc-50">
              Refresh
            </button>
            <button onClick={() => setDrawer("setup")} className="h-8 rounded-md border border-zinc-200 bg-white px-3 text-[12px] font-semibold text-zinc-700 shadow-sm hover:bg-zinc-50">
              Install tracker
            </button>
          </div>
        </div>

        <div className="grid grid-cols-4 divide-x divide-slate-200/80 bg-white/70">
          {analytics.isLoading ? (
            Array.from({ length: 4 }).map((_, index) => <div key={index} className="px-4 py-4"><Sk cls="h-10 w-full" /></div>)
          ) : (
            <>
              <MetricCell icon={<Activity size={15} />} label="Active visitors" value={formatNumber(facts?.active_visitors ?? 0)} hint="last 5 minutes" />
              <MetricCell icon={<CalendarDays size={15} />} label="Views today" value={formatNumber(facts?.views_today ?? 0)} hint={`${formatNumber(facts?.views_month ?? 0)} this month`} />
              <MetricCell icon={<Users size={15} />} label="Visitors" value={formatNumber(summary?.visitors ?? 0)} hint={`${summary?.page_views_delta_pct ?? 0}% vs previous`} />
              <MetricCell icon={<Timer size={15} />} label="Avg duration" value={formatDuration(facts?.average_duration_ms ?? 0)} hint={`${facts?.bounce_rate ?? 0}% bounce`} />
            </>
          )}
        </div>
      </section>

      <div className="grid grid-cols-[minmax(0,1.45fr)_minmax(360px,0.85fr)] gap-3">
        <section className="dashboard-card">
          <CardTitle
            icon={<BarChart3 size={13} />}
            title="Traffic trend"
            subtitle="page views and unique visitors"
            action={<button onClick={() => void downloadCsvExport(projectId, "web-analytics", queryString || "?days=30")} className="premium-action">Export</button>}
          />
          {analytics.isLoading ? <div className="p-4"><Sk cls="h-[260px] w-full" /></div> : <TrafficChart data={analytics.timeseries} topPages={analytics.pages} topReferrers={analytics.referrers} />}
        </section>

        <section className="dashboard-card">
          <CardTitle icon={<ExternalLink size={13} />} title="Top referrers" subtitle="traffic sources" />
          <table className="peec-table w-full text-left">
            <thead>
              <tr className="bg-slate-50/90">
                <th className="px-4 py-2 text-[10px] font-semibold uppercase tracking-wide text-zinc-400">Source</th>
                <th className="px-3 py-2 text-right text-[10px] font-semibold uppercase tracking-wide text-zinc-400">Visits</th>
                <th className="px-4 py-2 text-right text-[10px] font-semibold uppercase tracking-wide text-zinc-400">Share</th>
              </tr>
            </thead>
            <tbody>
              {(analytics.referrers.length ? analytics.referrers.slice(0, 7) : [{ name: "Direct", count: 0 }]).map((row, index) => (
                <tr key={row.name} className={index % 2 === 0 ? "premium-row-even" : "premium-row-odd"}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {row.name !== "Direct" && <Fav domain={row.name} />}
                      <span className="text-[12.5px] font-semibold text-zinc-800">{row.name}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-right text-[12.5px] font-bold tabular-nums text-zinc-800">{row.count}</td>
                  <td className="px-4 py-3"><div className="flex justify-end"><MiniShare value={row.count} max={maxReferrer} /></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>

      <section className="dashboard-card">
        <CardTitle icon={<Search size={13} />} title="Top pages" subtitle="highest visited paths" />
        <table className="peec-table w-full text-left">
          <thead>
            <tr className="bg-slate-50/90">
              <th className="w-12 px-4 py-2 text-[10px] font-semibold uppercase tracking-wide text-zinc-400">#</th>
              <th className="px-4 py-2 text-[10px] font-semibold uppercase tracking-wide text-zinc-400">Page</th>
              <th className="px-4 py-2 text-right text-[10px] font-semibold uppercase tracking-wide text-zinc-400">Views</th>
              <th className="px-4 py-2 text-right text-[10px] font-semibold uppercase tracking-wide text-zinc-400">Sessions</th>
            </tr>
          </thead>
          <tbody>
            {(analytics.pages.length ? analytics.pages.slice(0, 10) : [{ name: "No pages tracked yet", count: 0, sessions: 0 }]).map((row, index) => (
              <tr key={row.name} className={index % 2 === 0 ? "premium-row-even" : "premium-row-odd"}>
                <td className="px-4 py-3 text-[12px] font-medium tabular-nums text-zinc-400">{index + 1}</td>
                <td className="px-4 py-3 text-[12.5px] font-semibold text-zinc-800">{row.name}</td>
                <td className="px-4 py-3 text-right text-[12.5px] font-bold tabular-nums text-zinc-800">{row.count}</td>
                <td className="px-4 py-3 text-right text-[12.5px] font-semibold tabular-nums text-zinc-600">{row.sessions ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <div className="grid grid-cols-5 gap-3">
        <BreakdownTable title="Browsers" rows={analytics.browsers} />
        <BreakdownTable title="Devices" rows={analytics.devices} />
        <BreakdownTable title="Systems" rows={analytics.systems} />
        <BreakdownTable title="Languages" rows={analytics.languages} />
        <BreakdownTable title="Screens" rows={analytics.screens} />
      </div>

      <section className="dashboard-card">
        <CardTitle
          icon={<MousePointerClick size={13} />}
          title="Custom events"
          subtitle="clicks, signups, and conversions"
          action={<button onClick={() => setDrawer("event")} className="inline-flex h-7 items-center gap-1.5 rounded-md bg-zinc-900 px-2.5 text-[11.5px] font-semibold text-white hover:bg-zinc-800"><Plus size={13} /> Add event</button>}
        />
        <table className="peec-table w-full text-left">
          <thead>
            <tr className="bg-slate-50/90">
              <th className="px-4 py-2 text-[10px] font-semibold uppercase tracking-wide text-zinc-400">Event</th>
              <th className="px-4 py-2 text-[10px] font-semibold uppercase tracking-wide text-zinc-400">Type</th>
              <th className="px-4 py-2 text-right text-[10px] font-semibold uppercase tracking-wide text-zinc-400">Actions</th>
              <th className="px-4 py-2 text-right text-[10px] font-semibold uppercase tracking-wide text-zinc-400">Key</th>
            </tr>
          </thead>
          <tbody>
            {(analytics.customEvents.length ? analytics.customEvents : [{ id: "empty", title: "No custom events yet", type: "TOTAL_CHART" as const, key: null, created_at: "", updated_at: "", _count: { actions: 0 } }]).map((event, index) => (
              <tr key={event.id} className={index % 2 === 0 ? "premium-row-even" : "premium-row-odd"}>
                <td className="px-4 py-3 text-[12.5px] font-semibold text-zinc-800">{event.title}</td>
                <td className="px-4 py-3"><span className="rounded-md border border-zinc-200 bg-white px-2 py-1 text-[11px] font-semibold text-zinc-600">{event.type.replace("_", " ").toLowerCase()}</span></td>
                <td className="px-4 py-3 text-right text-[12.5px] font-bold tabular-nums text-zinc-800">{event._count?.actions ?? 0}</td>
                <td className="px-4 py-3 text-right text-[12.5px] font-semibold text-zinc-500">{event.key ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <SetupDrawer
        open={drawer === "setup"}
        onClose={() => setDrawer(null)}
        snippet={analytics.trackerSnippet}
        siteKey={analytics.selectedSite?.public_key}
        isSaving={analytics.isSaving}
        onRegenerate={() => analytics.selectedSite && void analytics.regenerateKey(analytics.selectedSite.id)}
      />
      <AddEventDrawer
        open={drawer === "event"}
        isSaving={analytics.isSaving}
        onClose={() => setDrawer(null)}
        onCreate={(input) => void analytics.createCustomEvent(input)}
      />
    </div>
  )
}
