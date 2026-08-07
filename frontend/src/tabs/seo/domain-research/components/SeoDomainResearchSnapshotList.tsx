import { useEffect, useState } from "react"
import { ChevronLeft, ChevronRight, Loader2, TrendingUp } from "lucide-react"
import { countryFlagUrl } from "@/lib/countries"
import { domainResearchApi } from "../api/domainResearchApi"

type Snapshot = {
    id: string
    targetDomain: string
    countryIsoCode: string
    languageCode: string
    fetchedAt: string
    organicTraffic: number
    organicKeywords: number
    locationName: string
    historyMonths: number
}

type Props = {
    projectId: string
    onSelectSnapshot: (domain: string, country: string, languageCode: string, historyMonths: number) => void
}

function compact(value: number) {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
    if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`
    return value.toLocaleString()
}

export function SeoDomainResearchSnapshotList({ projectId, onSelectSnapshot }: Props) {
    const [snapshots, setSnapshots] = useState<Snapshot[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)

    useEffect(() => {
        let mounted = true
        setIsLoading(true)
        domainResearchApi.listSnapshots(projectId, { page, page_size: 10 })
            .then(data => {
                if (!mounted) return
                setSnapshots(data.snapshots || [])
                setTotalPages(Math.max(1, Math.ceil((data.total ?? 0) / 10)))
            })
            .catch(console.error)
            .finally(() => { if (mounted) setIsLoading(false) })
        return () => { mounted = false }
    }, [projectId, page])

    if (isLoading && snapshots.length === 0) {
        return <div className="dashboard-card flex h-36 items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-amber-600" /></div>
    }

    if (snapshots.length === 0) {
        return (
            <div className="dashboard-card flex flex-col items-center justify-center py-14 text-center">
                <span className="domain-empty-icon"><TrendingUp className="h-5 w-5" /></span>
                <h3 className="mt-3 text-sm font-semibold text-zinc-900">No saved domain reports yet</h3>
                <p className="mt-1 max-w-sm text-xs leading-5 text-zinc-500">Run a domain analysis once, then future visits can open the saved report instantly.</p>
            </div>
        )
    }

    return (
        <section className="dashboard-card overflow-hidden">
            <div className="dashboard-card-header min-h-[60px]">
                <div>
                    <span className="domain-list-eyebrow">Saved research</span>
                    <h2 className="dashboard-card-title">Recent domain reports</h2>
                    <p className="dashboard-card-subtitle mt-0.5">Open a previous analysis without running a new search</p>
                </div>
                <span className="domain-count-badge">{snapshots.length} saved</span>
            </div>

            <div className="overflow-x-auto">
                <table className="domain-preview-table w-full min-w-[680px] text-left">
                    <thead>
                        <tr>
                            <th>Domain</th>
                            <th className="text-right">Organic traffic</th>
                            <th className="text-right">Keywords</th>
                            <th className="text-right">Analyzed</th>
                        </tr>
                    </thead>
                    <tbody>
                        {snapshots.map(snapshot => {
                            const date = new Date(snapshot.fetchedAt)
                            const dateLabel = Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                            return (
                                <tr key={snapshot.id} onClick={() => onSelectSnapshot(snapshot.targetDomain, snapshot.countryIsoCode, snapshot.languageCode, snapshot.historyMonths)} className="group cursor-pointer">
                                    <td>
                                        <div className="flex min-w-0 items-center gap-3">
                                            <span className="domain-row-logo">
                                                <img src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(snapshot.targetDomain)}&sz=64`} alt="" />
                                            </span>
                                            <div className="min-w-0">
                                                <p className="truncate text-[13px] font-semibold text-zinc-900 group-hover:text-amber-800">{snapshot.targetDomain}</p>
                                                <p className="mt-1 flex items-center gap-1.5 text-[10.5px] text-zinc-500">
                                                    <img src={countryFlagUrl(snapshot.countryIsoCode)} alt="" className="h-3 w-[18px] rounded-[2px] object-cover shadow-sm" />
                                                    <span>{snapshot.locationName || snapshot.countryIsoCode}</span>
                                                    <span>·</span>
                                                    <span className="uppercase">{snapshot.languageCode}</span>
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="text-right font-semibold tabular-nums text-zinc-900">{compact(snapshot.organicTraffic)}</td>
                                    <td className="text-right font-medium tabular-nums text-zinc-700">{compact(snapshot.organicKeywords)}</td>
                                    <td className="text-right">
                                        <span className="inline-flex items-center justify-end gap-2 text-zinc-500">{dateLabel}<ChevronRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5 group-hover:text-amber-700" /></span>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="domain-table-footer">
                    <span>Page {page} of {totalPages}</span>
                    <div className="flex items-center gap-2">
                        <button type="button" onClick={() => setPage(current => Math.max(1, current - 1))} disabled={page === 1} className="domain-pagination-button" aria-label="Previous page"><ChevronLeft className="h-4 w-4" /></button>
                        <button type="button" onClick={() => setPage(current => Math.min(totalPages, current + 1))} disabled={page === totalPages} className="domain-pagination-button" aria-label="Next page"><ChevronRight className="h-4 w-4" /></button>
                    </div>
                </div>
            )}
        </section>
    )
}
