import { ArrowUp, ArrowDown } from "lucide-react"
import type { DomainResearchOverviewPayload } from "../api/domainResearchTypes"

function fmt(num: number): string {
    if (num == null || num === 0) return "0"
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M"
    if (num >= 1_000) return (num / 1_000).toFixed(1) + "K"
    return num.toLocaleString()
}

// Mini sparkline using SVG
function Sparkline({ values, color }: { values: number[]; color: string }) {
    if (values.length < 2) return null
    const max = Math.max(...values)
    const min = Math.min(...values)
    const range = max - min || 1
    const w = 80, h = 28
    const pts = values.map((v, i) => {
        const x = (i / (values.length - 1)) * w
        const y = h - ((v - min) / range) * h
        return `${x},${y}`
    }).join(" ")
    return (
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none" style={{ opacity: 0.6 }}>
            <polyline points={pts} stroke={color} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    )
}

type KpiCardProps = {
    label: string
    value: string
    sub?: string
    delta?: number | null
    sparkValues?: number[]
    sparkColor?: string
    accentColor?: string
    isActive?: boolean
    onClick?: () => void
}

function KpiCard({ label, value, sub, delta, sparkValues, sparkColor = "#2563eb", accentColor = "#2563eb", isActive, onClick }: KpiCardProps) {
    const hasUp = delta != null && delta > 0

    return (
        <button
            onClick={onClick}
            className={`group relative flex flex-col overflow-hidden rounded-xl text-left transition-all duration-200 w-full ${
                isActive
                    ? "bg-white shadow-[0_0_0_2px_#0f172a,0_4px_16px_rgba(0,0,0,.08)]"
                    : "bg-white shadow-[0_1px_4px_rgba(0,0,0,.06),0_0_0_1px_rgba(0,0,0,.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,.1),0_0_0_1px_rgba(0,0,0,.08)]"
            }`}
        >
            {/* Colored accent bar at top */}
            <div
                className="absolute top-0 left-0 right-0 h-[3px] transition-opacity"
                style={{ background: accentColor, opacity: isActive ? 1 : 0.2 }}
            />

            <div className="p-5 pt-6">
                <p className="text-[10.5px] font-bold uppercase tracking-[0.1em] text-slate-400">{label}</p>

                <div className="mt-3 flex items-end justify-between gap-2">
                    <p className="text-[30px] font-bold tracking-tight leading-none text-slate-900">{value}</p>
                    {sparkValues && sparkValues.length > 1 && (
                        <div className="pb-0.5">
                            <Sparkline values={sparkValues} color={sparkColor} />
                        </div>
                    )}
                </div>

                <div className="mt-2 flex items-center justify-between">
                    {sub && <p className="text-[12px] text-slate-400">{sub}</p>}
                    {delta != null && delta !== 0 && (
                        <span className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                            hasUp
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-rose-50 text-rose-700"
                        }`}>
                            {hasUp ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                            {fmt(Math.abs(delta))}
                        </span>
                    )}
                </div>
            </div>
        </button>
    )
}

export function OverviewSummaryCards({
    data,
    backlinks,
    activeCard,
    onCardClick,
}: {
    data: DomainResearchOverviewPayload
    backlinks?: any
    activeCard?: string
    onCardClick?: (card: string) => void
}) {
    const org = data.summary.organic
    const paid = data.summary.paid

    const sorted = [...data.history].sort((a, b) => a.date.localeCompare(b.date))
    const latest = sorted[sorted.length - 1]
    const prev = sorted[sorted.length - 2]
    const trafficDelta = latest && prev ? latest.organic.traffic - prev.organic.traffic : null
    const paidDelta = latest && prev ? latest.paid.traffic - prev.paid.traffic : null

    // Last 6 months for sparklines
    const last6 = sorted.slice(-6)
    const orgSparkline = last6.map(h => h.organic.traffic)
    const paidSparkline = last6.map(h => h.paid.traffic)

    const authScore = backlinks?.rank ?? 0
    const totalBacklinks = backlinks?.backlinks ?? 0
    const refDomains = backlinks?.referring_domains ?? 0

    return (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <KpiCard
                label="Authority Score"
                value={authScore > 0 ? authScore.toString() : "N/A"}
                sub="Domain authority"
                accentColor="#f59e0b"
                sparkColor="#f59e0b"
                isActive={activeCard === "authority"}
                onClick={() => onCardClick?.("authority")}
            />
            <KpiCard
                label="Organic Search Traffic"
                value={fmt(org.traffic)}
                sub={`${fmt(org.keywords)} Keywords`}
                delta={trafficDelta}
                sparkValues={orgSparkline}
                sparkColor="#2563eb"
                accentColor="#2563eb"
                isActive={activeCard === "organic" || !activeCard}
                onClick={() => onCardClick?.("organic")}
            />
            <KpiCard
                label="Paid Search Traffic"
                value={fmt(paid.traffic)}
                sub={`${fmt(paid.keywords)} Keywords`}
                delta={paidDelta}
                sparkValues={paidSparkline}
                sparkColor="#10b981"
                accentColor="#10b981"
                isActive={activeCard === "paid"}
                onClick={() => onCardClick?.("paid")}
            />
            <KpiCard
                label="Backlinks"
                value={fmt(totalBacklinks)}
                sub={`${fmt(refDomains)} Ref. Domains`}
                accentColor="#64748b"
                sparkColor="#64748b"
                isActive={activeCard === "backlinks"}
                onClick={() => onCardClick?.("backlinks")}
            />
        </div>
    )
}
