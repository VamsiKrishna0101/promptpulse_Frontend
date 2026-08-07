import { useEffect, useMemo, useState } from "react"
import { ArrowRight, ChevronLeft, ChevronRight, ExternalLink, Search } from "lucide-react"
import type { TopPagesPayload } from "../api/domainResearchTypes"

const PAGE_SIZE = 25

function compact(value: number) {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
    if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`
    return value.toLocaleString()
}

export function TopPagesWidget({ data, expanded = false, onViewDetails }: {
    data: TopPagesPayload
    expanded?: boolean
    onViewDetails?: () => void
}) {
    const [query, setQuery] = useState("")
    const [status, setStatus] = useState("all")
    const [page, setPage] = useState(1)

    useEffect(() => setPage(1), [query, status])
    const filtered = useMemo(() => data.pages.filter(item => (
        item.url.toLowerCase().includes(query.toLowerCase()) || item.path.toLowerCase().includes(query.toLowerCase())
    ) && (status === "all" || item.status === status)), [data.pages, query, status])
    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
    const rows = expanded ? filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE) : filtered.slice(0, 5)

    return (
        <section className="dashboard-card domain-table-card">
            <div className="dashboard-card-header domain-table-card-header">
                <div className="min-w-0">
                    <div className="flex items-center gap-2"><h2 className="dashboard-card-title">Top organic pages</h2><span className="domain-count-badge">{compact(data.summary.totalPages)}</span></div>
                    <p className="dashboard-card-subtitle mt-0.5">Landing pages with the strongest organic contribution</p>
                </div>
                {expanded ? (
                    <div className="domain-table-filters">
                        <label className="domain-filter-search"><Search className="h-3.5 w-3.5" /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Filter pages" /></label>
                        <select value={status} onChange={event => setStatus(event.target.value)} aria-label="Page status">
                            <option value="all">All status</option>
                            <option value="WINNER">Winners</option>
                            <option value="GROWING">Growing</option>
                            <option value="DECLINING">Declining</option>
                            <option value="OPPORTUNITY">Opportunities</option>
                        </select>
                    </div>
                ) : <button type="button" onClick={onViewDetails} className="domain-view-all">View all pages <ArrowRight className="h-3.5 w-3.5" /></button>}
            </div>

            {expanded && <div className="domain-expanded-stats"><HeaderStat label="Returned" value={compact(data.summary.returnedPages)} /><HeaderStat label="Analyzed traffic" value={compact(data.summary.analyzedTraffic)} /><HeaderStat label="Top 3 pages" value={compact(data.summary.pagesWithTop3Rankings)} /><HeaderStat label="Growing" value={compact(data.summary.growingPages)} /></div>}

            <div className="overflow-x-auto">
                <table className="domain-preview-table w-full min-w-[660px] text-left">
                    <thead><tr><th>Page</th><th>Status</th><th className="text-right">Traffic</th><th className="text-right">Keywords</th><th className="text-right">Top 10</th><th className="text-right">Value</th></tr></thead>
                    <tbody>
                        {rows.map((item, index) => (
                            <tr key={`${item.url}-${index}`}>
                                <td className="max-w-[280px]">
                                    <div className="flex items-center gap-1.5"><p className="truncate text-[12.5px] font-semibold text-slate-900" title={item.url}>{item.path || item.url}</p><a href={item.url} target="_blank" rel="noopener noreferrer" className="shrink-0 text-slate-400 hover:text-teal-700" aria-label={`Open ${item.path}`}><ExternalLink className="h-3.5 w-3.5" /></a></div>
                                </td>
                                <td><span className={`domain-status-badge domain-status-${item.status.toLowerCase()}`}>{labelStatus(item.status)}</span></td>
                                <td className="text-right font-semibold tabular-nums text-slate-900">{compact(item.estimatedTraffic)}</td>
                                <td className="text-right font-medium tabular-nums text-slate-700">{compact(item.rankingKeywords)}</td>
                                <td className="text-right font-medium tabular-nums text-slate-700">{compact(item.top10Keywords)}</td>
                                <td className="text-right font-medium tabular-nums text-slate-700">${compact(item.trafficValueUsd)}</td>
                            </tr>
                        ))}
                        {!rows.length && <tr><td colSpan={6} className="py-10 text-center text-sm text-slate-500">No pages match these filters.</td></tr>}
                    </tbody>
                </table>
            </div>

            <div className="domain-table-footer">
                <span>{expanded ? `Showing ${Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–${Math.min(page * PAGE_SIZE, filtered.length)} of ${filtered.length}` : `${compact(data.summary.analyzedTraffic)} analyzed visits across the returned page set`}</span>
                {expanded && totalPages > 1 && <div className="flex items-center gap-2"><button type="button" onClick={() => setPage(current => Math.max(1, current - 1))} disabled={page === 1} className="domain-pagination-button" aria-label="Previous page"><ChevronLeft className="h-4 w-4" /></button><strong>{page} / {totalPages}</strong><button type="button" onClick={() => setPage(current => Math.min(totalPages, current + 1))} disabled={page === totalPages} className="domain-pagination-button" aria-label="Next page"><ChevronRight className="h-4 w-4" /></button></div>}
            </div>
        </section>
    )
}

function HeaderStat({ label, value }: { label: string; value: string }) { return <span className="domain-header-stat"><small>{label}</small><strong>{value}</strong></span> }
function labelStatus(status: string) { return status.charAt(0) + status.slice(1).toLowerCase() }
