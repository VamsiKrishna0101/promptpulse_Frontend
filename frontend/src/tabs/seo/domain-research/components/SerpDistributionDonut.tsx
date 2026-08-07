import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import type { OrganicKeywordsPayload } from "../api/domainResearchTypes"

export function SerpDistributionDonut({ data }: { data: OrganicKeywordsPayload }) {
    let aiOverviews = 0
    let otherFeatures = 0
    
    const organic = data.keywords.length || 1

    data.keywords.forEach(kw => {
        if (!kw.serpFeatures) return
        if (kw.serpFeatures.some(f => f.toLowerCase().includes("ai") || f.toLowerCase().includes("generative"))) {
            aiOverviews++
        }
        if (kw.serpFeatures.some(f => !f.toLowerCase().includes("ai") && !f.toLowerCase().includes("generative"))) {
            otherFeatures++
        }
    })

    const chartData = [
        { name: "Organic", value: organic, color: "#2563eb" },
        { name: "AI Overviews", value: aiOverviews, color: "#f472b6" },
        { name: "Other SERP Features", value: otherFeatures, color: "#4ade80" },
    ]

    const totalFeatures = organic + aiOverviews + otherFeatures

    return (
        <div className="flex flex-col w-full h-full">
            <h3 className="text-[16px] font-bold text-slate-900 mb-6">Google SERP Positions Distribution</h3>
            
            <div className="flex items-center gap-6">
                <div className="h-28 w-28 flex-shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={34}
                                outerRadius={54}
                                paddingAngle={0}
                                dataKey="value"
                                stroke="none"
                            >
                                {chartData.map((entry, i) => (
                                    <Cell key={`c-${i}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,.1)", fontSize: 12, padding: "8px 12px" }}
                                formatter={(v: any) => [`${Math.round((Number(v ?? 0) / totalFeatures) * 100)}%`, "Share"]}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="flex flex-col gap-3 flex-1">
                    {chartData.map((d, i) => {
                        const pct = Math.round((d.value / totalFeatures) * 100) || 0
                        return (
                            <div key={i} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="h-3 w-3 flex-shrink-0 rounded-full" style={{ background: d.color }} />
                                    <span className="text-[13px] text-slate-700">{d.name}</span>
                                </div>
                                <span className="text-[13px] text-slate-900 font-medium tabular-nums">
                                    {pct}%
                                </span>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
