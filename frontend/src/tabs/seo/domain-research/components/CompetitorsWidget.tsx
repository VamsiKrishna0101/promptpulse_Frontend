import { useEffect, useMemo, useState } from "react"
import { ArrowRight, ChevronLeft, ChevronRight, ExternalLink, Search } from "lucide-react"
import type { CompetitorsPayload } from "../api/domainResearchTypes"

const PAGE_SIZE = 25

function compact(value: number) {
    if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
    if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`
    return value.toLocaleString()
}

export function CompetitorsWidget({ data, expanded = false, onViewDetails }: {
    data: CompetitorsPayload
    expanded?: boolean
    onViewDetails?: () => void
}) {
    const [query, setQuery] = useState("")
    const [strength, setStrength] = useState("all")
    const [page, setPage] = useState(1)

    useEffect(() => setPage(1), [query, strength])
    const filtered = useMemo(() => data.competitors.filter(item => item.domain !== data.target.domain && item.domain.toLowerCase().includes(query.toLowerCase()) && (strength === "all" || item.strength === strength)), [data.competitors, data.target.domain, query, strength])
    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
    const rows = expanded ? filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE) : filtered.slice(0, 5)

    return (
        <section className="dashboard-card domain-table-card">
            <div className="dashboard-card-header domain-table-card-header">
                <div className="min-w-0">
                    <div className="flex items-center gap-2"><h2 className="dashboard-card-title">Organic competitors</h2><span className="domain-count-badge">{compact(data.summary.totalCompetitors)}</span></div>
                    <p className="dashboard-card-subtitle mt-0.5">Domains overlapping with the same organic keyword universe</p>
                </div>
                {expanded ? (
                    <div className="domain-table-filters">
                        <label className="domain-filter-search"><Search className="h-3.5 w-3.5" /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Filter competitors" /></label>
                        <select value={strength} onChange={event => setStrength(event.target.value)} aria-label="Competitor strength"><option value="all">All strength</option><option value="PRIMARY">Primary</option><option value="CHALLENGER">Challengers</option><option value="EMERGING">Emerging</option></select>
                    </div>
                ) : <button type="button" onClick={onViewDetails} className="domain-view-all">View all competitors <ArrowRight className="h-3.5 w-3.5" /></button>}
            </div>

            {expanded && <div className="domain-expanded-stats"><HeaderStat label="Returned" value={compact(filtered.length)} /><HeaderStat label="Primary" value={compact(data.summary.primaryCompetitors)} /><HeaderStat label="Challengers" value={compact(data.summary.challengers)} /><HeaderStat label="Shared universe" value={compact(data.summary.sharedKeywordUniverse)} /></div>}

            <div className="overflow-x-auto">
                <table className="domain-preview-table w-full min-w-[690px] text-left">
                    <thead><tr><th>Competitor</th><th>Strength</th><th className="text-right">Shared</th><th className="text-right">Coverage</th><th className="text-right">Avg. pos.</th><th className="text-right">Traffic</th></tr></thead>
                    <tbody>
                        {rows.map((item, index) => (
                            <tr key={`${item.domain}-${index}`}>
                                <td>
                                    <div className="flex min-w-0 items-center gap-2.5">
                                        <span className="domain-row-logo"><img src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(item.domain)}&sz=64`} alt="" /></span>
                                        <a href={`https://${item.domain}`} target="_blank" rel="noopener noreferrer" className="flex min-w-0 items-center gap-1.5 text-[12.5px] font-semibold text-slate-900 hover:text-teal-700"><span className="truncate">{item.domain}</span><ExternalLink className="h-3.5 w-3.5 shrink-0 text-slate-400" /></a>
                                    </div>
                                </td>
                                <td><span className={`domain-strength-badge domain-strength-${item.strength.toLowerCase()}`}>{item.strength.charAt(0) + item.strength.slice(1).toLowerCase()}</span></td>
                                <td className="text-right font-semibold tabular-nums text-slate-900">{compact(item.sharedKeywords)}</td>
                                <td className="text-right"><span className="domain-coverage-value">{item.sharedCoveragePercent.toFixed(1)}%</span></td>
                                <td className="text-right font-medium tabular-nums text-slate-700">{item.averagePosition.toFixed(1)}</td>
                                <td className="text-right font-medium tabular-nums text-slate-700">{compact(item.estimatedTraffic)}</td>
                            </tr>
                        ))}
                        {!rows.length && <tr><td colSpan={6} className="py-10 text-center text-sm text-slate-500">No competitors match these filters.</td></tr>}
                    </tbody>
                </table>
            </div>

            <div className="domain-table-footer">
                <span>{expanded ? `Showing ${Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–${Math.min(page * PAGE_SIZE, filtered.length)} of ${filtered.length}` : `${compact(data.summary.sharedKeywordUniverse)} keywords across the shared search landscape`}</span>
                {expanded && totalPages > 1 && <div className="flex items-center gap-2"><button type="button" onClick={() => setPage(current => Math.max(1, current - 1))} disabled={page === 1} className="domain-pagination-button" aria-label="Previous page"><ChevronLeft className="h-4 w-4" /></button><strong>{page} / {totalPages}</strong><button type="button" onClick={() => setPage(current => Math.min(totalPages, current + 1))} disabled={page === totalPages} className="domain-pagination-button" aria-label="Next page"><ChevronRight className="h-4 w-4" /></button></div>}
            </div>
        </section>
    )
}

function HeaderStat({ label, value }: { label: string; value: string }) { return <span className="domain-header-stat"><small>{label}</small><strong>{value}</strong></span> }
