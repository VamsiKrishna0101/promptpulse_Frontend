import { useProjects } from "@/hooks/useProjects"
import { useDashboard } from "@/hooks/useDashboard"
import { useVisibilityTimeSeries } from "@/hooks/useVisibilityTimeSeries"
import { useRecentChats } from "@/hooks/useRecentChats"
import { useFilters } from "@/hooks/useFilters"
import { VisibilityChart } from "./VisibilityChart"
import type { RecentChat } from "@/hooks/useRecentChats"
import { ChatModal } from "@/components/chat/ChatModal"
import { useState } from "react"
import { Link } from "react-router-dom"
import { engineKey, modelIconUrl } from "@/lib/aiModels"

/* ─── type label/color config ──────────────────────────────── */
const TCFG: Record<string, { label: string; color: string; tw: string }> = {
    COMPETITOR:    { label: "Competitor",    color: "#ef4444", tw: "bg-red-50 text-red-600 border border-red-100" },
    YOU:           { label: "You",           color: "#22c55e", tw: "bg-emerald-50 text-emerald-600 border border-emerald-100" },
    UGC:           { label: "UGC",           color: "#3b82f6", tw: "bg-blue-50 text-blue-600 border border-blue-100" },
    EDITORIAL:     { label: "Editorial",     color: "#f59e0b", tw: "bg-amber-50 text-amber-600 border border-amber-100" },
    CORPORATE:     { label: "Corporate",     color: "#8b5cf6", tw: "bg-violet-50 text-violet-600 border border-violet-100" },
    REFERENCE:     { label: "Reference",     color: "#06b6d4", tw: "bg-cyan-50 text-cyan-600 border border-cyan-100" },
    INSTITUTIONAL: { label: "Institutional", color: "#10b981", tw: "bg-teal-50 text-teal-600 border border-teal-100" },
    SOCIAL:        { label: "Social",        color: "#ec4899", tw: "bg-pink-50 text-pink-600 border border-pink-100" },
    OTHER:         { label: "Other",         color: "#a1a1aa", tw: "bg-zinc-100 text-zinc-500 border border-zinc-200" },
}

const ENGINE_COLORS: Record<string, string> = {
    chatgpt: "#10a37f", gpt: "#10a37f",
    gemini: "#4285f4",
    google: "#4285f4",
    perplexity: "#6c47ff",
    copilot: "#0078d4",
    claude: "#d97706",
    default: "#71717a",
}

/* ─── helpers ───────────────────────────────────────────────── */
function Badge({ type }: { type: string }) {
    const c = TCFG[type] ?? TCFG.OTHER
    return <span className={`inline-flex items-center rounded px-1.5 py-[2px] text-[10.5px] font-semibold leading-none ${c.tw}`}>{c.label}</span>
}

export function Fav({ domain }: { domain: string }) {
    return (
        <img src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
            alt="" width={15} height={15} className="flex-shrink-0 rounded-[2px] object-contain"
            loading="lazy" decoding="async"
            onError={e => { (e.target as HTMLImageElement).style.display = "none" }}
        />
    )
}

export function Avatar({ name, url }: { name: string; url?: string }) {
    const domain = url ? url.replace(/^https?:\/\//, "").split("/")[0] : null
    const letter = name[0]?.toUpperCase() ?? "?"
    return (
        <div className="flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center overflow-hidden rounded-[3px] border border-zinc-200 bg-white">
            {domain
                ? <img src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
                    alt="" width={12} height={12} className="object-contain"
                    loading="lazy" decoding="async"
                    onError={e => {
                        const el = e.target as HTMLImageElement
                        el.style.display = "none"
                        if (el.parentElement) {
                            el.parentElement.style.cssText = "background:#18181b;display:flex;align-items:center;justify-content:center"
                            el.parentElement.innerHTML = `<span style="color:white;font-size:8px;font-weight:700">${letter}</span>`
                        }
                    }}
                />
                : <span className="text-[8px] font-bold text-zinc-500">{letter}</span>
            }
        </div>
    )
}

export function Sk({ cls = "" }: { cls?: string }) {
    return <div className={`animate-pulse rounded bg-zinc-100 ${cls}`} />
}

export function timeAgo(iso: string) {
    const diff = Date.now() - new Date(iso).getTime()
    const h = Math.floor(diff / 3600000)
    if (h < 1) return `${Math.floor(diff / 60000)} min ago`
    if (h < 24) return `${h} hr ago`
    return `${Math.floor(h / 24)} d ago`
}

function brandDomain(name?: string | null) {
    return name ? `${name.toLowerCase().replace(/[^a-z0-9]/g, "")}.com` : undefined
}

export function EngIcon({ model }: { model: string }) {
    const k = engineKey(model)
    const color = ENGINE_COLORS[k]
    
    const iconUrl = modelIconUrl(model, 64)

    if (iconUrl) {
        return (
            <img src={iconUrl}
                alt={model} width={18} height={18} 
                className="flex-shrink-0 rounded-[4px] object-contain"
                loading="lazy" decoding="async"
                onError={e => { (e.target as HTMLImageElement).style.display = "none" }}
            />
        )
    }

    return (
        <div className="flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-[4px] text-[8px] font-bold text-white" style={{ background: color }}>
            {model[0]?.toUpperCase()}
        </div>
    )
}

/* ─── donut ─────────────────────────────────────────────────── */
function Donut({ sources }: { sources: { source_type: string; used_percentage?: number; usage_percentage?: number }[] }) {
    const agg: Record<string, number> = {}
    for (const s of sources) {
        const pct = s.used_percentage ?? s.usage_percentage ?? 0
        agg[s.source_type] = (agg[s.source_type] ?? 0) + pct
    }
    const entries = Object.entries(agg).filter(([, v]) => v > 0)
    const total = entries.reduce((a, [, v]) => a + v, 0)
    const R = 54, C = 66, SW = 13, circ = 2 * Math.PI * R
    let off = 0
    const slices = entries.map(([type, val]) => {
        const cfg = TCFG[type] ?? TCFG.OTHER
        const dash = total > 0 ? (val / total) * (circ - entries.length * 1.5) : 0
        const s = { type, color: cfg.color, label: cfg.label, dash, off }
        off += dash + 1.5
        return s
    })
    return (
        <div className="flex flex-col items-center gap-3 px-4 py-4">
            <div className="relative">
                <svg width={132} height={132} viewBox="0 0 132 132">
                    <circle cx={C} cy={C} r={R} fill="none" stroke="#f4f4f5" strokeWidth={SW}/>
                    {slices.map(s => (
                        <circle key={s.type} cx={C} cy={C} r={R} fill="none"
                            stroke={s.color} strokeWidth={SW}
                            strokeDasharray={`${s.dash} ${circ}`}
                            strokeDashoffset={circ / 4 - s.off}
                        />
                    ))}
                </svg>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-[20px] font-bold leading-none text-zinc-800">{sources.length}</span>
                    <span className="mt-1 text-[9.5px] leading-none text-zinc-400">Citations</span>
                </div>
            </div>
            <div className="flex flex-wrap justify-center gap-x-3 gap-y-1.5">
                {slices.map(s => (
                    <div key={s.type} className="flex items-center gap-1">
                        <span className="h-2 w-2 flex-shrink-0 rounded-full" style={{ background: s.color }}/>
                        <span className="whitespace-nowrap text-[10.5px] text-zinc-500">{s.label}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

/* ─── chat card ─────────────────────────────────────────────── */
function ChatCard({ chat, onClick }: { chat: RecentChat, onClick: () => void }) {
    return (
        <div 
            onClick={onClick}
            className="flex cursor-pointer flex-col gap-2 rounded-2xl border border-slate-200/80 bg-white/82 p-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition hover:-translate-y-[1px] hover:border-blue-200 hover:bg-white hover:shadow-[0_14px_30px_-24px_rgba(15,23,42,0.55)]"
        >
            <div className="flex items-start gap-2">
                <div className="mt-0.5 flex-shrink-0"><EngIcon model={chat.ai_model}/></div>
                <p className="line-clamp-2 text-[12.5px] font-bold leading-snug text-zinc-800">{chat.prompt_text}</p>
            </div>
            <p className="line-clamp-3 text-[11.5px] font-medium leading-relaxed text-zinc-600">{chat.excerpt}</p>
            <div className="flex items-center justify-between border-t border-zinc-100 pt-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                    {chat.brands.slice(0, 4).map((b, i) => (
                        <div key={i} className="scale-90 origin-left">
                            <Avatar name={b} url={`${b.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`}/>
                        </div>
                    ))}
                    {chat.brands.length > 4 && <span className="text-[10px] text-zinc-400">+{chat.brands.length - 4}</span>}
                </div>
                <span className="text-[10px] text-zinc-400">{timeAgo(chat.ran_at)}</span>
            </div>
        </div>
    )
}

function MetricCard({
    label,
    value,
    detail,
    signal,
    delta,
    tone = "blue",
}: {
    label: string
    value: string
    detail: string
    signal: string
    delta?: number | null
    tone?: "blue" | "green" | "amber" | "slate"
}) {
    const toneClass = {
        blue: "bg-blue-50 text-blue-700 ring-blue-200",
        green: "bg-emerald-50 text-emerald-700 ring-emerald-200",
        amber: "bg-amber-50 text-amber-700 ring-amber-200",
        slate: "bg-slate-100 text-slate-600 ring-slate-200",
    }[tone]

    return (
        <div className="metric-card px-4 py-3">
            <div className="mb-2 flex items-center justify-between">
                <span className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-slate-400">{label}</span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ${toneClass}`}>{signal}</span>
            </div>
            <div className="flex items-end justify-between gap-3">
                <div className="flex items-end gap-2">
                    <span className="text-[24px] font-black leading-none tracking-[-0.04em] text-slate-950">{value}</span>
                    <MovementBadge value={delta} compact />
                </div>
                <span className="text-right text-[11.5px] font-medium leading-snug text-slate-500">{detail}</span>
            </div>
        </div>
    )
}

function MovementBadge({ value, compact = false }: { value?: number | null; compact?: boolean }) {
    if (value === null || value === undefined || Math.abs(value) < 0.05) {
        return compact ? null : <span className="text-[11px] font-semibold text-slate-300">-</span>
    }

    const positive = value > 0
    const color = positive ? "bg-emerald-50 text-emerald-600 ring-emerald-100" : "bg-rose-50 text-rose-600 ring-rose-100"
    const label = `${positive ? "+" : ""}${Math.abs(value) >= 10 ? value.toFixed(0) : value.toFixed(1)}`

    return (
        <span className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10.5px] font-bold tabular-nums ring-1 ${color}`}>
            <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={positive ? "" : "rotate-180"}
            >
                <path d="M4 16c4-8 10-8 16-8" />
                <path d="M15 5h5v5" />
            </svg>
            {label}
        </span>
    )
}

function sentimentTone(score: number | null) {
    if (score == null) return "bg-slate-300"
    if (score >= 65) return "bg-emerald-500"
    if (score >= 45) return "bg-amber-500"
    return "bg-rose-500"
}

/* ─── main ───────────────────────────────────────────────────── */
export function OverviewTab() {
    const { selectedProject } = useProjects()
    const projectId = selectedProject?.id ?? null
    const { queryString } = useFilters()

    const { data: dash, sources, competitors: tracked, isLoading } = useDashboard(projectId, queryString)
    const { data: ts, isLoading: tsLoad } = useVisibilityTimeSeries(projectId, queryString)
    const { chats, isLoading: chLoad } = useRecentChats(projectId, queryString)

    const [selectedChat, setSelectedChat] = useState<RecentChat | null>(null)

    const ownBrand = {
        name: selectedProject?.brand_name ?? "Your Brand",
        url: selectedProject?.brand_url,
        vis: dash?.brand.visibility ?? 0,
        sent: dash?.brand.avg_sentiment ?? null,
        pos: dash?.brand.avg_position ?? null,
        deltaVis: dash?.brand.delta_visibility ?? null,
        deltaSent: dash?.brand.delta_sentiment ?? null,
        deltaPos: dash?.brand.delta_position ?? null,
    }
    const competitors = tracked.map(c => ({
        name: (c.name ?? c.brand_name) ?? "—",
        url: c.url || brandDomain(c.name ?? c.brand_name),
        vis: c.visibility,
        sent: c.avg_sentiment,
        pos: c.avg_position,
        deltaVis: c.delta_visibility ?? null,
        deltaSent: c.delta_sentiment ?? null,
        deltaPos: c.delta_position ?? null,
    }))
    const allBrands = [ownBrand, ...competitors].sort((a, b) => b.vis - a.vis)
    const topSrc = sources.slice(0, 8)

    /* row alternating styles */
    const even = "premium-row-even"
    const odd  = "premium-row-odd"

    return (
        <div className="flex flex-col gap-4">
            <div data-product-tour-id="overview-scorecards" className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
                <MetricCard
                    label="Visibility"
                    value={`${ownBrand.vis.toFixed(0)}%`}
                    detail={`${selectedProject?.brand_name ?? "Brand"} share across AI answers`}
                    signal="Brand line"
                    delta={ownBrand.deltaVis}
                    tone="blue"
                />
                <MetricCard
                    label="Position"
                    value={ownBrand.pos != null ? ownBrand.pos.toFixed(1) : "-"}
                    detail="Average rank when mentioned"
                    signal="Rank"
                    delta={ownBrand.deltaPos}
                    tone="green"
                />
                <MetricCard
                    label="Sentiment"
                    value={ownBrand.sent != null ? ownBrand.sent.toFixed(0) : "-"}
                    detail="Weighted response sentiment"
                    signal="Tone"
                    delta={ownBrand.deltaSent}
                    tone="amber"
                />
                <MetricCard
                    label="Sources"
                    value={`${sources.length}`}
                    detail="Domains influencing answers"
                    signal="Evidence"
                    tone="slate"
                />
            </div>

            {/* ── Row 1: chart 50% | brands 50% ── */}
            <div className="grid gap-3 xl:grid-cols-2">

                {/* chart card */}
                <div data-product-tour-id="overview-visibility-chart" className="dashboard-card">
                    <div className="dashboard-card-header">
                        <div className="flex items-center gap-1.5">
                            <svg className="text-zinc-400" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                            <span className="dashboard-card-title">Visibility</span>
                            <span className="dashboard-card-subtitle">Percentage of chats mentioning each brand</span>
                        </div>
                    </div>
                    <div className="px-4 pb-4 pt-3">
                        {tsLoad ? <Sk cls="h-[210px] w-full"/> : <VisibilityChart data={ts} height={210}/>}
                    </div>
                </div>

                {/* brands card */}
                <div data-product-tour-id="overview-brands-table" className="dashboard-card">
                    <div className="dashboard-card-header">
                        <div className="flex items-center gap-1.5">
                            <svg className="text-zinc-400" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
                            <span className="dashboard-card-title">Brands</span>
                            <span className="dashboard-card-subtitle">with highest visibility</span>
                        </div>
                        <Link to={`/competitors${queryString}`} className="text-[11px] font-semibold text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1">
                            Show All
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17l9.2-9.2M17 17V7H7"/></svg>
                        </Link>
                    </div>
                    {isLoading ? (
                        <div className="flex flex-col gap-2 p-4">
                            {[...Array(5)].map((_, i) => <div key={i} className="flex items-center gap-2"><Sk cls="h-3 w-4"/><Sk cls="h-[18px] w-[18px] rounded-[3px]"/><Sk cls="h-3 flex-1"/><Sk cls="h-3 w-8"/></div>)}
                        </div>
                    ) : (
                        <div className="peec-grid-table overflow-x-auto">
                            {/* header row */}
                            <div className="peec-grid-header grid h-10 min-w-[564px] items-center bg-slate-50/90" style={{ gridTemplateColumns: "44px 42px minmax(150px,1fr) 112px 112px 104px" }}>
                                <span className="justify-center text-[10px] font-semibold uppercase tracking-wide text-zinc-400">#</span>
                                <span/>
                                <span className="px-3 text-[10px] font-semibold uppercase tracking-wide text-zinc-400">Brand</span>
                                <span className="justify-center px-3 text-center text-[10px] font-semibold uppercase tracking-wide text-zinc-400">Visibility</span>
                                <span className="justify-center px-3 text-center text-[10px] font-semibold uppercase tracking-wide text-zinc-400">Sentiment</span>
                                <span className="justify-center px-3 text-center text-[10px] font-semibold uppercase tracking-wide text-zinc-400">Position</span>
                            </div>
                            <div className="max-h-[288px] min-w-[564px] overflow-y-auto overscroll-contain">
                            {/* data rows */}
                            {allBrands.map((b, i) => (
                                <div key={b.name}
                                    className={`peec-grid-row grid h-[48px] items-center ${i % 2 === 0 ? even : odd}`}
                                    style={{ gridTemplateColumns: "44px 42px minmax(150px,1fr) 112px 112px 104px" }}
                                >
                                    <span className="justify-center text-[11px] tabular-nums text-zinc-400">{i + 1}</span>
                                    <span className="justify-center"><Avatar name={b.name} url={b.url}/></span>
                                    <span className="truncate px-3 text-[13px] font-semibold text-zinc-800">{b.name}</span>
                                    <span className="justify-end px-3 text-right text-[13px] font-bold tabular-nums text-slate-900">
                                        <span className="inline-flex items-center justify-end gap-1.5">
                                            <MovementBadge value={b.deltaVis} />
                                            {b.vis.toFixed(0)}%
                                        </span>
                                    </span>
                                    <span className="justify-end px-3 text-right text-[13px] font-semibold tabular-nums text-slate-700">
                                        {b.sent != null ? (
                                            <div className="flex items-center justify-end gap-2">
                                                <span className={`h-1.5 w-1.5 rounded-full ${sentimentTone(b.sent)}`} />
                                                <MovementBadge value={b.deltaSent} />
                                                {b.sent.toFixed(0)}
                                            </div>
                                        ) : "—"}
                                    </span>
                                    <span className="justify-end px-3 text-right text-[13px] font-semibold tabular-nums text-slate-700">
                                        {b.pos != null ? (
                                            <div className="flex items-center justify-end gap-1.5">
                                                <MovementBadge value={b.deltaPos} />
                                                <span>#{b.pos.toFixed(1)}</span>
                                            </div>
                                        ) : "—"}
                                    </span>
                                </div>
                            ))}
                            {competitors.length === 0 && (
                                <p className="px-4 py-3 text-center text-[11px] text-zinc-400">Add competitors to track them here</p>
                            )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Top Sources ── */}
            <div data-product-tour-id="overview-sources" className="dashboard-card">
                <div className="dashboard-card-header">
                    <div className="flex items-center gap-1.5">
                        <svg className="text-zinc-400" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                        <span className="dashboard-card-title">Top Sources</span>
                        <span className="dashboard-card-subtitle">Sources across active models</span>
                    </div>
                    <Link to={`/sources${queryString}`} className="text-[11px] font-semibold text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1">
                        Show All
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17l9.2-9.2M17 17V7H7"/></svg>
                    </Link>
                </div>
                <div className="flex flex-col divide-y divide-zinc-100 xl:flex-row xl:divide-x xl:divide-y-0">

                    {/* donut side */}
                    <div className="w-full flex-shrink-0 xl:w-[230px]">
                        <p className="px-4 pt-3 text-[11px] font-semibold uppercase tracking-wide text-zinc-500">Sources Type</p>
                        {isLoading
                            ? <div className="flex justify-center py-8"><Sk cls="h-[132px] w-[132px] rounded-full"/></div>
                            : sources.length === 0
                                ? <p className="flex justify-center py-8 text-[11px] text-zinc-400">No data</p>
                                : <Donut sources={sources}/>
                        }
                    </div>

                    {/* table side */}
                    <div className="min-w-0 flex-1">
                        {isLoading ? (
                            <div className="flex flex-col">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className={`flex items-center gap-3 px-4 py-2.5 ${i % 2 === 0 ? even : odd}`}>
                                        <Sk cls="h-[15px] w-[15px] rounded-[2px]"/>
                                        <Sk cls="h-3 w-40"/>
                                        <Sk cls="ml-auto h-3 w-10"/>
                                        <Sk cls="h-3 w-10"/>
                                        <Sk cls="h-5 w-16 rounded"/>
                                    </div>
                                ))}
                            </div>
                        ) : topSrc.length === 0 ? (
                            <p className="flex items-center justify-center py-12 text-[12px] text-zinc-400">No source data yet</p>
                        ) : (
                            <table className="peec-table w-full text-left">
                                <thead>
                                    <tr className="border-b border-slate-200/80 bg-slate-50/90">
                                        <th className="px-4 py-2 text-[9px] font-semibold uppercase tracking-wide text-zinc-400">Domain</th>
                                        <th className="px-3 py-2 text-right text-[9px] font-semibold uppercase tracking-wide text-zinc-400">Used</th>
                                        <th className="px-3 py-2 text-right text-[9px] font-semibold uppercase tracking-wide text-zinc-400">Avg. Citations</th>
                                        <th className="px-4 py-2 text-right text-[9px] font-semibold uppercase tracking-wide text-zinc-400">Type</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {topSrc.map((s, i) => (
                                        <tr key={s.domain} className={`${i % 2 === 0 ? even : odd} hover:bg-zinc-100/60 transition-colors`}>
                                            <td className="px-4 py-2.5">
                                                <div className="flex items-center gap-2">
                                                    <Fav domain={s.domain}/>
                                                    <span className="text-[13px] font-semibold text-zinc-700">{s.domain}</span>
                                                </div>
                                            </td>
                                            <td className="px-3 py-2.5 text-right text-[13px] font-bold tabular-nums text-zinc-700">
                                                {((s.used_percentage ?? s.usage_percentage) ?? 0).toFixed(0)}%
                                            </td>
                                            <td className="px-3 py-2.5 text-right text-[13px] font-semibold tabular-nums text-zinc-600">
                                                {s.avg_citations != null ? s.avg_citations.toFixed(1) : "—"}
                                            </td>
                                            <td className="px-4 py-2.5 text-right">
                                                <Badge type={s.source_type}/>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Recent Chats ── */}
            <div data-product-tour-id="overview-recent-chats" className="dashboard-card">
                <div className="dashboard-card-header justify-start">
                    <svg className="text-zinc-400" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    <span className="dashboard-card-title">Recent Chats</span>
                    <span className="dashboard-card-subtitle">Chats that mentioned {selectedProject?.brand_name ?? "your brand"}</span>
                </div>
                {chLoad ? (
                    <div className="grid gap-3 p-4 md:grid-cols-2 2xl:grid-cols-3">
                        {[...Array(6)].map((_, i) => <Sk key={i} cls="h-36 rounded-xl"/>)}
                    </div>
                ) : chats.length === 0 ? (
                    <p className="flex items-center justify-center py-12 text-[12px] text-zinc-400">No chat data yet</p>
                ) : (
                    <div className="grid gap-3 p-4 md:grid-cols-2 2xl:grid-cols-3">
                        {chats.map(c => <ChatCard key={c.id} chat={c} onClick={() => setSelectedChat(c)} />)}
                    </div>
                )}
            </div>

            {selectedChat && (
                <ChatModal 
                    chat={selectedChat} 
                    onClose={() => setSelectedChat(null)} 
                />
            )}
        </div>
    )
}
