import {
    CartesianGrid,
    ResponsiveContainer,
    Scatter,
    ScatterChart,
    Tooltip,
    XAxis,
    YAxis,
    ZAxis,
} from "recharts"
import type { CompetitorsPayload } from "../api/domainResearchTypes"

function formatNumber(num: number): string {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M"
    if (num >= 1000) return (num / 1000).toFixed(1) + "K"
    return num.toString()
}

export function CompetitiveMapWidget({ data }: { data: CompetitorsPayload }) {
    // Map competitors to a generic array for Recharts.
    // X-axis: Shared Keywords, Y-axis: Traffic, Z-axis: Bubble size (Total Keywords)
    const chartData = data.competitors.slice(0, 15).map(c => ({
        domain: c.domain,
        sharedKeywords: c.sharedKeywords,
        traffic: c.estimatedTraffic,
        totalKeywords: c.totalKeywords,
        fill: c.strength === "PRIMARY" ? "#1a1a1a" : c.strength === "CHALLENGER" ? "#64748b" : "#cbd5e1"
    }))

    return (
        <div className="flex h-full flex-col rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-slate-900">Competitive Positioning Map</h3>
                    <p className="mt-1 text-sm text-slate-500">Based on Organic Traffic & Keywords</p>
                </div>
            </div>
            
            <div className="mt-6 h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis 
                            type="number" 
                            dataKey="sharedKeywords" 
                            name="Shared Keywords" 
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "#64748b", fontSize: 12 }} 
                            tickFormatter={formatNumber}
                        />
                        <YAxis 
                            type="number" 
                            dataKey="traffic" 
                            name="Traffic" 
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "#64748b", fontSize: 12 }} 
                            tickFormatter={formatNumber}
                            dx={-10}
                        />
                        <ZAxis 
                            type="number" 
                            dataKey="totalKeywords" 
                            range={[60, 400]} 
                            name="Total Keywords" 
                        />
                        <Tooltip 
                            cursor={{ strokeDasharray: '3 3' }}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            formatter={(value: any, name?: any) => {
                                if (name === 'Shared Keywords') return [formatNumber(value), "Shared KWs"]
                                if (name === 'Traffic') return [formatNumber(value), "Organic Traffic"]
                                return [formatNumber(value), "Total Keywords"]
                            }}
                            labelFormatter={() => ""}
                            content={({ payload }) => {
                                if (payload && payload.length) {
                                    const data = payload[0].payload
                                    return (
                                        <div className="rounded-lg bg-slate-900 p-3 text-sm text-white shadow-xl">
                                            <p className="mb-2 font-bold">{data.domain}</p>
                                            <p><span className="text-slate-400">Traffic:</span> {formatNumber(data.traffic)}</p>
                                            <p><span className="text-slate-400">Shared KWs:</span> {formatNumber(data.sharedKeywords)}</p>
                                        </div>
                                    )
                                }
                                return null
                            }}
                        />
                        <Scatter 
                            data={chartData} 
                            fill="#2563eb" 
                            fillOpacity={0.7}
                        />
                    </ScatterChart>
                </ResponsiveContainer>
            </div>
            <div className="mt-6 flex items-center justify-center gap-6 text-sm text-slate-500">
                <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-slate-900"></div>
                    <span>Primary</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-slate-400"></div>
                    <span>Challenger</span>
                </div>
            </div>
        </div>
    )
}
