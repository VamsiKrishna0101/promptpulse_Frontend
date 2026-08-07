import { BarChart3, Bot, Globe2, MousePointer2, Search, Sparkles, Users } from "lucide-react"
import type { TrafficIntelligencePayload } from "../api/trafficIntelligenceTypes"
import { compactNumber, dateLabel, displayDomain, percent, secondsLabel } from "../lib/trafficIntelligenceFormat"

const CHANNELS = [
    { key: "directTraffic", label: "Direct", color: "#0f172a" },
    { key: "searchTraffic", label: "Search", color: "#2563eb" },
    { key: "referralTraffic", label: "Referral", color: "#06b6d4" },
    { key: "socialTraffic", label: "Social", color: "#f59e0b" },
    { key: "mailTraffic", label: "Mail", color: "#10b981" },
    { key: "displayAdsTraffic", label: "Display", color: "#ec4899" },
]

function metric(value: number | null | undefined) {
    return value == null ? null : value
}

export function TrafficIntelligenceOverview({ data }: { data: TrafficIntelligencePayload }) {
    const latest = data.monthlyVisits.at(-1)
    const previous = data.monthlyVisits.at(-2)
    const trafficChange = latest && previous && previous.visits > 0 ? ((latest.visits - previous.visits) / previous.visits) * 100 : null
    const channelValues = CHANNELS.map(channel => ({ ...channel, value: metric(data[channel.key as keyof TrafficIntelligencePayload] as number | null) })).filter(channel => channel.value != null && channel.value > 0)
    const channelTotal = channelValues.reduce((sum, channel) => sum + (channel.value ?? 0), 0)
    const countries = [...(data.website_traffic_by_country ?? [])].sort((a, b) => b.share - a.share).slice(0, 5)
    const aiHistory = data.aiTrafficShareHistory?.slice(-6) ?? []

    return (
        <section className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 bg-slate-50 px-5 py-5 sm:px-6">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex min-w-0 items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-950 text-sm font-bold text-white shadow-sm">{data.favicon ? <img src={data.favicon} alt="" className="h-full w-full object-cover" /> : data.domain.slice(0, 1).toUpperCase()}</div>
                        <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h2 className="truncate text-[17px] font-bold tracking-tight text-slate-950">Traffic intelligence</h2><span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em] text-slate-500">Estimated</span></div><p className="mt-1 truncate text-[12px] font-medium text-slate-500">{displayDomain(data.domain)} · competitive acquisition signals</p></div>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500"><span className="rounded-full border border-slate-200 bg-white px-2.5 py-1">Snapshot {dateLabel(data.snapshotDate)}</span><span className="rounded-full border border-slate-200 bg-white px-2.5 py-1">Captured {dateLabel(data.data_captured_at)}</span></div>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
                    <HeroMetric icon={<Users className="h-4 w-4" />} label="Monthly visits" value={compactNumber(data.totalVisits)} trend={trafficChange != null ? `${trafficChange >= 0 ? "+" : ""}${trafficChange.toFixed(1)}%` : undefined} />
                    <HeroMetric icon={<Search className="h-4 w-4" />} label="Search share" value={percent(data.searchTraffic)} detail="all search traffic" />
                    <HeroMetric icon={<MousePointer2 className="h-4 w-4" />} label="Pages / visit" value={data.engagement?.pagesPerVisit?.toFixed(1) ?? "—"} detail="engagement depth" />
                    <HeroMetric icon={<Bot className="h-4 w-4" />} label="GenAI share" value={percent(data.genAiTraffic)} detail="AI-referred visits" />
                </div>
            </div>

            <div className="grid gap-5 p-5 sm:p-6 xl:grid-cols-[1.15fr_0.85fr]"><TrafficMixCard data={data} values={channelValues} total={channelTotal} /><EngagementCard data={data} /></div>
            <div className="grid gap-5 border-t border-slate-100 p-5 sm:p-6 xl:grid-cols-[0.9fr_1.1fr]"><CountryCard countries={countries} /><KeywordCard keywords={data.topKeywords ?? []} /></div>

            <div className="border-t border-slate-100 bg-slate-50/50 p-5 sm:p-6">
                <div className="mb-4 flex items-center justify-between gap-3"><div><h3 className="flex items-center gap-2 text-[13px] font-bold text-slate-950"><Sparkles className="h-4 w-4 text-blue-600" /> AI acquisition signal</h3><p className="mt-1 text-[11px] text-slate-500">Estimated share of visits attributed to AI assistants.</p></div><span className="rounded-full border border-blue-200 bg-white px-2.5 py-1 text-[10px] font-semibold text-blue-700">{percent(data.genAiTraffic)} total AI</span></div>
                <div className="grid gap-4 lg:grid-cols-[1fr_220px] lg:items-end">
                    <div className="flex h-28 items-end gap-2 rounded-xl border border-slate-200 bg-white px-4 pb-3 pt-4">
                        {aiHistory.length ? aiHistory.map((point, index) => {
                            const values = [point.chatgpt_share, point.claude_share, point.perplexity_share, point.gemini_share, point.copilot_share].filter((value): value is number => value != null)
                            const height = Math.max(8, Math.min(100, values.reduce((sum, value) => sum + value, 0)))
                            return <div key={`${point.date}-${index}`} className="group flex min-w-0 flex-1 flex-col items-center gap-1"><div className="relative flex h-20 w-full items-end justify-center"><div className="w-full max-w-[38px] rounded-t-md bg-gradient-to-t from-blue-700 to-cyan-400 transition group-hover:from-blue-600" style={{ height: `${height}%` }} /></div><span className="truncate text-[9px] font-semibold text-slate-400">{dateLabel(point.date)}</span></div>
                        }) : <EmptyInline label="No AI history reported" />}
                    </div>
                    <div className="grid grid-cols-2 gap-2"><AiShare label="ChatGPT" value={data.aiTrafficShareChatgpt} /><AiShare label="Claude" value={data.aiTrafficShareClaude} /><AiShare label="Perplexity" value={data.aiTrafficSharePerplexity} /><AiShare label="Gemini" value={data.aiTrafficShareGemini} /></div>
                </div>
            </div>
        </section>
    )
}

function HeroMetric({ icon, label, value, detail, trend }: { icon: React.ReactNode; label: string; value: string; detail?: string; trend?: string }) {
    return <div className="rounded-xl border border-slate-200 bg-white/80 p-3.5"><div className="flex items-center justify-between text-slate-400"><span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em]">{icon}{label}</span>{trend && <span className="rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">{trend}</span>}</div><div className="mt-2 text-xl font-bold tracking-tight text-slate-950">{value}</div>{detail && <div className="mt-0.5 text-[10px] text-slate-500">{detail}</div>}</div>
}

function TrafficMixCard({ data, values, total }: { data: TrafficIntelligencePayload; values: { key: string; label: string; color: string; value: number | null }[]; total: number }) {
    return <div><SectionHeading icon={<BarChart3 className="h-4 w-4 text-blue-600" />} title="Acquisition mix" subtitle="How estimated visits arrive at the domain" /><div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">{values.map(channel => <div key={channel.key} className="inline-block h-full" style={{ width: `${total ? ((channel.value ?? 0) / total) * 100 : 0}%`, backgroundColor: channel.color }} />)}</div><div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">{values.map(channel => <div key={channel.key} className="flex items-center justify-between gap-2 text-[11px]"><span className="flex items-center gap-1.5 font-medium text-slate-600"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: channel.color }} />{channel.label}</span><span className="font-bold tabular-nums text-slate-950">{percent(channel.value)}</span></div>)}</div><div className="mt-5 flex flex-wrap gap-2 text-[10px] font-medium text-slate-500"><span className="rounded-full bg-blue-50 px-2.5 py-1 text-blue-700">Organic search {percent(data.searchOrganicTraffic)}</span><span className="rounded-full bg-slate-100 px-2.5 py-1">Paid search {percent(data.searchPaidTraffic)}</span><span className="rounded-full bg-cyan-50 px-2.5 py-1 text-cyan-700">Referral {percent(data.referralTraffic)}</span></div></div>
}

function EngagementCard({ data }: { data: TrafficIntelligencePayload }) {
    return <div><SectionHeading icon={<Users className="h-4 w-4 text-cyan-600" />} title="Audience quality" subtitle="Engagement indicators for the latest snapshot" /><div className="mt-4 grid grid-cols-2 gap-3"><MiniMetric label="Bounce rate" value={percent(data.engagement?.bounceRate)} /><MiniMetric label="Time on site" value={secondsLabel(data.engagement?.timeOnSite)} /><MiniMetric label="Monthly visits" value={compactNumber(data.engagement?.visits)} /><MiniMetric label="Top geography" value={data.countryShare?.[0]?.country ?? "—"} /></div><div className="mt-4 rounded-xl border border-cyan-100 bg-cyan-50/60 p-3 text-[11px] leading-5 text-cyan-900"><Globe2 className="mr-1 inline h-3.5 w-3.5" /> Visitors are estimated from external competitive-intelligence data; use first-party analytics for client reporting.</div></div>
}

function CountryCard({ countries }: { countries: TrafficIntelligencePayload["website_traffic_by_country"] }) {
    return <div><SectionHeading icon={<Globe2 className="h-4 w-4 text-emerald-600" />} title="Top markets" subtitle="Estimated traffic share by country" /><div className="mt-3 space-y-3">{countries.length ? countries.map(country => <div key={country.country}><div className="mb-1 flex items-center justify-between text-[11px]"><span className="font-semibold text-slate-700">{country.country}</span><span className="font-bold tabular-nums text-slate-950">{percent(country.share)}</span></div><div className="h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400" style={{ width: `${Math.max(3, country.share * 100)}%` }} /></div></div>) : <EmptyInline label="No geography data" />}</div></div>
}

function KeywordCard({ keywords }: { keywords: TrafficIntelligencePayload["topKeywords"] }) {
    return <div><SectionHeading icon={<Search className="h-4 w-4 text-amber-600" />} title="Top search demand" subtitle="Keywords associated with estimated domain traffic" /><div className="mt-3 overflow-hidden rounded-xl border border-slate-200"><table className="w-full text-left"><thead className="bg-slate-50 text-[9px] font-bold uppercase tracking-[0.1em] text-slate-400"><tr><th className="px-3 py-2">Keyword</th><th className="px-3 py-2 text-right">Volume</th><th className="px-3 py-2 text-right">CPC</th></tr></thead><tbody className="divide-y divide-slate-100">{keywords.slice(0, 5).map(keyword => <tr key={keyword.keyword} className="text-[11px] hover:bg-blue-50/40"><td className="max-w-[220px] truncate px-3 py-2.5 font-semibold text-slate-700">{keyword.keyword}</td><td className="px-3 py-2.5 text-right font-medium tabular-nums text-slate-600">{compactNumber(keyword.searchVolume)}</td><td className="px-3 py-2.5 text-right font-medium tabular-nums text-slate-600">{keyword.cpc == null ? "—" : `$${keyword.cpc.toFixed(2)}`}</td></tr>)}{!keywords.length && <tr><td colSpan={3} className="px-3 py-7 text-center text-[11px] text-slate-400">No keyword demand data</td></tr>}</tbody></table></div></div>
}

function SectionHeading({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) { return <div><h3 className="flex items-center gap-2 text-[13px] font-bold text-slate-950">{icon}{title}</h3><p className="mt-1 text-[11px] text-slate-500">{subtitle}</p></div> }
function MiniMetric({ label, value }: { label: string; value: string }) { return <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3"><div className="text-[10px] font-semibold text-slate-500">{label}</div><div className="mt-1 text-[16px] font-bold tabular-nums text-slate-950">{value}</div></div> }
function AiShare({ label, value }: { label: string; value: number | null }) { return <div className="rounded-lg border border-slate-200 bg-white px-2.5 py-2"><div className="text-[10px] font-medium text-slate-500">{label}</div><div className="mt-0.5 text-[13px] font-bold text-slate-950">{percent(value)}</div></div> }
function EmptyInline({ label }: { label: string }) { return <div className="rounded-xl border border-dashed border-slate-200 px-3 py-5 text-center text-[11px] text-slate-400">{label}</div> }
