import { useMemo, useState } from "react"
import {
    Area,
    AreaChart,
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts"
import type { DomainResearchOverviewPayload } from "../api/domainResearchTypes"

type Range = "1M" | "3M" | "6M" | "1Y" | "ALL"
const RANGE_MONTHS: Record<Range, number | null> = { "1M": 1, "3M": 3, "6M": 6, "1Y": 12, "ALL": null }

const TRAFFIC_SERIES = [
    { key: "Organic Traffic", color: "#0F766E" },
    { key: "Paid Traffic", color: "#F97316" },
] as const

const KEYWORD_SERIES = [
    { key: "Top 3", color: "#F59E0B" },
    { key: "4–10", color: "#0F766E" },
    { key: "11–20", color: "#10B981" },
    { key: "21–50", color: "#F97316" },
    { key: "51–100", color: "#F43F5E" },
] as const

function compact(value: number) {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
    if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`
    return value.toLocaleString()
}

function TrendTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null
    return (
        <div className="domain-chart-tooltip">
            <p>{label}</p>
            {payload.map((entry: any) => (
                <div key={entry.dataKey}>
                    <span style={{ background: entry.stroke || entry.color }} />
                    <small>{entry.name}</small>
                    <strong>{compact(Number(entry.value ?? 0))}</strong>
                </div>
            ))}
        </div>
    )
}

export function TrafficTrendChart({ data }: { data: DomainResearchOverviewPayload }) {
    const [range, setRange] = useState<Range>(data.history.length >= 6 ? "6M" : "ALL")
    const [view, setView] = useState<"traffic" | "keywords">("traffic")
    const [hidden, setHidden] = useState<Set<string>>(new Set())

    const sortedHistory = useMemo(() => [...data.history].sort((left, right) => left.date.localeCompare(right.date)), [data.history])
    const filtered = useMemo(() => {
        const months = RANGE_MONTHS[range]
        return months ? sortedHistory.slice(-months) : sortedHistory
    }, [range, sortedHistory])

    const chartData = useMemo(() => filtered.map(point => ({
        date: new Date(point.date).toLocaleString("en-US", { month: "short", year: "2-digit" }),
        fullDate: point.date,
        "Organic Traffic": point.organic.traffic,
        "Paid Traffic": point.paid.traffic,
        "Top 3": point.rankingDistribution.top3,
        "4–10": point.rankingDistribution.positions4To10,
        "11–20": point.rankingDistribution.positions11To20,
        "21–50": point.rankingDistribution.positions21To50,
        "51–100": point.rankingDistribution.positions51To100,
    })), [filtered])

    const availableRanges = (["1M", "3M", "6M", "1Y", "ALL"] as Range[]).filter(item => {
        const months = RANGE_MONTHS[item]
        return months == null || months <= sortedHistory.length
    })

    const activeSeries = view === "traffic" ? TRAFFIC_SERIES : KEYWORD_SERIES
    const toggleSeries = (key: string) => setHidden(current => {
        const next = new Set(current)
        if (next.has(key)) next.delete(key)
        else next.add(key)
        return next
    })

    return (
        <div className="domain-trend-chart">
            <div className="domain-chart-toolbar">
                <div className="domain-chart-tabs" aria-label="Chart metric">
                    <button type="button" onClick={() => setView("traffic")} className={view === "traffic" ? "is-active" : ""}>Traffic</button>
                    <button type="button" onClick={() => setView("keywords")} className={view === "keywords" ? "is-active" : ""}>Keywords</button>
                </div>
                <div className="domain-chart-range" aria-label="Chart date range">
                    {availableRanges.map(item => (
                        <button type="button" key={item} onClick={() => setRange(item)} className={range === item ? "is-active" : ""}>
                            {item === "ALL" ? `All ${sortedHistory.length} mo` : item}
                        </button>
                    ))}
                </div>
            </div>

            <div className="domain-trend-frame">
                <ResponsiveContainer width="100%" height="100%">
                    {view === "traffic" ? (
                        <AreaChart data={chartData} margin={{ top: 14, right: 18, left: 2, bottom: 2 }}>
                            <defs>
                                <linearGradient id="domainOrganicFill" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#0F766E" stopOpacity={0.16} />
                                    <stop offset="45%" stopColor="#0F766E" stopOpacity={0.05} />
                                    <stop offset="100%" stopColor="#0F766E" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="domainPaidFill" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#F97316" stopOpacity={0.14} />
                                    <stop offset="100%" stopColor="#F97316" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid vertical={false} stroke="#E8EDF4" strokeDasharray="3 5" />
                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "#94A3B8", fontSize: 10.5, fontWeight: 500 }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94A3B8", fontSize: 10.5 }} tickFormatter={compact} width={44} />
                            <Tooltip content={<TrendTooltip />} cursor={{ stroke: "#94A3B8", strokeWidth: 1, strokeDasharray: "4 4" }} />
                            {!hidden.has("Organic Traffic") && <Area type="monotone" dataKey="Organic Traffic" stroke="#0F766E" strokeWidth={2.6} fill="url(#domainOrganicFill)" dot={chartData.length === 1 ? { r: 4, fill: "#0F766E", stroke: "#fff", strokeWidth: 2 } : false} activeDot={{ r: 5, fill: "#0F766E", stroke: "#fff", strokeWidth: 2.5 }} />}
                            {!hidden.has("Paid Traffic") && <Area type="monotone" dataKey="Paid Traffic" stroke="#F97316" strokeWidth={2} fill="url(#domainPaidFill)" dot={chartData.length === 1 ? { r: 4, fill: "#F97316", stroke: "#fff", strokeWidth: 2 } : false} activeDot={{ r: 4, fill: "#F97316", stroke: "#fff", strokeWidth: 2 }} />}
                        </AreaChart>
                    ) : (
                        <LineChart data={chartData} margin={{ top: 14, right: 18, left: 2, bottom: 2 }}>
                            <CartesianGrid vertical={false} stroke="#E8EDF4" strokeDasharray="3 5" />
                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "#94A3B8", fontSize: 10.5, fontWeight: 500 }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94A3B8", fontSize: 10.5 }} tickFormatter={compact} width={44} />
                            <Tooltip content={<TrendTooltip />} cursor={{ stroke: "#94A3B8", strokeWidth: 1, strokeDasharray: "4 4" }} />
                            {KEYWORD_SERIES.map(series => !hidden.has(series.key) && (
                                <Line key={series.key} type="monotone" dataKey={series.key} stroke={series.color} strokeWidth={series.key === "Top 3" ? 2.5 : 2} dot={chartData.length === 1 ? { r: 3, fill: series.color, stroke: "#fff", strokeWidth: 2 } : false} activeDot={{ r: 4, fill: series.color, stroke: "#fff", strokeWidth: 2 }} />
                            ))}
                        </LineChart>
                    )}
                </ResponsiveContainer>
            </div>

            <div className="domain-chart-legend" aria-label="Chart series">
                {activeSeries.map(series => (
                    <button type="button" key={series.key} onClick={() => toggleSeries(series.key)} className={hidden.has(series.key) ? "is-muted" : ""}>
                        <span style={{ background: series.color }} />
                        {series.key}
                        <strong>{compact(Number(chartData.at(-1)?.[series.key as keyof (typeof chartData)[number]] ?? 0))}</strong>
                    </button>
                ))}
            </div>
        </div>
    )
}
