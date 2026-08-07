import { useEffect, useMemo, useState } from "react"
import { ArrowLeft, ExternalLink, Link2 } from "lucide-react"
import { useLocation, useNavigate, useSearchParams } from "react-router-dom"
import { useProjects } from "@/hooks/useProjects"
import { domainResearchApi, type DomainResearchScope } from "../domain-research/api/domainResearchApi"
import type {
    BacklinksOverviewPayload,
    CompetitorsPayload,
    TopPagesPayload,
} from "../domain-research/api/domainResearchTypes"
import { TopPagesWidget } from "../domain-research/components/TopPagesWidget"
import { CompetitorsWidget } from "../domain-research/components/CompetitorsWidget"
import "../domain-research/domain-overview.css"
import type { SeoWorkspaceModule } from "./seoWorkspaceModules"

type CachedReport = {
    pages?: TopPagesPayload
    competitors?: CompetitorsPayload
    backlinks?: BacklinksOverviewPayload
}

export function CachedDomainReportPage({ module }: { module: SeoWorkspaceModule }) {
    const navigate = useNavigate()
    const location = useLocation()
    const [searchParams] = useSearchParams()
    const { selectedProject, isLoading: projectsLoading } = useProjects()
    const [report, setReport] = useState<CachedReport | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [source, setSource] = useState<"saved" | "live">("saved")
    const runLiveOnOpen = Boolean((location.state as { runLive?: boolean } | null)?.runLive)

    const scope = useMemo<DomainResearchScope | null>(() => {
        const domain = searchParams.get("domain")?.trim()
        if (!domain) return null
        return {
            domain,
            country: searchParams.get("country") || "US",
            language_code: searchParams.get("language_code") || "en",
            range: Number(searchParams.get("range") || 6),
        }
    }, [searchParams])

    useEffect(() => {
        const projectId = selectedProject?.id
        if (!scope || !projectId) {
            setLoading(false)
            return
        }

        let active = true
        setLoading(true)
        setError(null)

        async function loadCachedReport() {
            try {
                let next: CachedReport
                const requestedLimit = Number(searchParams.get("limit") || 100)
                if (module.id === "top-pages") {
                    next = { pages: runLiveOnOpen
                        ? await domainResearchApi.refreshTopPages(projectId!, scope!, topPagesLimit(requestedLimit))
                        : await domainResearchApi.getTopPages(projectId!, scope!) }
                } else if (module.id === "organic-competitors") {
                    next = { competitors: runLiveOnOpen
                        ? await domainResearchApi.refreshCompetitors(projectId!, scope!, competitorLimit(requestedLimit))
                        : await domainResearchApi.getCompetitors(projectId!, scope!) }
                } else {
                    next = { backlinks: await domainResearchApi.getBacklinksOverview(projectId!, scope!) }
                }
                if (active) {
                    setReport(next)
                    setSource(runLiveOnOpen ? "live" : "saved")
                }
            } catch (caught: any) {
                if (active) setError(caught?.response?.data?.error || caught?.message || "The cached report could not be opened.")
            } finally {
                if (active) setLoading(false)
            }
        }

        loadCachedReport()
        return () => { active = false }
    }, [module.id, runLiveOnOpen, scope, searchParams, selectedProject?.id])

    if (projectsLoading || loading) return <CachedLoading title={`Opening ${module.title}`} />
    if (!scope) return null

    const overviewUrl = `/seo/domain-research?${searchParams.toString()}`

    return (
        <div className="domain-overview-shell min-h-full">
            <main className="domain-overview-page">
                <ReportHeader module={module} domain={scope.domain} source={source} onBack={() => navigate(module.path)} />

                {error ? <CachedError message={error} onBack={() => navigate(overviewUrl)} /> : (
                    <div className="mt-3 flex flex-col gap-3">
                        {module.id === "top-pages" && report?.pages && <TopPagesWidget data={report.pages} expanded />}
                        {module.id === "organic-competitors" && report?.competitors && <CompetitorsWidget data={report.competitors} expanded />}
                        {module.id === "backlinks" && report?.backlinks && <BacklinksWorkspace data={report.backlinks} />}
                    </div>
                )}
            </main>
        </div>
    )
}

function ReportHeader({ module, domain, source, onBack }: { module: SeoWorkspaceModule; domain: string; source: "saved" | "live"; onBack: () => void }) {
    const Icon = module.icon
    const [logoFailed, setLogoFailed] = useState(false)
    return (
        <header className="domain-module-report-header overflow-hidden border border-zinc-200 bg-white">
            <div className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                    <button type="button" onClick={onBack} aria-label={`Back to ${module.title}`} className="domain-module-back"><ArrowLeft className="h-4 w-4" /></button>
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden border border-zinc-200 bg-white text-amber-700">
                        {!logoFailed ? (
                            <img src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=96`} alt="" className="h-6 w-6 object-contain" onError={() => setLogoFailed(true)} />
                        ) : (
                            <Icon className="h-5 w-5" />
                        )}
                    </span>
                    <div className="min-w-0">
                        <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-amber-700">{module.title}</p>
                        <div className="mt-1 flex min-w-0 items-center gap-2">
                            <h1 className="truncate text-[22px] font-extrabold tracking-[-0.035em] text-zinc-950">{domain}</h1>
                            <a href={`https://${domain}`} target="_blank" rel="noreferrer" aria-label={`Open ${domain}`} className="flex h-7 w-7 shrink-0 items-center justify-center border border-zinc-200 text-zinc-400 transition hover:border-amber-300 hover:bg-amber-50 hover:text-amber-800"><ExternalLink className="h-3.5 w-3.5" /></a>
                        </div>
                        <p className="mt-1 text-[11px] text-zinc-500">{module.description}</p>
                    </div>
                </div>
                <span className="domain-module-source"><span />{source === "live" ? "Fresh analysis" : "Saved report"}</span>
            </div>
        </header>
    )
}

function BacklinksWorkspace({ data }: { data: BacklinksOverviewPayload }) {
    const metrics = [
        ["Authority rank", data.summary.rank],
        ["Backlinks", data.summary.backlinks],
        ["Referring domains", data.summary.referringDomains],
        ["Referring pages", data.summary.referringPages],
        ["Broken links", data.summary.brokenBacklinks],
        ["Spam score", data.summary.backlinksSpamScore],
    ] as const
    return <>
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
            {metrics.map(([label, value]) => <div key={label} className="rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-[0_12px_28px_-28px_rgba(15,23,42,0.6)]"><p className="text-[9px] font-extrabold uppercase tracking-[0.1em] text-slate-400">{label}</p><p className="mt-2 text-[21px] font-extrabold tracking-[-0.03em] tabular-nums text-slate-950">{value == null ? "—" : compact(value)}</p></div>)}
        </section>
        <section className="grid gap-3 xl:grid-cols-2">
            <Panel title="Link acquisition" subtitle="New and lost backlinks in the stored snapshot">
                <div className="grid grid-cols-2 gap-3">
                    <ChangeMetric label="New backlinks" value={data.summary.newBacklinks} positive />
                    <ChangeMetric label="Lost backlinks" value={data.summary.lostBacklinks} />
                    <ChangeMetric label="New referring domains" value={data.summary.newReferringDomains} positive />
                    <ChangeMetric label="Lost referring domains" value={data.summary.lostReferringDomains} />
                </div>
            </Panel>
            <Panel title="Historical snapshots" subtitle="Backlink and referring-domain totals across saved captures">
                {data.trends.length ? <div className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-100">
                    {data.trends.slice(-6).reverse().map(point => <div key={point.date} className="grid grid-cols-3 gap-3 px-3 py-2.5 text-[10.5px]"><span className="font-semibold text-slate-500">{point.date}</span><span className="text-right font-extrabold text-slate-800">{nullable(point.backlinks)} links</span><span className="text-right font-extrabold text-slate-800">{nullable(point.referringDomains)} domains</span></div>)}
                </div> : <div className="flex min-h-32 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-[11px] font-medium text-slate-400">No historical backlink snapshots are stored yet.</div>}
            </Panel>
        </section>
    </>
}

function ChangeMetric({ label, value, positive = false }: { label: string; value: number | null; positive?: boolean }) {
    return <div className={`rounded-xl border px-4 py-4 ${positive ? "border-emerald-100 bg-emerald-50/60" : "border-rose-100 bg-rose-50/60"}`}><p className={`text-[9px] font-extrabold uppercase tracking-[0.1em] ${positive ? "text-emerald-600" : "text-rose-600"}`}>{label}</p><p className={`mt-2 text-[20px] font-extrabold tabular-nums ${positive ? "text-emerald-800" : "text-rose-800"}`}>{positive ? "+" : "-"}{nullable(value)}</p></div>
}

function Panel({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
    return <section className="dashboard-card min-w-0 overflow-hidden"><div className="dashboard-card-header min-h-[64px]"><div><h2 className="dashboard-card-title">{title}</h2><p className="dashboard-card-subtitle mt-0.5">{subtitle}</p></div></div><div className="p-4">{children}</div></section>
}

function CachedLoading({ title }: { title: string }) {
    return <div className="domain-overview-shell min-h-full p-6"><div className="mx-auto max-w-[1480px]"><div className="h-28 animate-pulse rounded-xl border border-slate-200 bg-white" /><div className="mt-3 grid gap-3 md:grid-cols-3">{Array.from({ length: 3 }).map((_, index) => <div key={index} className="h-64 animate-pulse rounded-xl border border-slate-200 bg-white" />)}</div><p className="mt-4 text-center text-[11px] font-bold text-slate-400">{title} from cache…</p></div></div>
}

function CachedError({ message, onBack }: { message: string; onBack: () => void }) {
    return <div className="mt-3 flex min-h-72 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-500"><Link2 className="h-5 w-5" /></span><h2 className="mt-4 text-[15px] font-extrabold text-slate-900">No matching saved report</h2><p className="mt-2 max-w-lg text-[11px] leading-5 text-slate-500">{message} Choose another saved report from Domain Overview.</p><button type="button" onClick={onBack} className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg bg-slate-950 px-4 text-[11px] font-bold text-white"><ArrowLeft className="h-3.5 w-3.5" /> Return to Domain Overview</button></div>
}

function nullable(value: number | null) { return value == null ? "—" : compact(value) }
function compact(value: number) {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
    if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`
    return value.toLocaleString()
}

function topPagesLimit(value: number): 25 | 50 | 100 | 250 | 500 | 1000 {
    return [25, 50, 100, 250, 500, 1000].includes(value) ? value as 25 | 50 | 100 | 250 | 500 | 1000 : 100
}

function competitorLimit(value: number): 25 | 50 | 100 | 250 {
    return [25, 50, 100, 250].includes(value) ? value as 25 | 50 | 100 | 250 : 100
}
