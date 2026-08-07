import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import type { DomainResearchOverviewPayload } from "../api/domainResearchTypes"

function formatNumber(num: number): string {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M"
    if (num >= 1000) return (num / 1000).toFixed(1) + "K"
    return num.toString()
}

export function RankingDistribution({ data }: { data: DomainResearchOverviewPayload }) {
    const rd = data.rankingDistribution
    
    const chartData = [
        { name: "Top 3", value: rd.top3, color: "#10b981" },
        { name: "4-10", value: rd.positions4To10, color: "#3b82f6" },
        { name: "11-20", value: rd.positions11To20, color: "#3b82f6" },
        { name: "21-50", value: rd.positions21To50, color: "#93c5fd" },
        { name: "51-100", value: rd.positions51To100, color: "#c4b5fd" },
    ]

    const total = rd.top3 + rd.positions4To10 + rd.positions11To20 + rd.positions21To50 + rd.positions51To100

    return (
        <div className="flex flex-col rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h3 className="text-lg font-semibold text-slate-900">Organic Position Distribution</h3>
            <p className="mt-1 text-sm text-slate-500">Based on {formatNumber(total)} ranked keywords</p>
            
            <div className="mt-6 h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                        <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: "#64748b", fontSize: 12 }} 
                            dy={10}
                        />
                        <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: "#64748b", fontSize: 12 }} 
                            tickFormatter={formatNumber}
                        />
                        <Tooltip
                            cursor={{ fill: '#f8fafc' }}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            formatter={(value: any) => [formatNumber(Number(value ?? 0)), "Keywords"]}
                            labelStyle={{ color: '#0f172a', fontWeight: 600, marginBottom: '4px' }}
                        />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
