import {
    ArrowDownRight,
    ArrowUpRight,
    CircleDollarSign,
    MousePointerClick,
    SearchCheck,
    Target,
    TrendingDown,
    TrendingUp,
} from "lucide-react"
import type { DomainResearchOverviewPayload } from "../api/domainResearchTypes"

function compact(value: number) {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
    if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`
    return value.toLocaleString()
}

function changePercent(current: number, previous?: number) {
    if (!previous) return null
    return ((current - previous) / previous) * 100
}

export function DomainOverviewKpiCards({ overview }: { overview: DomainResearchOverviewPayload }) {
    const history = [...overview.history].sort((left, right) => left.date.localeCompare(right.date))
    const previous = history.at(-1)
    const organic = overview.summary.organic
    const gained = overview.changes.new + overview.changes.improved
    const atRisk = overview.changes.declined + overview.changes.lost
    const topTen = overview.rankingDistribution.top3 + overview.rankingDistribution.positions4To10
    const topTenCoverage = (topTen / Math.max(1, organic.keywords)) * 100

    return (
        <section className="domain-kpi-section" aria-label="Domain performance summary">
            <div className="domain-kpi-grid">
                <MetricCard
                    label="Organic traffic"
                    value={compact(organic.traffic)}
                    detail="Estimated monthly visits"
                    badge="Traffic"
                    tone="blue"
                    icon={<MousePointerClick className="h-4 w-4" />}
                    delta={changePercent(organic.traffic, previous?.organic.traffic)}
                />
                <MetricCard
                    label="Organic keywords"
                    value={compact(organic.keywords)}
                    detail={`${compact(overview.rankingDistribution.top3)} currently rank in Top 3`}
                    badge="Rankings"
                    tone="cyan"
                    icon={<SearchCheck className="h-4 w-4" />}
                    delta={changePercent(organic.keywords, previous?.organic.keywords)}
                />
                <MetricCard
                    label="Traffic value"
                    value={`$${compact(organic.trafficValueUsd)}`}
                    detail="Estimated monthly ad equivalent"
                    badge="Value"
                    tone="emerald"
                    icon={<CircleDollarSign className="h-4 w-4" />}
                    delta={changePercent(organic.trafficValueUsd, previous?.organic.trafficValueUsd)}
                />
                <MetricCard
                    label="Top 10 coverage"
                    value={`${topTenCoverage.toFixed(1)}%`}
                    detail={`${compact(topTen)} keywords rank in positions 1–10`}
                    badge="Coverage"
                    tone="amber"
                    icon={<Target className="h-4 w-4" />}
                />
            </div>

            <div className="domain-signal-strip">
                <Signal icon={<ArrowUpRight className="h-3.5 w-3.5" />} label="Visibility gained" value={`+${compact(gained)}`} tone="positive" detail="new + improved" />
                <Signal icon={<ArrowDownRight className="h-3.5 w-3.5" />} label="Visibility at risk" value={`-${compact(atRisk)}`} tone="negative" detail="declined + lost" />
                <Signal icon={<TrendingUp className="h-3.5 w-3.5" />} label="Top 3 positions" value={compact(overview.rankingDistribution.top3)} tone="blue" detail="highest-value rankings" />
                <Signal icon={<TrendingDown className="h-3.5 w-3.5" />} label="Paid footprint" value={compact(overview.summary.paid.traffic)} tone="amber" detail={`${compact(overview.summary.paid.keywords)} paid keywords`} />
            </div>
        </section>
    )
}

type Tone = "blue" | "cyan" | "emerald" | "amber"

function MetricCard({ label, value, detail, badge, tone, icon, delta }: {
    label: string
    value: string
    detail: string
    badge: string
    tone: Tone
    icon: React.ReactNode
    delta?: number | null
}) {
    return (
        <article className={`metric-card domain-kpi-card domain-kpi-card-${tone}`}>
            <div className="domain-kpi-card-top">
                <p className="domain-kpi-label">{label}</p>
                <span className={`domain-kpi-tag domain-kpi-tag-${tone}`}>{icon}{badge}</span>
            </div>
            <div className="domain-kpi-value-row">
                <p className="domain-kpi-value">{value}</p>
                {delta != null && <DeltaBadge value={delta} />}
            </div>
            <p className="domain-kpi-detail">{detail}</p>
        </article>
    )
}

function DeltaBadge({ value }: { value: number }) {
    const positive = value >= 0
    return (
        <span className={`domain-kpi-delta ${positive ? "is-positive" : "is-negative"}`}>
            {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {positive ? "+" : ""}{value.toFixed(1)}%
        </span>
    )
}

function Signal({ icon, label, value, tone, detail }: {
    icon: React.ReactNode
    label: string
    value: string
    tone: "positive" | "negative" | "blue" | "amber"
    detail: string
}) {
    return (
        <div className="domain-signal">
            <span className={`domain-signal-icon domain-signal-icon-${tone}`}>{icon}</span>
            <div className="min-w-0">
                <p className="domain-signal-label">{label}</p>
                <p className="domain-signal-detail">{detail}</p>
            </div>
            <strong className="domain-signal-value">{value}</strong>
        </div>
    )
}
