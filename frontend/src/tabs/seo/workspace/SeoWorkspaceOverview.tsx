import { useState, useEffect, useCallback } from "react"
import {
    ArrowRight,
    Check,
    ChevronDown,
    Loader2,
    RefreshCw,
    Search,
    TrendingUp,
} from "lucide-react"
import { Link } from "react-router-dom"
import { useProjects } from "@/hooks/useProjects"
import {
    seoStrategyApi,
    type StrategyRun,
    type StrategyTier,
} from "../strategy/seoStrategyApi"
import { SEO_WORKSPACE_MODULES } from "./seoWorkspaceModules"
import "../domain-research/domain-overview.css"

const workflowModules = SEO_WORKSPACE_MODULES.filter(module => module.id !== "overview")

const MARKETS = [
    { countryIsoCode: "US", locationName: "United States", languages: [{ code: "en", name: "English" }] },
    { countryIsoCode: "GB", locationName: "United Kingdom", languages: [{ code: "en", name: "English" }] },
    { countryIsoCode: "IN", locationName: "India", languages: [{ code: "en", name: "English" }, { code: "hi", name: "Hindi" }] },
    { countryIsoCode: "AU", locationName: "Australia", languages: [{ code: "en", name: "English" }] },
    { countryIsoCode: "CA", locationName: "Canada", languages: [{ code: "en", name: "English" }, { code: "fr", name: "French" }] },
    { countryIsoCode: "DE", locationName: "Germany", languages: [{ code: "de", name: "German" }] },
    { countryIsoCode: "AE", locationName: "United Arab Emirates", languages: [{ code: "en", name: "English" }, { code: "ar", name: "Arabic" }] },
    { countryIsoCode: "SG", locationName: "Singapore", languages: [{ code: "en", name: "English" }] },
]

const STRATEGY_TIERS: Array<{ id: StrategyTier; name: string; credits: number; label: string; description: string }> = [
    {
        id: "standard",
        name: "Standard Strategy",
        credits: 100,
        label: "Standard Strategy (100 credits) - Recommended",
        description: "25-page crawl, technical audit, GSC baseline, 50 keywords + competitor gap, backlinks, 6 AI prompts & 90-day roadmap.",
    },
    {
        id: "quick",
        name: "Quick Strategy",
        credits: 40,
        label: "Quick Strategy (40 credits)",
        description: "10-page crawl, technical health score, GSC baseline, top 20 keywords, and quick-win recommendations.",
    },
    {
        id: "deep",
        name: "Deep Strategic Audit",
        credits: 180,
        label: "Deep Strategic Audit (180 credits)",
        description: "50-page deep crawl, 100 keywords, top pages & competitor gap, backlink authority, 8 AI checks, and executive blueprint.",
    },
]

function statusStyle(status: string) {
    if (status === "FOUNDATION") return "border-emerald-200 bg-emerald-50 text-emerald-700"
    if (status === "CONNECT DATA") return "border-sky-200 bg-sky-50 text-sky-700"
    if (status === "PROVIDER NEEDED") return "border-amber-200 bg-amber-50 text-amber-700"
    return "border-violet-200 bg-violet-50 text-violet-700"
}

function priorityStyle(priority: string) {
    if (priority === "CRITICAL" || priority === "HIGH") return "border-rose-200 bg-rose-50 text-rose-700"
    if (priority === "MEDIUM") return "border-amber-200 bg-amber-50 text-amber-700"
    return "border-zinc-200 bg-zinc-50 text-zinc-700"
}

export function SeoWorkspaceOverview() {
    const { selectedProject, isLoading: projectsLoading } = useProjects()
    const projectId = selectedProject?.id ?? null

    const [domain, setDomain] = useState("")
    const [country, setCountry] = useState("US")
    const [selectedTier, setSelectedTier] = useState<StrategyTier>("standard")
    const [servicesInput, setServicesInput] = useState("")
    const [competitorInput, setCompetitorInput] = useState("")
    const [validationError, setValidationError] = useState("")

    const [latestRun, setLatestRun] = useState<StrategyRun | null>(null)
    const [loadingLatest, setLoadingLatest] = useState(false)
    const [starting, setStarting] = useState(false)
    const [startError, setStartError] = useState<string | null>(null)
    const [approvingId, setApprovingId] = useState<string | null>(null)
    const [activePlanTab, setActivePlanTab] = useState<"days_1_30" | "days_31_60" | "days_61_90">("days_1_30")

    // Sync project default domain & country
    useEffect(() => {
        if (selectedProject?.brand_url) {
            const cleanUrl = selectedProject.brand_url.replace(/^https?:\/\//i, "").replace(/^www\./i, "").split("/")[0]
            setDomain(cleanUrl)
        }
        if (selectedProject?.brand_location) {
            setCountry(selectedProject.brand_location)
        }
    }, [selectedProject])

    const loadLatestRun = useCallback(async () => {
        if (!projectId) return
        try {
            const run = await seoStrategyApi.getLatestStrategyRun(projectId)
            setLatestRun(run)
        } catch (err) {
            console.error("Failed to load strategy run", err)
        }
    }, [projectId])

    useEffect(() => {
        if (!projectId) return
        setLoadingLatest(true)
        loadLatestRun().finally(() => setLoadingLatest(false))
    }, [projectId, loadLatestRun])

    // Poll if run is currently active
    useEffect(() => {
        if (!latestRun || (latestRun.status !== "RUNNING" && latestRun.status !== "WAITING_AI" && latestRun.status !== "QUEUED")) {
            return
        }

        const interval = setInterval(async () => {
            if (!latestRun?.id) return
            try {
                const refreshed = await seoStrategyApi.getStrategyRun(latestRun.id)
                setLatestRun(refreshed)
            } catch (err) {
                console.error("Polling error", err)
            }
        }, 2500)

        return () => clearInterval(interval)
    }, [latestRun])

    const handleStartRun = async () => {
        if (!projectId || starting) return
        const normalized = domain.trim().replace(/^https?:\/\//i, "").replace(/^www\./i, "").split("/")[0]
        if (!normalized) {
            setValidationError("Enter a valid domain, for example example.com")
            return
        }
        setValidationError("")
        setStarting(true)
        setStartError(null)

        const services = servicesInput.split(",").map(s => s.trim()).filter(Boolean)
        const competitorDomains = competitorInput.split(",").map(s => s.trim().replace(/^https?:\/\//, "")).filter(Boolean)

        try {
            const result = await seoStrategyApi.startStrategyRun(projectId, {
                tier: selectedTier,
                country: country || "US",
                services: services.length ? services : undefined,
                competitor_domains: competitorDomains.length ? competitorDomains : undefined,
            })
            // Fetch newly started run
            const run = await seoStrategyApi.getStrategyRun(result.run_id)
            setLatestRun(run)
        } catch (err: any) {
            setStartError(err?.response?.data?.error || err?.message || "Failed to start strategy audit")
        } finally {
            setStarting(false)
        }
    }

    const handleApprove = async (recId: string) => {
        setApprovingId(recId)
        try {
            const updated = await seoStrategyApi.approveRecommendation(recId)
            setLatestRun(prev => {
                if (!prev) return null
                return {
                    ...prev,
                    recommendations: prev.recommendations.map(r => r.id === recId ? updated : r),
                }
            })
        } catch (err) {
            console.error("Failed to approve recommendation", err)
        } finally {
            setApprovingId(null)
        }
    }

    const handleReject = async (recId: string) => {
        setApprovingId(recId)
        try {
            const updated = await seoStrategyApi.rejectRecommendation(recId)
            setLatestRun(prev => {
                if (!prev) return null
                return {
                    ...prev,
                    recommendations: prev.recommendations.map(r => r.id === recId ? updated : r),
                }
            })
        } catch (err) {
            console.error("Failed to reject recommendation", err)
        } finally {
            setApprovingId(null)
        }
    }

    const isRunning = latestRun?.status === "RUNNING" || latestRun?.status === "WAITING_AI" || latestRun?.status === "QUEUED"
    const currentTierConfig = STRATEGY_TIERS.find(t => t.id === selectedTier) ?? STRATEGY_TIERS[0]
    const foundationCount = workflowModules.filter(module => module.status === "FOUNDATION").length

    if (projectsLoading) {
        return (
            <div className="domain-overview-shell font-sans">
                <main className="domain-overview-page domain-search-page">
                    <div className="dashboard-card flex h-36 items-center justify-center text-xs font-semibold text-zinc-500">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin text-amber-600" />
                        Loading SEO workspace…
                    </div>
                </main>
            </div>
        )
    }

    return (
        <div className="domain-overview-shell font-sans">
            <main className="domain-overview-page domain-search-page">
                {/* TOP STRATEGY LAUNCHER CARD */}
                <section className="dashboard-card domain-search-card">
                    <div className="domain-search-card-header">
                        <div className="min-w-0">
                            <span className="domain-search-eyebrow">ORGANIC RESEARCH & STRATEGY</span>
                            <h1>SEO workspace overview</h1>
                            <p>
                                Run an autonomous AI strategy audit, prioritize growth actions, and navigate all search intelligence tools.
                            </p>
                        </div>
                    </div>

                    <div className="domain-search-card-body">
                        <label className="domain-field-label">ENTER A DOMAIN</label>
                        <div className="domain-search-input-row">
                            <div className={`domain-search-input-wrap ${validationError ? "has-error" : ""}`}>
                                <Search className="h-4 w-4" />
                                <input
                                    type="text"
                                    value={domain}
                                    onChange={event => setDomain(event.target.value)}
                                    onKeyDown={event => event.key === "Enter" && handleStartRun()}
                                    placeholder="example.com"
                                    aria-label="Domain"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={handleStartRun}
                                disabled={!domain.trim() || isRunning || starting}
                                className="domain-search-submit"
                            >
                                {starting ? (
                                    <>
                                        <span className="domain-search-spinner" />
                                        Starting…
                                    </>
                                ) : isRunning ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin text-amber-300" />
                                        Audit in progress ({latestRun?.progress_percent || 15}%)
                                    </>
                                ) : latestRun ? (
                                    <>
                                        <RefreshCw className="h-4 w-4" />
                                        Re-run strategy ({currentTierConfig.credits} cr)
                                    </>
                                ) : (
                                    <>
                                        Launch AI strategy ({currentTierConfig.credits} cr)
                                        <ArrowRight className="h-4 w-4" />
                                    </>
                                )}
                            </button>
                        </div>
                        {validationError && <p className="domain-search-validation">{validationError}</p>}
                        {startError && <p className="domain-search-validation mt-2 text-rose-600">{startError}</p>}

                        {/* CONFIGURATION FILTERS */}
                        <div className="domain-search-filter-panel has-history">
                            {/* COUNTRY SELECT */}
                            <div>
                                <label className="domain-field-label">COUNTRY</label>
                                <div className="domain-select-wrap">
                                    <select
                                        value={country}
                                        onChange={e => setCountry(e.target.value)}
                                        className="domain-select"
                                        aria-label="Country"
                                    >
                                        {MARKETS.map(market => (
                                            <option key={market.countryIsoCode} value={market.countryIsoCode}>
                                                {market.locationName} ({market.countryIsoCode})
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="domain-select-chevron" />
                                </div>
                            </div>

                            {/* TIER SELECT */}
                            <div>
                                <label className="domain-field-label">STRATEGY DEPTH</label>
                                <div className="domain-select-wrap">
                                    <select
                                        value={selectedTier}
                                        onChange={e => setSelectedTier(e.target.value as StrategyTier)}
                                        className="domain-select"
                                        aria-label="Strategy Tier"
                                    >
                                        {STRATEGY_TIERS.map(tier => (
                                            <option key={tier.id} value={tier.id}>
                                                {tier.label}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="domain-select-chevron" />
                                </div>
                            </div>

                            {/* SERVICES INPUT */}
                            <div>
                                <label className="domain-field-label">SERVICES / TOPICS</label>
                                <input
                                    type="text"
                                    value={servicesInput}
                                    onChange={e => setServicesInput(e.target.value)}
                                    placeholder="e.g. SEO, Growth, SaaS"
                                    className="domain-select px-3 text-xs"
                                    aria-label="Services"
                                />
                            </div>

                            {/* COMPETITORS INPUT */}
                            <div>
                                <label className="domain-field-label">COMPETITORS (OPTIONAL)</label>
                                <input
                                    type="text"
                                    value={competitorInput}
                                    onChange={e => setCompetitorInput(e.target.value)}
                                    placeholder="competitor1.com, competitor2.com"
                                    className="domain-select px-3 text-xs"
                                    aria-label="Competitors"
                                />
                            </div>
                        </div>

                        {/* FOOTER STATUS */}
                        <div className="domain-search-footer flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="domain-status-dot" />
                                <span className="domain-search-ready">
                                    {isRunning
                                        ? "Concurrent strategy audit is running in background"
                                        : "AI Strategy Agent ready"}
                                </span>
                                <span>• Deducts {currentTierConfig.credits} credits upon execution</span>
                            </div>

                            {latestRun?.completed_at && (
                                <span className="text-[11px] text-zinc-500">
                                    Last generated {new Date(latestRun.completed_at).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                                </span>
                            )}
                        </div>
                    </div>
                </section>

                {/* LIVE AUDIT PROGRESS CARD (WHEN RUNNING) */}
                {isRunning && latestRun && (
                    <section className="dashboard-card mb-3 p-5">
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-4">
                            <div className="flex items-center gap-3">
                                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                </span>
                                <div>
                                    <h3 className="text-[13px] font-bold text-zinc-900">
                                        Executing Parallel Strategy Audit: <span className="font-normal text-amber-700">{latestRun.current_step}</span>
                                    </h3>
                                    <p className="text-[10.5px] text-zinc-500">
                                        Crawling website, assessing technical health, discovering keyword gaps, and checking AI visibility concurrently.
                                    </p>
                                </div>
                            </div>
                            <span className="rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-800">
                                {latestRun.progress_percent}% completed
                            </span>
                        </div>

                        <div className="mt-3.5 h-1.5 overflow-hidden rounded-full bg-zinc-100">
                            <div
                                className="h-full rounded-full bg-amber-500 transition-all duration-500"
                                style={{ width: `${Math.max(8, latestRun.progress_percent)}%` }}
                            />
                        </div>

                        <div className="mt-3.5 flex flex-wrap gap-1.5">
                            {latestRun.steps?.map(step => (
                                <span
                                    key={step.step_key}
                                    className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[9px] font-bold ${
                                        step.status === "COMPLETED" ? "border-emerald-200 bg-emerald-50 text-emerald-700" :
                                        step.status === "RUNNING" ? "border-amber-300 bg-amber-50 text-amber-800 animate-pulse" :
                                        step.status === "FAILED" ? "border-rose-200 bg-rose-50 text-rose-700" :
                                        "border-zinc-200 bg-zinc-50 text-zinc-400"
                                    }`}
                                >
                                    {step.status === "COMPLETED" && <Check className="h-2.5 w-2.5" />}
                                    {step.status === "RUNNING" && <Loader2 className="h-2.5 w-2.5 animate-spin" />}
                                    {step.step_key.replace(/_/g, " ")}
                                </span>
                            ))}
                        </div>
                    </section>
                )}

                {/* STRATEGY RESULTS DASHBOARD (WHEN COMPLETED) */}
                {latestRun && latestRun.status === "COMPLETED" ? (
                    <div className="grid gap-3 mb-3">
                        {/* KPI STRIP */}
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                            <div className="dashboard-card p-4">
                                <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">Technical Health</p>
                                <p className="mt-1 text-2xl font-black text-zinc-900">
                                    {latestRun.summary?.technical_score ?? 85}<span className="text-xs text-zinc-400">/100</span>
                                </p>
                            </div>
                            <div className="dashboard-card p-4">
                                <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">Crawled Pages</p>
                                <p className="mt-1 text-2xl font-black text-zinc-900">{latestRun.summary?.crawled_pages ?? 0}</p>
                            </div>
                            <div className="dashboard-card p-4">
                                <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">AI Search Mention Rate</p>
                                <p className="mt-1 text-2xl font-black text-amber-600">
                                    {latestRun.summary?.ai_visibility?.visibility_percent != null
                                        ? `${latestRun.summary.ai_visibility.visibility_percent}%`
                                        : "N/A"}
                                </p>
                            </div>
                            <div className="dashboard-card p-4">
                                <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">Action Items</p>
                                <p className="mt-1 text-2xl font-black text-emerald-600">{latestRun.recommendations.length}</p>
                            </div>
                        </div>

                        {/* 90-DAY STRATEGY PLAN */}
                        {latestRun.summary?.plan && (
                            <section className="dashboard-card">
                                <div className="dashboard-card-header flex flex-wrap items-center justify-between gap-3">
                                    <div>
                                        <span className="domain-search-eyebrow">ROADMAP</span>
                                        <h2 className="dashboard-card-title">90-Day Execution Action Blueprint</h2>
                                        <p className="dashboard-card-subtitle">Prioritized milestones for technical fixes, content expansion, and authority building.</p>
                                    </div>

                                    <div className="flex gap-1 rounded-lg border border-zinc-200 bg-zinc-50 p-0.5">
                                        {(["days_1_30", "days_31_60", "days_61_90"] as const).map(tab => (
                                            <button
                                                key={tab}
                                                type="button"
                                                onClick={() => setActivePlanTab(tab)}
                                                className={`rounded px-3 py-1 text-[10.5px] font-bold transition ${
                                                    activePlanTab === tab
                                                        ? "bg-white text-zinc-950 shadow-sm"
                                                        : "text-zinc-500 hover:text-zinc-800"
                                                }`}
                                            >
                                                {tab === "days_1_30" ? "Days 1–30" : tab === "days_31_60" ? "Days 31–60" : "Days 61–90"}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="p-4 grid gap-2">
                                    {latestRun.summary.plan[activePlanTab]?.map((item, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-start gap-3 rounded-lg border border-zinc-100 bg-zinc-50/50 p-3 hover:bg-zinc-50"
                                        >
                                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-amber-100 text-[10px] font-black text-amber-800">
                                                {idx + 1}
                                            </span>
                                            <p className="text-[12px] font-medium text-zinc-800 leading-relaxed">{item}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* RECOMMENDATIONS QUEUE */}
                        {latestRun.recommendations?.length > 0 && (
                            <section className="dashboard-card">
                                <div className="dashboard-card-header">
                                    <span className="domain-search-eyebrow">ACTION QUEUE</span>
                                    <h2 className="dashboard-card-title">
                                        Prioritized Recommendations ({latestRun.recommendations.length})
                                    </h2>
                                    <p className="dashboard-card-subtitle">Approve items to send them to the SEO task implementation queue.</p>
                                </div>

                                <div className="p-4 grid gap-3 sm:grid-cols-2">
                                    {latestRun.recommendations.map(rec => (
                                        <div
                                            key={rec.id}
                                            className="flex flex-col justify-between rounded-lg border border-zinc-200 p-3.5 transition hover:border-zinc-300 bg-white"
                                        >
                                            <div>
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className={`rounded px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider ${priorityStyle(rec.priority)}`}>
                                                        {rec.priority}
                                                    </span>
                                                    <span className="text-[9.5px] font-medium text-zinc-400">
                                                        Impact: <strong className="text-zinc-700">{rec.impact_score}/100</strong>
                                                    </span>
                                                </div>

                                                <h3 className="mt-2 text-[12.5px] font-bold text-zinc-900">{rec.title}</h3>
                                                <p className="mt-1 text-[11px] text-zinc-600 leading-relaxed">{rec.description}</p>

                                                {rec.success_metric && (
                                                    <div className="mt-2 rounded bg-amber-50/60 border border-amber-200/50 px-2 py-1 text-[9.5px] font-medium text-amber-800">
                                                        🎯 <strong>Success Metric:</strong> {rec.success_metric}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="mt-3 flex items-center justify-between border-t border-zinc-100 pt-2.5">
                                                <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">
                                                    {rec.category}
                                                </span>

                                                {rec.approval_status === "APPROVED" ? (
                                                    <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[9.5px] font-bold text-emerald-700 border border-emerald-200">
                                                        <Check className="h-3 w-3" /> Approved
                                                    </span>
                                                ) : rec.approval_status === "REJECTED" ? (
                                                    <span className="inline-flex items-center gap-1 rounded bg-zinc-100 px-2 py-0.5 text-[9.5px] font-medium text-zinc-500">
                                                        Dismissed
                                                    </span>
                                                ) : (
                                                    <div className="flex items-center gap-1.5">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleReject(rec.id)}
                                                            disabled={approvingId === rec.id}
                                                            className="rounded border border-zinc-200 bg-white px-2 py-1 text-[9.5px] font-bold text-zinc-600 hover:bg-zinc-50"
                                                        >
                                                            Dismiss
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleApprove(rec.id)}
                                                            disabled={approvingId === rec.id}
                                                            className="inline-flex items-center gap-1 rounded bg-zinc-900 px-2.5 py-1 text-[9.5px] font-bold text-white hover:bg-zinc-800"
                                                        >
                                                            {approvingId === rec.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                                                            Approve
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                ) : loadingLatest ? (
                    <section className="dashboard-card mb-3 p-12 text-center">
                        <Loader2 className="mx-auto mb-2 h-6 w-6 animate-spin text-amber-600" />
                        <p className="text-xs font-semibold text-zinc-500">Checking latest strategy status…</p>
                    </section>
                ) : (
                    /* EMPTY STATE MATCHING IMAGE 2 */
                    <section className="dashboard-card mb-3 p-12 text-center">
                        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-amber-200 bg-amber-50 text-amber-600">
                            <TrendingUp className="h-5 w-5" />
                        </div>
                        <h2 className="text-[14px] font-bold text-zinc-900">No strategy audit generated yet</h2>
                        <p className="mx-auto mt-1 max-w-md text-[11px] text-zinc-500 leading-relaxed">
                            Run an AI strategy audit above to crawl your website, assess technical health, discover competitor gaps, and generate a 90-day SEO action plan.
                        </p>
                    </section>
                )}

                {/* SEO WORKFLOW MODULES GRID (MATCHING APPLICATION STYLE) */}
                <section className="dashboard-card">
                    <div className="dashboard-card-header flex items-center justify-between">
                        <div>
                            <span className="domain-search-eyebrow">TOOLKIT</span>
                            <h2 className="dashboard-card-title">SEO Workflow Modules</h2>
                            <p className="dashboard-card-subtitle">Dedicated deep-dive workspaces for each search channel.</p>
                        </div>
                        <span className="domain-count-badge">
                            {foundationCount}/{workflowModules.length} Modules Connected
                        </span>
                    </div>

                    <div className="grid border-t border-zinc-100 sm:grid-cols-2 xl:grid-cols-3">
                        {workflowModules.map((module, index) => {
                            const Icon = module.icon
                            return (
                                <Link
                                    key={module.id}
                                    to={module.path}
                                    className={`group min-w-0 p-5 transition hover:bg-[#fffbeb] ${
                                        index > 0 ? "border-t border-zinc-100 sm:border-l" : ""
                                    } ${index % 2 === 0 ? "sm:border-l-0 xl:border-l" : ""} ${
                                        index < 3 ? "xl:border-t-0" : ""
                                    } ${index % 3 === 0 ? "xl:border-l-0" : ""}`}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-700">
                                            <Icon className="h-4 w-4 text-amber-600" />
                                        </span>
                                        <span className={`rounded-full border px-2 py-0.5 text-[7.5px] font-black tracking-[0.08em] ${statusStyle(module.status)}`}>
                                            {module.status}
                                        </span>
                                    </div>
                                    <h3 className="mt-3 text-[13px] font-bold text-zinc-900">{module.title}</h3>
                                    <p className="mt-1 min-h-10 text-[10px] font-normal leading-relaxed text-zinc-500">{module.description}</p>
                                    <div className="mt-3 flex items-center justify-between gap-3 border-t border-zinc-100/80 pt-2.5">
                                        <span className="text-[9.5px] font-bold text-zinc-600 group-hover:text-amber-800">Open workspace</span>
                                        <ArrowRight className="h-3.5 w-3.5 text-zinc-300 transition group-hover:translate-x-0.5 group-hover:text-amber-700" />
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                </section>
            </main>
        </div>
    )
}
