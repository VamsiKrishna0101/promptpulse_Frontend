import { SearchCheck } from "lucide-react"
import type { OrganicKeywordsPayload } from "../api/domainResearchTypes"

const FEATURE_COLORS = ["#14B8A6", "#10B981", "#F59E0B", "#F97316", "#F43F5E", "#84CC16", "#0F766E", "#EAB308"]

export function SerpFeaturesWidget({ data }: { data: OrganicKeywordsPayload }) {
    const counts = new Map<string, number>()
    data.keywords.forEach(keyword => keyword.serpFeatures.forEach(feature => counts.set(feature, (counts.get(feature) ?? 0) + 1)))
    const rows = [...counts.entries()].sort((left, right) => right[1] - left[1]).slice(0, 8)
    const total = Math.max(1, data.summary.returnedKeywords)

    return (
        <section className="dashboard-card domain-insight-card overflow-hidden">
            <div className="dashboard-card-header min-h-[60px]">
                <div className="flex items-center gap-2.5"><span className="domain-card-icon"><SearchCheck className="h-4 w-4" /></span><div><h2 className="dashboard-card-title">SERP feature exposure</h2><p className="dashboard-card-subtitle mt-0.5">Special result types appearing for ranking keywords</p></div></div>
            </div>
            <div className="grid grid-cols-2 gap-2.5 p-4">
                {rows.length ? rows.map(([feature, count], index) => {
                    const percent = Math.round((count / total) * 100)
                    const color = FEATURE_COLORS[index % FEATURE_COLORS.length]
                    return (
                        <div key={feature} className="domain-serp-feature">
                            <div><p><b style={{ background: color }} />{pretty(feature)}</p><strong>{count}</strong></div>
                            <span><i style={{ width: `${Math.min(100, percent)}%`, background: color }} /></span>
                            <small>{percent}% of returned keywords</small>
                        </div>
                    )
                }) : <div className="col-span-2 flex min-h-44 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500">No SERP features in this snapshot.</div>}
            </div>
        </section>
    )
}

function pretty(value: string) { return value.replaceAll("_", " ").replace(/\b\w/g, letter => letter.toUpperCase()) }
