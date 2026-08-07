import { Compass } from "lucide-react"
import type { OrganicKeywordsPayload } from "../api/domainResearchTypes"

const INTENTS = [
    { key: "informational", label: "Informational", color: "#14B8A6" },
    { key: "navigational", label: "Navigational", color: "#0F766E" },
    { key: "commercial", label: "Commercial", color: "#F59E0B" },
    { key: "transactional", label: "Transactional", color: "#10B981" },
] as const

export function SearchIntentWidget({ data }: { data: OrganicKeywordsPayload }) {
    const rows = INTENTS.map(intent => {
        const matches = data.keywords.filter(keyword => keyword.intent?.toLowerCase() === intent.key)
        return { ...intent, count: matches.length, traffic: matches.reduce((sum, keyword) => sum + keyword.traffic, 0) }
    })
    const total = Math.max(1, rows.reduce((sum, row) => sum + row.count, 0))

    return (
        <section className="dashboard-card domain-insight-card overflow-hidden">
            <div className="dashboard-card-header min-h-[60px]">
                <div className="flex items-center gap-2.5"><span className="domain-card-icon"><Compass className="h-4 w-4" /></span><div><h2 className="dashboard-card-title">Search intent distribution</h2><p className="dashboard-card-subtitle mt-0.5">Why users search across the returned keyword set</p></div></div>
            </div>
            <div className="p-5">
                <div className="flex h-2.5 overflow-hidden rounded-full bg-slate-100" aria-label="Keyword intent distribution">
                    {rows.map(row => <span key={row.key} style={{ width: `${(row.count / total) * 100}%`, background: row.color }} title={`${row.label}: ${row.count}`} />)}
                </div>
                <div className="mt-4 divide-y divide-slate-100">
                    {rows.map(row => (
                        <div key={row.key} className="grid min-h-11 grid-cols-[minmax(0,1fr)_72px_98px] items-center gap-3">
                            <span className="flex min-w-0 items-center gap-2.5 text-[12px] font-semibold text-slate-700"><span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: row.color }} />{row.label}</span>
                            <span className="text-right text-[12px] font-bold tabular-nums text-slate-900">{row.count.toLocaleString()}</span>
                            <span className="text-right text-[11px] font-medium tabular-nums text-slate-500">{compact(row.traffic)} visits</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

function compact(value: number) {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
    if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`
    return value.toLocaleString()
}
