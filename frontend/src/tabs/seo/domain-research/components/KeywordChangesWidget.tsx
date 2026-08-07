import { TrendingUp, TrendingDown, Plus, Minus } from "lucide-react"
import type { DomainResearchOverviewPayload } from "../api/domainResearchTypes"
import type { OrganicKeywordsPayload } from "../api/domainResearchTypes"

function fmt(n: number): string {
    if (n == null) return "0"
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M"
    if (n >= 1_000) return (n / 1_000).toFixed(1) + "K"
    return n.toLocaleString()
}

export function KeywordChangesWidget({
    overview,
    keywords,
}: {
    overview: DomainResearchOverviewPayload
    keywords?: OrganicKeywordsPayload | null
}) {
    const chg = keywords?.summary
    const ovChg = overview.changes

    const items = [
        {
            label: "New",
            value: chg?.new ?? ovChg.new,
            icon: Plus,
            bg:    "bg-emerald-500",
            light: "bg-emerald-50",
            text:  "text-emerald-700",
        },
        {
            label: "Improved",
            value: chg?.improved ?? ovChg.improved,
            icon:  TrendingUp,
            bg:    "bg-blue-500",
            light: "bg-blue-50",
            text:  "text-blue-700",
        },
        {
            label: "Declined",
            value: chg?.declined ?? ovChg.declined,
            icon:  TrendingDown,
            bg:    "bg-amber-500",
            light: "bg-amber-50",
            text:  "text-amber-700",
        },
        {
            label: "Lost",
            value: chg?.lost ?? 0,
            icon:  Minus,
            bg:    "bg-rose-500",
            light: "bg-rose-50",
            text:  "text-rose-700",
        },
    ]

    const rd = overview.rankingDistribution
    const total = rd.top3 + rd.positions4To10 + rd.positions11To20 + rd.positions21To50 + rd.positions51To100 || 1

    const bars = [
        { label: "Top 3",   value: rd.top3,                  color: "#16a34a" },
        { label: "4–10",    value: rd.positions4To10,         color: "#2563eb" },
        { label: "11–20",   value: rd.positions11To20,        color: "#3b82f6" },
        { label: "21–50",   value: rd.positions21To50,        color: "#d97706" },
        { label: "51–100",  value: rd.positions51To100,       color: "#94a3b8" },
    ]

    return (
        <div className="flex flex-col gap-3 h-full">
            {/* ── Keyword Changes ── */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,.05)]">
                <p className="text-[10.5px] font-bold uppercase tracking-[0.1em] text-slate-400 mb-4">
                    Keyword Changes
                </p>
                <div className="grid grid-cols-4 gap-2">
                    {items.map(({ label, value, icon: Icon, bg, light, text }) => (
                        <div key={label} className={`flex flex-col items-center rounded-xl ${light} py-4 px-2`}>
                            <span className={`flex h-7 w-7 items-center justify-center rounded-full ${bg} mb-2.5`}>
                                <Icon className="h-3.5 w-3.5 text-white" />
                            </span>
                            <span className={`text-[20px] font-extrabold leading-none ${text}`}>{fmt(value)}</span>
                            <span className="mt-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Position Distribution ── */}
            <div className="flex-1 rounded-xl border border-slate-200 bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,.05)]">
                <p className="text-[10.5px] font-bold uppercase tracking-[0.1em] text-slate-400">
                    Position Distribution
                </p>
                <p className="mt-0.5 text-[11.5px] text-slate-400">{fmt(total)} ranked keywords</p>

                {/* Stacked bar */}
                <div className="mt-4 flex h-2.5 w-full overflow-hidden rounded-full">
                    {bars.map(b => {
                        const pct = (b.value / total) * 100
                        return pct >= 0.5 ? (
                            <div
                                key={b.label}
                                title={`${b.label}: ${fmt(b.value)}`}
                                style={{ width: `${pct}%`, background: b.color }}
                                className="transition-all"
                            />
                        ) : null
                    })}
                </div>

                {/* Row breakdown */}
                <div className="mt-4 flex flex-col gap-2">
                    {bars.map(b => {
                        const pct = Math.round((b.value / total) * 100)
                        return (
                            <div key={b.label} className="flex items-center gap-2.5">
                                <span
                                    className="h-2.5 w-2.5 flex-shrink-0 rounded-sm"
                                    style={{ background: b.color }}
                                />
                                <span className="flex-1 text-[12.5px] font-medium text-slate-600">{b.label}</span>
                                <span className="text-[13px] font-bold text-slate-900 tabular-nums">{fmt(b.value)}</span>
                                <span className="w-9 text-right text-[11.5px] text-slate-400 tabular-nums">{pct}%</span>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
