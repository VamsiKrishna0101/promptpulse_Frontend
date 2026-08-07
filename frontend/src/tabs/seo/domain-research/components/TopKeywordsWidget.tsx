import { useEffect, useMemo, useState } from "react"
import { ArrowDown, ArrowRight, ArrowUp, ChevronLeft, ChevronRight, Search } from "lucide-react"
import type { OrganicKeywordsPayload } from "../api/domainResearchTypes"

const PAGE_SIZE = 25

function compact(value: number) {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
    if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`
    return value.toLocaleString()
}

const INTENT_LABEL: Record<string, string> = {
    informational: "Informational",
    navigational: "Navigational",
    commercial: "Commercial",
    transactional: "Transactional",
}

type PositionFilter = "all" | "top3" | "top10" | "11-20" | "21-100"

export function TopKeywordsWidget({ data, expanded = false, onViewDetails }: {
    data: OrganicKeywordsPayload
    expanded?: boolean
    onViewDetails?: () => void
}) {
    const [query, setQuery] = useState("")
    const [intent, setIntent] = useState("all")
    const [position, setPosition] = useState<PositionFilter>("all")
    const [page, setPage] = useState(1)

    useEffect(() => setPage(1), [intent, position, query])

    const filtered = useMemo(() => data.keywords.filter(keyword => {
        const rank = keyword.position ?? 999
        const matchesPosition = position === "all"
            || (position === "top3" && rank <= 3)
            || (position === "top10" && rank <= 10)
            || (position === "11-20" && rank >= 11 && rank <= 20)
            || (position === "21-100" && rank >= 21 && rank <= 100)
        return keyword.keyword.toLowerCase().includes(query.toLowerCase())
            && (intent === "all" || keyword.intent?.toLowerCase() === intent)
            && matchesPosition
    }), [data.keywords, intent, position, query])

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
    const rows = expanded ? filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE) : filtered.slice(0, 5)

    return (
        <section className="dashboard-card domain-table-card">
            <div className="dashboard-card-header domain-table-card-header">
                <div className="min-w-0">
                    <div className="flex items-center gap-2">
                        <h2 className="dashboard-card-title">Top organic keywords</h2>
                        <span className="domain-count-badge">{compact(data.summary.totalKeywords)}</span>
                    </div>
                    <p className="dashboard-card-subtitle mt-0.5">Keywords driving the most estimated organic traffic</p>
                </div>
                {expanded ? (
                    <div className="domain-table-filters">
                        <label className="domain-filter-search"><Search className="h-3.5 w-3.5" /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Filter keywords" /></label>
                        <select value={intent} onChange={event => setIntent(event.target.value)} aria-label="Keyword intent">
                            <option value="all">All intent</option>
                            <option value="informational">Informational</option>
                            <option value="navigational">Navigational</option>
                            <option value="commercial">Commercial</option>
                            <option value="transactional">Transactional</option>
                        </select>
                        <select value={position} onChange={event => setPosition(event.target.value as PositionFilter)} aria-label="Keyword position">
                            <option value="all">All positions</option>
                            <option value="top3">Top 3</option>
                            <option value="top10">Top 10</option>
                            <option value="11-20">11–20</option>
                            <option value="21-100">21–100</option>
                        </select>
                    </div>
                ) : (
                    <div className="domain-header-stats">
                        <HeaderStat label="Top 10" value={compact(data.summary.top10)} />
                        <HeaderStat label="Traffic" value={compact(data.summary.estimatedTraffic)} />
                        <button type="button" onClick={onViewDetails} className="domain-view-all">View all keywords <ArrowRight className="h-3.5 w-3.5" /></button>
                    </div>
                )}
            </div>

            {expanded && (
                <div className="domain-expanded-stats">
                    <HeaderStat label="Returned" value={compact(data.summary.returnedKeywords)} />
                    <HeaderStat label="Top 10" value={compact(data.summary.top10)} />
                    <HeaderStat label="Estimated traffic" value={compact(data.summary.estimatedTraffic)} />
                    <HeaderStat label="Traffic value" value={`$${compact(data.summary.estimatedTrafficValueUsd)}`} />
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="domain-preview-table w-full min-w-[860px] text-left">
                    <thead>
                        <tr>
                            <th>Keyword</th>
                            <th>Intent</th>
                            <th className="text-right">Position</th>
                            <th className="text-right">Volume</th>
                            <th className="text-right">KD</th>
                            <th className="text-right">CPC</th>
                            <th className="text-right">Traffic</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((keyword, index) => {
                            const intentKey = keyword.intent?.toLowerCase() ?? ""
                            return (
                                <tr key={`${keyword.keyword}-${index}`}>
                                    <td className="max-w-[330px]">
                                        <p className="truncate text-[13px] font-semibold text-slate-900">{keyword.keyword}</p>
                                        <p className="mt-1 truncate text-[10.5px] text-slate-500">{keyword.relativeUrl || keyword.url || "—"}</p>
                                    </td>
                                    <td>{intentKey ? <span className={`domain-intent-badge domain-intent-${intentKey}`}>{INTENT_LABEL[intentKey] || keyword.intent}</span> : <span className="text-slate-400">—</span>}</td>
                                    <td className="text-right"><span className={`domain-rank-badge ${rankClass(keyword.position)}`}>{keyword.position ?? "—"}</span>{keyword.movement === "UP" && <ArrowUp className="ml-1 inline h-3.5 w-3.5 text-emerald-500" />}{keyword.movement === "DOWN" && <ArrowDown className="ml-1 inline h-3.5 w-3.5 text-rose-500" />}</td>
                                    <td className="text-right font-medium tabular-nums text-slate-700">{compact(keyword.searchVolume)}</td>
                                    <td className="text-right"><Difficulty value={keyword.difficulty} /></td>
                                    <td className="text-right font-medium tabular-nums text-slate-700">${keyword.cpcUsd.toFixed(2)}</td>
                                    <td className="text-right font-semibold tabular-nums text-slate-900">{compact(keyword.traffic)}</td>
                                </tr>
                            )
                        })}
                        {!rows.length && <tr><td colSpan={7} className="py-10 text-center text-sm text-slate-500">No keywords match these filters.</td></tr>}
                    </tbody>
                </table>
            </div>

            <div className="domain-table-footer">
                <span>{expanded ? `Showing ${Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–${Math.min(page * PAGE_SIZE, filtered.length)} of ${filtered.length}` : `Showing the top ${rows.length} returned keywords`}</span>
                {expanded && totalPages > 1 && (
                    <div className="flex items-center gap-2">
                        <button type="button" onClick={() => setPage(current => Math.max(1, current - 1))} disabled={page === 1} className="domain-pagination-button" aria-label="Previous page"><ChevronLeft className="h-4 w-4" /></button>
                        <strong>{page} / {totalPages}</strong>
                        <button type="button" onClick={() => setPage(current => Math.min(totalPages, current + 1))} disabled={page === totalPages} className="domain-pagination-button" aria-label="Next page"><ChevronRight className="h-4 w-4" /></button>
                    </div>
                )}
            </div>
        </section>
    )
}

function HeaderStat({ label, value }: { label: string; value: string }) {
    return <span className="domain-header-stat"><small>{label}</small><strong>{value}</strong></span>
}

function rankClass(position: number | null) {
    if (!position) return "is-muted"
    if (position <= 3) return "is-top3"
    if (position <= 10) return "is-top10"
    if (position <= 20) return "is-top20"
    return "is-default"
}

function Difficulty({ value }: { value: number | null }) {
    if (value == null) return <span className="text-slate-400">—</span>
    const tone = value >= 70 ? "is-hard" : value >= 40 ? "is-medium" : "is-easy"
    return <span className={`domain-difficulty ${tone}`}>{Math.round(value)}</span>
}
