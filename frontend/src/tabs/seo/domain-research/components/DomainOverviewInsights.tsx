import {
    ArrowRight,
    FileChartColumnIncreasing,
    KeyRound,
    Link2,
    TrendingDown,
    TrendingUp,
} from "lucide-react"
import type {
    BacklinksOverviewPayload,
    DomainResearchOverviewPayload,
    OrganicKeywordsPayload,
    TopPagesPayload,
} from "../api/domainResearchTypes"

type Props = {
    overview: DomainResearchOverviewPayload
    keywords: OrganicKeywordsPayload
    pages: TopPagesPayload
    backlinks: BacklinksOverviewPayload | null
    onOpenRankings: () => void
    onOpenKeywords: () => void
    onOpenPages: () => void
    onOpenBacklinks: () => void
}

export function DomainOverviewInsights(props: Props) {
    return (
        <section aria-labelledby="domain-insights-title" className="mb-2 mt-2">
            <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-4">
                <RankingMovementCard {...props} />
                <IntentCard {...props} />
                <PageMomentumCard {...props} />
                <BacklinkCard {...props} />
            </div>
        </section>
    )
}

function RankingMovementCard({ overview, onOpenRankings }: Props) {
    const gained = overview.changes.new + overview.changes.improved
    const atRisk = overview.changes.declined + overview.changes.lost
    return (
        <InsightCard
            icon={<FileChartColumnIncreasing className="h-3.5 w-3.5" />}
            eyebrow="Rank tracker"
            title="Ranking momentum"
            onClick={onOpenRankings}
        >
            <div className="grid grid-cols-2 gap-2">
                <MetricTile icon={<TrendingUp className="h-3 w-3" />} label="Gained" value={`+${compact(gained)}`} tone="positive" />
                <MetricTile icon={<TrendingDown className="h-3 w-3" />} label="At risk" value={`-${compact(atRisk)}`} tone="negative" />
            </div>
            <div className="mt-2 grid grid-cols-4 gap-2 border-t border-slate-100 pt-2">
                <MiniStat label="New" value={overview.changes.new} />
                <MiniStat label="Up" value={overview.changes.improved} />
                <MiniStat label="Down" value={overview.changes.declined} />
                <MiniStat label="Lost" value={overview.changes.lost} />
            </div>
        </InsightCard>
    )
}

function IntentCard({ keywords, onOpenKeywords }: Props) {
    const intents = ["informational", "navigational", "commercial", "transactional"].map(intent => ({
        intent,
        count: keywords.keywords.filter(keyword => keyword.intent?.toLowerCase() === intent).length,
    }))
    const topFeatures = countSerpFeatures(keywords).slice(0, 3)
    return (
        <InsightCard
            icon={<KeyRound className="h-3.5 w-3.5" />}
            eyebrow="Keyword research"
            title="Intent & SERP features"
            onClick={onOpenKeywords}
        >
            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                {intents.map(item => (
                    <div key={item.intent} className="flex items-center justify-between gap-1">
                        <span className="truncate text-[9.5px] font-medium capitalize text-slate-500">{item.intent}</span>
                        <strong className="text-[10px] font-bold tabular-nums text-slate-900">{item.count.toLocaleString()}</strong>
                    </div>
                ))}
            </div>
            <div className="mt-2 flex min-h-6 flex-wrap items-center gap-1 border-t border-slate-100 pt-2">
                {topFeatures.length ? topFeatures.map(([feature, count]) => (
                    <span key={feature} className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[8px] font-bold text-slate-600">{prettyFeature(feature)} <span className="text-slate-400">{count}</span></span>
                )) : <span className="text-[9px] text-slate-400">No SERP features</span>}
            </div>
        </InsightCard>
    )
}

function PageMomentumCard({ pages, onOpenPages }: Props) {
    return (
        <InsightCard
            icon={<FileChartColumnIncreasing className="h-3.5 w-3.5" />}
            eyebrow="Organic pages"
            title="Page momentum"
            onClick={onOpenPages}
        >
            <div className="grid grid-cols-3 gap-2">
                <MetricTile label="Growing" value={compact(pages.summary.growingPages)} tone="positive" />
                <MetricTile label="Declining" value={compact(pages.summary.decliningPages)} tone="negative" />
                <MetricTile label="Top 3" value={compact(pages.summary.pagesWithTop3Rankings)} tone="neutral" />
            </div>
            <p className="mt-2 border-t border-slate-100 pt-2 text-[9.5px] text-slate-500">
                <strong className="font-semibold text-slate-800">{compact(pages.summary.analyzedTraffic)}</strong> analyzed visits across <strong className="font-semibold text-slate-800">{compact(pages.summary.returnedPages)}</strong> returned pages.
            </p>
        </InsightCard>
    )
}

function BacklinkCard({ backlinks, onOpenBacklinks }: Props) {
    const summary = backlinks?.summary
    return (
        <InsightCard
            icon={<Link2 className="h-3.5 w-3.5" />}
            eyebrow="Backlinks"
            title="Authority profile"
            onClick={onOpenBacklinks}
        >
            {summary ? <>
                <div className="grid grid-cols-3 gap-2">
                    <MetricTile label="Rank" value={nullable(summary.rank)} tone="neutral" />
                    <MetricTile label="Links" value={nullable(summary.backlinks)} tone="neutral" />
                    <MetricTile label="Domains" value={nullable(summary.referringDomains)} tone="neutral" />
                </div>
                <div className="mt-2 flex items-center justify-between gap-2 border-t border-slate-100 pt-2 text-[9.5px]">
                    <span className="font-semibold text-emerald-600">+{nullable(summary.newBacklinks)} new</span>
                    <span className="font-semibold text-rose-600">-{nullable(summary.lostBacklinks)} lost</span>
                    <span className="text-slate-500">Spam {summary.backlinksSpamScore ?? "—"}</span>
                </div>
            </> : <div className="flex h-[72px] items-center rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 text-[10px] text-slate-500">No backlink snapshot is stored. Open Backlinks workspace to collect.</div>}
        </InsightCard>
    )
}

function InsightCard({ icon, eyebrow, title, onClick, children }: { icon: React.ReactNode; eyebrow: string; title: string; onClick: () => void; children: React.ReactNode }) {
    return (
        <article className="group flex min-h-[160px] min-w-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md cursor-pointer" onClick={onClick}>
            <div className="flex flex-1 flex-col p-3">
                <div className="flex items-center gap-2 mb-2">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded border border-slate-200 bg-slate-50 text-slate-700">{icon}</span>
                    <div className="min-w-0">
                        <p className="text-[8px] font-bold uppercase tracking-[0.08em] text-slate-400">{eyebrow}</p>
                        <h3 className="truncate text-[12px] font-semibold text-slate-900">{title}</h3>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 ml-auto text-slate-300 opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
                <div className="flex-1">{children}</div>
            </div>
        </article>
    )
}

function MetricTile({ icon, label, value, tone }: { icon?: React.ReactNode; label: string; value: string; tone: "positive" | "negative" | "neutral" }) {
    const style = tone === "positive" ? "border-emerald-100 bg-emerald-50 text-emerald-800" : tone === "negative" ? "border-rose-100 bg-rose-50 text-rose-800" : "border-slate-100 bg-slate-50 text-slate-900"
    return <div className={`min-w-0 rounded-lg border px-2 py-1.5 ${style}`}><p className="flex items-center gap-1 text-[8px] font-bold uppercase tracking-[0.06em] opacity-70">{icon}{label}</p><p className="mt-0.5 truncate text-[13px] font-bold tracking-tight tabular-nums">{value}</p></div>
}

function MiniStat({ label, value }: { label: string; value: number }) {
    return <div className="min-w-0"><p className="truncate text-[8px] font-bold uppercase tracking-[0.06em] text-slate-400">{label}</p><p className="truncate text-[10px] font-bold tabular-nums text-slate-800">{compact(value)}</p></div>
}

function countSerpFeatures(data: OrganicKeywordsPayload) {
    const counts = new Map<string, number>()
    data.keywords.forEach(keyword => keyword.serpFeatures.forEach(feature => counts.set(feature, (counts.get(feature) ?? 0) + 1)))
    return [...counts.entries()].sort((left, right) => right[1] - left[1])
}

function prettyFeature(value: string) {
    return value.replaceAll("_", " ").replace(/\b\w/g, letter => letter.toUpperCase())
}

function nullable(value: number | null | undefined) {
    return value == null ? "—" : compact(value)
}

function compact(value: number) {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
    if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`
    return value.toLocaleString()
}
