import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import type { DomainResearchOverviewPayload } from "../api/domainResearchTypes"

function compact(value: number) {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
    if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`
    return value.toLocaleString()
}

const BUCKETS = [
    { key: "top3", label: "Top 3", color: "#F59E0B" },
    { key: "positions4To10", label: "4–10", color: "#0F766E" },
    { key: "positions11To20", label: "11–20", color: "#10B981" },
    { key: "positions21To50", label: "21–50", color: "#F97316" },
    { key: "positions51To100", label: "51–100", color: "#F43F5E" },
] as const

export function PositionDistributionBar({ data }: { data: DomainResearchOverviewPayload }) {
    const distribution = data.rankingDistribution
    const chartData = BUCKETS.map(bucket => ({
        name: bucket.label,
        value: distribution[bucket.key],
        color: bucket.color,
    }))
    const total = chartData.reduce((sum, item) => sum + item.value, 0)

    return (
        <div className="domain-position-chart">
            <div className="domain-position-summary">
                {chartData.map(item => (
                    <div key={item.name}>
                        <p><span style={{ background: item.color }} />{item.name}</p>
                        <strong>{compact(item.value)}</strong>
                    </div>
                ))}
            </div>

            <div className="domain-position-frame">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 12, right: 8, left: 0, bottom: 0 }} barCategoryGap="32%">
                        <CartesianGrid vertical={false} stroke="#E8EDF4" strokeDasharray="3 5" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#64748B", fontSize: 10.5, fontWeight: 600 }} dy={9} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94A3B8", fontSize: 10 }} tickFormatter={compact} width={42} />
                        <Tooltip
                            cursor={{ fill: "#F8FAFC" }}
                            contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0", boxShadow: "0 14px 32px rgba(15,23,42,.12)", fontSize: 12, padding: "9px 11px" }}
                            formatter={value => [compact(Number(value ?? 0)), "Keywords"]}
                            labelStyle={{ color: "#0F172A", fontWeight: 700, marginBottom: 3 }}
                        />
                        <Bar dataKey="value" radius={[7, 7, 2, 2]} maxBarSize={48}>
                            {chartData.map(item => <Cell key={item.name} fill={item.color} />)}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="domain-position-footer">
                <span>Ranked keyword universe</span>
                <strong>{compact(total)}</strong>
            </div>
        </div>
    )
}
