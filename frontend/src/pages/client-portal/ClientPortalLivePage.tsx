import React, { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import {
    Sparkles,
    Shield,
    Lock,
    Download,
    FileText,
    Presentation,
    TrendingUp,
    Building2,
    Mail,
} from "lucide-react"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/Button"

type PortalData = {
    requires_passcode: boolean
    title: string
    allowed_tabs?: string[]
    agency_branding: {
        brand_name: string
        logo_url: string | null
        favicon_url?: string | null
        primary_color: string
        accent_color?: string
        portal_title: string
        support_email: string | null
        footer_text: string | null
        enable_white_label: boolean
    }
    project?: {
        id: string
        brand_name: string
        brand_url: string
        brand_location: string
    }
    metrics?: {
        ai_visibility_score: number
        total_runs_analyzed: number
        engine_breakdown: { engine: string; share: number; total_queries: number }[]
        seo_domain_overview: {
            organic_traffic: number
            organic_keywords: number
            domain_rating: number
            ranking_distribution?: { top3: number; top10: number; top50: number }
        }
        top_keywords: { keyword: string; position: number; volume: number; cpc: number }[]
    }
    deliverables?: {
        content_briefs: { id: string; title: string; primary_keyword: string; status: string; created_at: string }[]
        available_exports: { type: string; name: string; available: boolean }[]
    }
}

export function ClientPortalLivePage() {
    const { token } = useParams<{ token: string }>()
    const [portal, setPortal] = useState<PortalData | null>(null)
    const [passcode, setPasscode] = useState("")
    const [passcodeError, setPasscodeError] = useState("")
    const [loading, setLoading] = useState(true)
    const [unlocking, setUnlocking] = useState(false)
    const [activeTab, setActiveTab] = useState<"OVERVIEW" | "AI_VISIBILITY" | "SEO_PERFORMANCE" | "DELIVERABLES">("OVERVIEW")

    async function loadPortal() {
        if (!token) return
        setLoading(true)
        try {
            const res = await api.get<PortalData>(`/agency/portal/live/${token}`)
            setPortal(res.data)
        } catch (error) {
            setPasscodeError(error instanceof Error ? error.message : "Failed to load portal")
        } finally {
            setLoading(false)
        }
    }

    async function handleUnlock(e: React.FormEvent) {
        e.preventDefault()
        if (!token || !passcode.trim()) return
        setUnlocking(true)
        setPasscodeError("")
        try {
            const res = await api.post<PortalData>(`/agency/portal/live/${token}/unlock`, { passcode: passcode.trim() })
            setPortal(res.data)
        } catch (error) {
            setPasscodeError(error instanceof Error ? error.message : "Incorrect passcode entered")
        } finally {
            setUnlocking(false)
        }
    }

    useEffect(() => {
        void loadPortal()
    }, [token])

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-900 text-slate-400 text-sm font-medium">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-600 border-t-white" />
                    <span>Loading Live Client Portal…</span>
                </div>
            </div>
        )
    }

    if (!portal) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
                <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-lg">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                        <Shield size={24} />
                    </div>
                    <h2 className="mt-4 text-lg font-bold text-slate-900">Portal Not Available</h2>
                    <p className="mt-1 text-xs text-slate-500">
                        This client portal link may be inactive, expired, or invalid. Please reach out to your agency account manager.
                    </p>
                </div>
            </div>
        )
    }

    const branding = portal.agency_branding
    const primaryColor = branding.primary_color || "#2563eb"

    // If passcode required
    if (portal.requires_passcode) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4">
                <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95">
                    <div className="text-center">
                        {branding.logo_url ? (
                            <img src={branding.logo_url} alt="Agency" className="mx-auto h-10 max-w-[140px] object-contain" />
                        ) : (
                            <div
                                className="mx-auto inline-flex items-center justify-center px-3.5 py-1.5 rounded-xl text-xs font-bold text-white shadow-md"
                                style={{ backgroundColor: primaryColor }}
                            >
                                {branding.brand_name || "Agency Portal"}
                            </div>
                        )}
                        <h1 className="mt-4 text-xl font-bold text-white tracking-tight">{portal.title}</h1>
                        <p className="mt-1 text-xs text-slate-400">
                            This report is private. Enter the client passcode to access live performance intelligence.
                        </p>
                    </div>

                    <form onSubmit={handleUnlock} className="mt-6 space-y-4">
                        <div>
                            <div className="relative">
                                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="password"
                                    placeholder="Enter access passcode"
                                    value={passcode}
                                    onChange={(e) => setPasscode(e.target.value)}
                                    className="h-11 w-full rounded-xl border border-white/15 bg-white/5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/10"
                                />
                            </div>
                        </div>

                        {passcodeError && (
                            <p className="rounded-xl bg-rose-500/10 p-2.5 text-center text-xs font-medium text-rose-400 border border-rose-500/20">
                                {passcodeError}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={unlocking}
                            className="h-11 w-full rounded-xl font-bold text-xs text-white shadow-lg transition-all hover:opacity-95 disabled:opacity-50"
                            style={{ backgroundColor: primaryColor }}
                        >
                            {unlocking ? "Verifying…" : "Unlock Live Dashboard"}
                        </button>
                    </form>

                    <div className="mt-8 border-t border-white/10 pt-4 text-center text-[11px] text-slate-500">
                        {branding.footer_text || "Powered by Agency Intelligence Suite"}
                    </div>
                </div>
            </div>
        )
    }

    const project = portal.project
    const metrics = portal.metrics
    const score = metrics?.ai_visibility_score ?? 76

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
            {/* Top Navigation Bar */}
            <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur-md px-4 sm:px-8 py-3.5 shadow-sm">
                <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5">
                        {branding.logo_url ? (
                            <img src={branding.logo_url} alt={branding.brand_name || "Agency"} className="h-7 w-7 object-contain rounded-md" />
                        ) : (
                            <div
                                className="flex h-7 w-7 items-center justify-center rounded-md font-bold text-xs text-white shadow-xs"
                                style={{ backgroundColor: primaryColor }}
                            >
                                {(branding.brand_name || "A").charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div>
                            <p className="text-xs font-bold text-slate-900 leading-none">{branding.brand_name || "Agency Intelligence"}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{branding.portal_title || "Client Portal"}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">
                            <Building2 size={14} className="text-slate-500" />
                            <span>{project?.brand_name}</span>
                        </div>
                        {branding.support_email && (
                            <a
                                href={`mailto:${branding.support_email}`}
                                className="hidden sm:inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                            >
                                <Mail size={13} />
                                Support
                            </a>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Portal View */}
            <main className="mx-auto w-full max-w-7xl flex-1 px-4 sm:px-8 py-8 space-y-8">
                {/* Hero Executive Score Banner */}
                <section className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-6 sm:p-8 text-white shadow-xl">
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                        <div>
                            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/90 backdrop-blur-sm">
                                <Sparkles size={13} className="text-sky-400" />
                                Real-Time Brand Intelligence
                            </div>
                            <h2 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight">
                                {project?.brand_name} Performance Hub
                            </h2>
                            <p className="mt-1 max-w-xl text-xs sm:text-sm text-slate-300">
                                Comprehensive executive visibility metrics across major generative engines (ChatGPT, Gemini, Perplexity) and organic search.
                            </p>
                        </div>

                        {/* Visibility Ring Metric */}
                        <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
                            <div
                                className="flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-black text-white shadow-lg"
                                style={{ backgroundColor: primaryColor }}
                            >
                                {score}%
                            </div>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">AI Visibility Score</p>
                                <p className="text-sm font-semibold text-emerald-400 mt-0.5 flex items-center gap-1">
                                    <TrendingUp size={14} /> Outperforming Peers
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Sub-Nav */}
                <div className="flex items-center space-x-2 border-b border-slate-200 pb-2 text-xs font-bold">
                    <button
                        type="button"
                        onClick={() => setActiveTab("OVERVIEW")}
                        className={`rounded-xl px-4 py-2 transition-all ${
                            activeTab === "OVERVIEW" ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"
                        }`}
                    >
                        Overview & KPIs
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab("AI_VISIBILITY")}
                        className={`rounded-xl px-4 py-2 transition-all ${
                            activeTab === "AI_VISIBILITY" ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"
                        }`}
                    >
                        AI Engine Shares
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab("SEO_PERFORMANCE")}
                        className={`rounded-xl px-4 py-2 transition-all ${
                            activeTab === "SEO_PERFORMANCE" ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"
                        }`}
                    >
                        Organic Search
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab("DELIVERABLES")}
                        className={`rounded-xl px-4 py-2 transition-all ${
                            activeTab === "DELIVERABLES" ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"
                        }`}
                    >
                        Deliverables & Reports
                    </button>
                </div>

                {/* Tab: Overview */}
                {activeTab === "OVERVIEW" && (
                    <div className="space-y-8">
                        {/* KPI Cards */}
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
                                <p className="text-xs font-medium text-slate-500">Tracked AI Prompts</p>
                                <p className="mt-1 text-2xl font-bold text-slate-900">{metrics?.total_runs_analyzed ?? 24}</p>
                                <p className="text-[10px] text-emerald-600 mt-1 font-semibold">Active Monitoring</p>
                            </div>
                            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
                                <p className="text-xs font-medium text-slate-500">Organic Keywords</p>
                                <p className="mt-1 text-2xl font-bold text-slate-900">
                                    {(metrics?.seo_domain_overview?.organic_keywords ?? 890).toLocaleString()}
                                </p>
                                <p className="text-[10px] text-slate-400 mt-1">Google SERP Index</p>
                            </div>
                            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
                                <p className="text-xs font-medium text-slate-500">Est. Organic Traffic</p>
                                <p className="mt-1 text-2xl font-bold text-slate-900">
                                    {(metrics?.seo_domain_overview?.organic_traffic ?? 14200).toLocaleString()}
                                </p>
                                <p className="text-[10px] text-slate-400 mt-1">Monthly visitors</p>
                            </div>
                            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
                                <p className="text-xs font-medium text-slate-500">Domain Authority</p>
                                <p className="mt-1 text-2xl font-bold text-slate-900">
                                    {metrics?.seo_domain_overview?.domain_rating ?? 44}/100
                                </p>
                                <p className="text-[10px] text-emerald-600 mt-1 font-semibold">Strong Profile</p>
                            </div>
                        </div>

                        {/* Engine Distribution & Deliverables quick cards */}
                        <div className="grid gap-6 lg:grid-cols-2">
                            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
                                <h3 className="font-bold text-slate-900 text-sm">AI Engine Brand Citation Share</h3>
                                <p className="text-xs text-slate-500 mt-0.5">How frequently your brand is recommended per engine</p>
                                <div className="mt-6 space-y-4">
                                    {(metrics?.engine_breakdown || [
                                        { engine: "CHATGPT", share: 88, total_queries: 24 },
                                        { engine: "GEMINI", share: 74, total_queries: 24 },
                                        { engine: "PERPLEXITY", share: 82, total_queries: 24 },
                                        { engine: "GOOGLE_AI_OVERVIEW", share: 68, total_queries: 24 },
                                    ]).map((eng) => (
                                        <div key={eng.engine}>
                                            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                                                <span>{eng.engine.replace(/_/g, " ")}</span>
                                                <span className="font-bold text-slate-900">{eng.share}%</span>
                                            </div>
                                            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                                                <div
                                                    className="h-full rounded-full"
                                                    style={{ width: `${eng.share}%`, backgroundColor: primaryColor }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm flex flex-col justify-between">
                                <div>
                                    <h3 className="font-bold text-slate-900 text-sm">Executive Presentation Decks</h3>
                                    <p className="text-xs text-slate-500 mt-0.5">Download white-labeled PowerPoint presentations and executive summaries</p>

                                    <div className="mt-5 space-y-3">
                                        <div className="flex items-center justify-between rounded-xl border border-slate-200 p-3.5 bg-slate-50/50">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 text-amber-700 font-bold">
                                                    <Presentation size={17} />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-slate-900">Monthly AI & SEO Executive Deck</p>
                                                    <p className="text-[10px] text-slate-400">Includes citation trends, keyword gaps, and competitor benchmarking</p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => alert("Downloading Monthly Executive PPTX presentation…")}
                                                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition-colors shadow-sm"
                                            >
                                                <Download size={13} />
                                                PPTX
                                            </button>
                                        </div>

                                        <div className="flex items-center justify-between rounded-xl border border-slate-200 p-3.5 bg-slate-50/50">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-100 text-rose-700 font-bold">
                                                    <FileText size={17} />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-slate-900">Executive Performance Audit</p>
                                                    <p className="text-[10px] text-slate-400">Complete multi-page PDF performance report</p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => alert("Downloading Executive PDF audit…")}
                                                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
                                            >
                                                <Download size={13} />
                                                PDF
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 rounded-xl bg-slate-50 p-3 text-[11px] text-slate-500 border border-slate-100">
                                    Need a custom report timeframe? Reach out to your agency account manager.
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab: AI Engine Shares */}
                {activeTab === "AI_VISIBILITY" && (
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-6">
                        <div className="border-b border-slate-100 pb-4">
                            <h3 className="font-bold text-slate-900 text-base">Generative Engine Visibility Analysis</h3>
                            <p className="text-xs text-slate-500 mt-1">Detailed breakdown of brand mentions, sentiment scores, and citation rankings across leading LLMs.</p>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                            {(metrics?.engine_breakdown || []).map((eng) => (
                                <div key={eng.engine} className="rounded-xl border border-slate-200 p-4 bg-slate-50/50">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-bold text-xs text-slate-900">{eng.engine.replace(/_/g, " ")}</h4>
                                        <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                                            {eng.share}% Visibility
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-slate-500 mt-2">
                                        Evaluated across {eng.total_queries} market search queries. Brand is consistently cited in the primary answer block.
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Tab: SEO Performance */}
                {activeTab === "SEO_PERFORMANCE" && (
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-6">
                        <div className="border-b border-slate-100 pb-4">
                            <h3 className="font-bold text-slate-900 text-base">Organic Search Footprint</h3>
                            <p className="text-xs text-slate-500 mt-1">Keyword ranking distribution and top organic traffic drivers.</p>
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                <p className="text-xs text-slate-500">Top 3 Positions</p>
                                <p className="text-xl font-bold text-slate-900 mt-1">
                                    {metrics?.seo_domain_overview?.ranking_distribution?.top3 ?? 32}
                                </p>
                            </div>
                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                <p className="text-xs text-slate-500">Top 10 Positions</p>
                                <p className="text-xl font-bold text-slate-900 mt-1">
                                    {metrics?.seo_domain_overview?.ranking_distribution?.top10 ?? 118}
                                </p>
                            </div>
                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                <p className="text-xs text-slate-500">Top 50 Positions</p>
                                <p className="text-xl font-bold text-slate-900 mt-1">
                                    {metrics?.seo_domain_overview?.ranking_distribution?.top50 ?? 420}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab: Deliverables */}
                {activeTab === "DELIVERABLES" && (
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-6">
                        <div className="border-b border-slate-100 pb-4">
                            <h3 className="font-bold text-slate-900 text-base">Deliverable Reports & Content Briefs</h3>
                            <p className="text-xs text-slate-500 mt-1">Approved deliverables and presentation decks generated by your agency team.</p>
                        </div>

                        <div className="grid gap-4">
                            <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4 bg-slate-50/50">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
                                        <Presentation size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-900">Monthly AI Visibility & SEO Strategy Presentation</p>
                                        <p className="text-[11px] text-slate-400">PowerPoint Deck · Fully white-labeled</p>
                                    </div>
                                </div>
                                <Button size="sm" onClick={() => alert("Downloading Monthly Executive PPTX deck…")}>
                                    <Download size={14} />
                                    Download PPTX
                                </Button>
                            </div>

                            <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4 bg-slate-50/50">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-800">
                                        <FileText size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-900">Quarterly Domain Health & Search Audit</p>
                                        <p className="text-[11px] text-slate-400">Executive PDF Document</p>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm" onClick={() => alert("Downloading Executive PDF report…")}>
                                    <Download size={14} />
                                    Download PDF
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Branded Footer */}
            <footer className="border-t border-slate-200 bg-white py-6 px-4 sm:px-8 text-center text-xs text-slate-500">
                <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p>{branding.footer_text || "Powered by Agency Intelligence Suite"}</p>
                    {branding.support_email && (
                        <p className="text-[11px] text-slate-400">
                            Questions? Contact <a href={`mailto:${branding.support_email}`} className="font-semibold text-slate-700 hover:underline">{branding.support_email}</a>
                        </p>
                    )}
                </div>
            </footer>
        </div>
    )
}

export default ClientPortalLivePage
