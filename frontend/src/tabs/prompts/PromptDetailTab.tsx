import { useParams, Link } from "react-router-dom"
import { useProjects } from "@/hooks/useProjects"
import { useDashboard } from "@/hooks/useDashboard"
import { useVisibilityTimeSeries } from "@/hooks/useVisibilityTimeSeries"
import { ObservedDemandIndicator } from "@/components/ui/ObservedDemandIndicator"
import { usePrompts } from "@/hooks/usePrompts"
import { VisibilityChart } from "../overview/VisibilityChart"
import { Avatar, Fav, Sk, timeAgo } from "../overview/overview"

function brandDomain(name?: string | null) {
    return name ? `${name.toLowerCase().replace(/[^a-z0-9]/g, "")}.com` : undefined
}

export function PromptDetailTab() {
    const { promptId } = useParams<{ promptId: string }>()
    const { selectedProject } = useProjects()
    const projectId = selectedProject?.id ?? null

    const { prompts: promptRows, isLoading: promptsLoading } = usePrompts(projectId)
    const prompt = promptRows.find((p) => p.id === promptId)
    
    // We append the prompt_id to any other existing query string filters we want
    // But for this isolated view, we primarily filter by prompt_id.
    const qs = `?prompt_id=${promptId}`

    const { data: dash, competitors: tracked, isLoading } = useDashboard(projectId, qs)
    const { data: ts, isLoading: tsLoad } = useVisibilityTimeSeries(projectId, qs)

    const ownBrand = {
        name: selectedProject?.brand_name ?? "Your Brand",
        url: selectedProject?.brand_url,
        vis: dash?.brand.visibility ?? 0,
        sent: dash?.brand.avg_sentiment ?? null,
        pos: dash?.brand.avg_position ?? null,
    }
    const competitors = tracked.map(c => ({
        name: (c.name ?? c.brand_name) ?? "—",
        url: c.url || brandDomain(c.name ?? c.brand_name),
        vis: c.visibility,
        sent: c.avg_sentiment,
        pos: c.avg_position,
    }))
    const allBrands = [ownBrand, ...competitors].sort((a, b) => b.vis - a.vis)
    const topSrc = dash?.topSources?.slice(0, 8) || []

    const even = "premium-row-even"
    const odd  = "premium-row-odd"

    if (!prompt && selectedProject && !promptsLoading) {
        return <div className="p-8 text-zinc-500">Prompt not found in this project.</div>
    }

    return (
        <div className="flex flex-col gap-4 max-w-[1180px] pb-10">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[13px] font-medium text-zinc-500">
                    <svg className="text-zinc-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
                    <Link to="/prompts" className="hover:text-zinc-800 transition-colors">Prompts</Link>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                    <span className="text-zinc-800 font-semibold">Prompt</span>
                </div>
            </div>

            {/* Quick Filters */}
            <div className="flex items-center gap-2">
                <button className="flex items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-[12px] font-medium text-zinc-700 shadow-sm">
                    <span className="h-4 w-4 rounded bg-zinc-900 text-[10px] text-white flex items-center justify-center font-bold">{selectedProject?.brand_name?.[0] ?? 'P'}</span>
                    {selectedProject?.brand_name ?? "Project"}
                </button>
                <button className="flex items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-[12px] font-medium text-zinc-700 shadow-sm">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    Last 7 days
                </button>
                <button className="flex items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-[12px] font-medium text-zinc-700 shadow-sm">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
                    All Models
                </button>
            </div>

            {/* Prompt Card */}
            <div className="dashboard-card p-5">
                <div className="mb-6">
                    <div className="text-[11.5px] font-medium text-zinc-400 mb-1">Prompt</div>
                    <h1 className="text-[17px] font-bold text-zinc-900 leading-snug tracking-tight">
                        {prompt?.text ?? "Loading..."}
                    </h1>
                </div>
                <div className="grid grid-cols-5 gap-4 border-t border-zinc-100 pt-4">
                    <div>
                        <div className="text-[11.5px] font-medium text-zinc-400 mb-1">Date added</div>
                        <div className="text-[13px] font-medium text-zinc-800">{prompt ? timeAgo(prompt.last_run_at || new Date().toISOString()) : "—"}</div>
                    </div>
                    <div>
                        <div className="text-[11.5px] font-medium text-zinc-400 mb-1">Topic</div>
                        <div className="text-[13px] font-medium text-zinc-800">{prompt?.topic || "Uncategorized"}</div>
                    </div>
                    <div>
                        <div className="text-[11.5px] font-medium text-zinc-400 mb-1">AI demand</div>
                        {prompt ? (
                            <ObservedDemandIndicator
                                label={prompt.observed_demand_label}
                                score={prompt.observed_demand_score}
                                runs={prompt.observed_runs_30d}
                            />
                        ) : <span className="text-[13px] text-zinc-400">Loading...</span>}
                    </div>
                    <div>
                        <div className="text-[11.5px] font-medium text-zinc-400 mb-1">Location</div>
                        <div className="flex items-center gap-1.5 text-[13px] font-medium text-zinc-800">
                            <span>🇺🇸</span> US
                        </div>
                    </div>
                    <div>
                        <div className="text-[11.5px] font-medium text-zinc-400 mb-1.5">Status</div>
                        <div className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-600 border border-emerald-100/50">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"/>
                            Active
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Row 1: chart 50% | brands 50% ── */}
            <div className="grid grid-cols-2 gap-3">
                {/* chart card */}
                <div className="dashboard-card">
                    <div className="dashboard-card-header">
                        <div className="flex items-center gap-1.5">
                            <svg className="text-zinc-400" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                            <span className="dashboard-card-title">Visibility</span>
                            <span className="dashboard-card-subtitle">Percentage of chats mentioning each brand</span>
                        </div>
                        <button className="premium-action">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                            Export
                        </button>
                    </div>
                    <div className="px-4 pb-4 pt-3">
                        {tsLoad ? <Sk cls="h-[210px] w-full"/> : <VisibilityChart data={ts} height={210}/>}
                    </div>
                </div>

                {/* brands card */}
                <div className="dashboard-card">
                    <div className="dashboard-card-header">
                        <div className="flex items-center gap-1.5">
                            <svg className="text-zinc-400" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
                            <span className="dashboard-card-title">Brands</span>
                            <span className="dashboard-card-subtitle">Top brands across LLMs for your prompt</span>
                        </div>
                        <button className="text-[11px] font-medium text-zinc-500 hover:text-zinc-800 transition-colors flex items-center gap-1">
                            Show All
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17l9.2-9.2M17 17V7H7"/></svg>
                        </button>
                    </div>
                    {isLoading ? (
                        <div className="flex flex-col gap-2 p-4">
                            {[...Array(5)].map((_, i) => <div key={i} className="flex items-center gap-2"><Sk cls="h-3 w-4"/><Sk cls="h-[18px] w-[18px] rounded-[3px]"/><Sk cls="h-3 flex-1"/><Sk cls="h-3 w-8"/></div>)}
                        </div>
                    ) : (
                        <div className="peec-grid-table">
                            <div className="peec-grid-header grid h-10 items-center bg-slate-50/90" style={{ gridTemplateColumns: "44px 36px 1fr 96px 104px 94px" }}>
                                <span className="justify-center text-[10px] font-semibold uppercase tracking-wide text-zinc-400">#</span>
                                <span/>
                                <span className="px-3 text-[10px] font-semibold uppercase tracking-wide text-zinc-400">Brand</span>
                                <span className="justify-end px-3 text-right text-[10px] font-semibold uppercase tracking-wide text-zinc-400">Visibility</span>
                                <span className="justify-end px-3 text-right text-[10px] font-semibold uppercase tracking-wide text-zinc-400">Sentiment</span>
                                <span className="justify-end px-3 text-right text-[10px] font-semibold uppercase tracking-wide text-zinc-400">Position</span>
                            </div>
                            {allBrands.map((b, i) => (
                                <div key={b.name}
                                    className={`peec-grid-row grid h-[48px] items-center ${i % 2 === 0 ? even : odd}`}
                                    style={{ gridTemplateColumns: "44px 36px 1fr 96px 104px 94px" }}
                                >
                                    <span className="justify-center text-[11px] tabular-nums text-zinc-400">{i + 1}</span>
                                    <span className="justify-center"><Avatar name={b.name} url={b.url}/></span>
                                    <span className="truncate px-3 text-[12.5px] font-semibold text-zinc-700">{b.name}</span>
                                    <span className="justify-end px-3 text-right text-[12.5px] font-bold tabular-nums text-zinc-800">
                                        <span className="text-zinc-300 font-normal mr-2">—</span>
                                        {b.vis.toFixed(0)}%
                                    </span>
                                    <span className="justify-end px-3 text-right text-[12.5px] font-medium tabular-nums text-zinc-600">
                                        {b.sent != null ? (
                                            <div className="flex items-center justify-end gap-1.5">
                                                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={b.sent > 60 ? "text-emerald-500" : b.sent < 40 ? "text-red-500" : "text-amber-500"}><path d="M12 19V5M5 12l7-7 7 7"/></svg>
                                                {b.sent.toFixed(0)} <span className="text-zinc-300">|</span> 42
                                            </div>
                                        ) : "—"}
                                    </span>
                                    <span className="justify-end px-3 text-right text-[12.5px] font-medium tabular-nums text-zinc-600">
                                        {b.pos != null ? (
                                            <div className="flex items-center justify-end gap-1.5">
                                                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={b.pos < 3 ? "text-emerald-500" : b.pos > 7 ? "text-red-500" : "text-amber-500"}><path d="M12 5v14M5 12l7-7 7 7"/></svg>
                                                {b.pos.toFixed(1)} <span className="text-zinc-300">|</span> 3.1
                                            </div>
                                        ) : "—"}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Row 2: Top Sources ── */}
            <div className="dashboard-card">
                <div className="dashboard-card-header justify-start">
                    <svg className="text-zinc-400" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                    <span className="dashboard-card-title">Top Sources</span>
                    <span className="dashboard-card-subtitle">Sources across active models</span>
                </div>
                {isLoading ? (
                    <div className="flex items-center justify-center p-8 text-[13px] text-zinc-400">Loading sources...</div>
                ) : topSrc.length === 0 ? (
                    <div className="flex items-center justify-center p-8 text-[13px] text-zinc-400">No sources found for this prompt.</div>
                ) : (
                    <table className="peec-table w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-200/80 bg-slate-50/90">
                                <th className="px-4 py-2 text-[9px] font-semibold uppercase tracking-wide text-zinc-400">Domain</th>
                                <th className="px-3 py-2 text-right text-[9px] font-semibold uppercase tracking-wide text-zinc-400">Used</th>
                                <th className="px-3 py-2 text-right text-[9px] font-semibold uppercase tracking-wide text-zinc-400">Avg. Citations</th>
                                <th className="px-4 py-2 text-right text-[9px] font-semibold uppercase tracking-wide text-zinc-400">Type</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topSrc.map((s, i) => (
                                <tr key={i} className={`${i % 2 === 0 ? even : odd} transition-colors`}>
                                    <td className="px-4 py-2.5">
                                        <div className="flex items-center gap-2">
                                            <Fav domain={s.domain}/>
                                            <span className="truncate text-[13px] font-semibold text-zinc-700">{s.domain}</span>
                                        </div>
                                    </td>
                                    <td className="px-3 py-2.5 text-right text-[13px] font-bold tabular-nums text-zinc-700">
                                        {(s.usage_percentage ?? 0).toFixed(0)}%
                                    </td>
                                    <td className="px-3 py-2.5 text-right text-[13px] font-semibold tabular-nums text-zinc-600">—</td>
                                    <td className="px-4 py-2.5 text-right">
                                        <span className="inline-flex items-center rounded px-1.5 py-[2px] text-[10.5px] font-semibold leading-none bg-zinc-100 text-zinc-500 border border-zinc-200">
                                            {s.source_type}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

        </div>
    )
}
