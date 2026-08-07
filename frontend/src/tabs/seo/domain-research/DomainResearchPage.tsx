import { useEffect, useRef, useState } from "react"
import { AlertCircle, RefreshCw } from "lucide-react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { useProjects } from "@/hooks/useProjects"
import { useDomainResearch } from "./hooks/useDomainResearch"
import { DomainSearchForm, type SearchFormValues } from "./components/DomainSearchForm"
import { TrafficTrendChart } from "./components/TrafficTrendChart"
import { TopKeywordsWidget } from "./components/TopKeywordsWidget"
import { TopPagesWidget } from "./components/TopPagesWidget"
import { CompetitorsWidget } from "./components/CompetitorsWidget"
import { PositionDistributionBar } from "./components/PositionDistributionBar"
import { DomainOverviewHeader } from "./components/DomainOverviewHeader"
import { DomainOverviewKpiCards } from "./components/DomainOverviewKpiCards"
import { SeoDomainResearchSnapshotList } from "./components/SeoDomainResearchSnapshotList"
import { SearchIntentWidget } from "./components/SearchIntentWidget"
import { SerpFeaturesWidget } from "./components/SerpFeaturesWidget"
import { domainResearchSurface } from "./domainResearchTokens"
import { TrafficIntelligenceOverview } from "./traffic-intelligence/components/TrafficIntelligenceOverview"
import { exportDomainResearchPptx, exportDomainResearchPdf } from "./export"
import "./domain-overview.css"

// Domain Overview is cache-first. A live provider request only happens when the
// user explicitly presses Refresh inside an opened report.
export function DomainResearchPage() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const { selectedProject, isLoading: projectsLoading } = useProjects()
    const projectId = selectedProject?.id ?? null
    const { analyzeDomain, isLoading, error, data, clearData } = useDomainResearch(projectId)
    const [lastOptions, setLastOptions] = useState<SearchFormValues | null>(null)
    const [isExportingPptx, setIsExportingPptx] = useState(false)
    const [isExportingPdf, setIsExportingPdf] = useState(false)
    const restoredSearchRef = useRef<string | null>(null)

    useEffect(() => {
        if (searchParams.get("domain")?.trim()) return
        restoredSearchRef.current = null
        setLastOptions(null)
        if (data) clearData()
    }, [clearData, data, searchParams])

    useEffect(() => {
        if (!projectId || data) return
        const domain = searchParams.get("domain")?.trim()
        if (!domain) return
        const restoreKey = `${projectId}:${searchParams.toString()}`
        if (restoredSearchRef.current === restoreKey) return
        restoredSearchRef.current = restoreKey
        handleSearch({
            domain,
            country: searchParams.get("country") || "US",
            language_code: searchParams.get("language_code") || "en",
            historyMonths: boundedNumber(searchParams.get("range"), 6, 1, 12),
            keywordLimit: boundedKeywordLimit(searchParams.get("limit")),
        }, false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data, projectId, searchParams])

    if (projectsLoading) return <LoadingState label="Loading workspace" />
    if (!selectedProject || !projectId) return <EmptyState message="Select a project to use Domain Overview." />

    async function handleSearch(values: SearchFormValues, forceRefresh = false) {
        setLastOptions(values)
        navigate(`/seo/domain-research?${reportQuery(values)}`, { replace: true })
        await analyzeDomain({
            domain: values.domain,
            country: values.country,
            language_code: values.language_code,
            range: values.historyMonths,
        }, {
            keywordLimit: values.keywordLimit,
            historyMonths: values.historyMonths,
            forceRefresh,
        })
    }

    const handleSnapshotSelect = (domain: string, country: string, languageCode: string, historyMonths: number) => {
        handleSearch({ domain, country, language_code: languageCode, historyMonths, keywordLimit: 100 }, false)
    }

    const openModule = (path: string) => {
        if (!lastOptions) return
        navigate(`${path}?${reportQuery(lastOptions)}`)
    }

    const handleNewSearch = () => {
        clearData()
        restoredSearchRef.current = null
        navigate("/seo/domain-research", { replace: true })
    }

    const handleExportPptx = async () => {
        if (!data) return
        try {
            setIsExportingPptx(true)
            const brandName = selectedProject?.brand_name || "PromptPulse"
            await exportDomainResearchPptx(brandName, data)
        } catch (err) {
            console.error("Failed to export PPTX:", err)
        } finally {
            setIsExportingPptx(false)
        }
    }

    const handleExportPdf = async () => {
        if (!data) return
        try {
            setIsExportingPdf(true)
            const brandName = selectedProject?.brand_name || "PromptPulse"
            await exportDomainResearchPdf(brandName, data)
        } catch (err) {
            console.error("Failed to export PDF:", err)
        } finally {
            setIsExportingPdf(false)
        }
    }

    if (data) {
        return (
            <div className="domain-overview-shell font-sans">
                <main className="domain-overview-page" data-testid="domain-overview-report">
                    {error && <ErrorBanner message={error} />}

                    <section className="dashboard-card domain-overview-summary-surface">
                        <DomainOverviewHeader
                            overview={data.overview}
                            onRefresh={() => lastOptions && handleSearch(lastOptions, true)}
                            onNewSearch={handleNewSearch}
                            onExportPptx={handleExportPptx}
                            onExportPdf={handleExportPdf}
                            isExportingPptx={isExportingPptx}
                            isExportingPdf={isExportingPdf}
                            isLoading={isLoading}
                            lastOptions={lastOptions}
                        />
                        <DomainOverviewKpiCards overview={data.overview} />
                    </section>

                    <section className="dashboard-card domain-analytics-surface" aria-label="Search performance charts">
                        <div className="domain-analytics-toolbar">
                            <div>
                                <p className="domain-eyebrow">Search performance</p>
                                <h2>Organic visibility and ranking distribution</h2>
                            </div>
                            <p>Monthly estimates from the saved production snapshot</p>
                        </div>
                        <div className="domain-overview-chart-grid">
                        <Panel
                            title="Search traffic and keyword trend"
                            subtitle="Traffic and ranking movement over the selected period"
                        >
                            <TrafficTrendChart data={data.overview} />
                        </Panel>
                        <Panel
                            title="Organic ranking distribution"
                            subtitle="How ranking keywords are distributed across Google positions"
                        >
                            <PositionDistributionBar data={data.overview} />
                        </Panel>
                        </div>
                    </section>

                    <section className="dashboard-card domain-full-report-surface" aria-label="Organic search details">
                        <TopKeywordsWidget
                            data={data.organicKeywords}
                            onViewDetails={() => openModule("/seo/keyword-research")}
                        />

                        <div className="domain-full-report-grid" aria-label="Top pages and organic competitors">
                            <TopPagesWidget
                                data={data.topPages}
                                onViewDetails={() => openModule("/seo/top-pages")}
                            />
                            <CompetitorsWidget
                                data={data.competitors}
                                onViewDetails={() => openModule("/seo/organic-competitors")}
                            />
                        </div>

                        <div className="domain-full-report-grid" aria-label="Search intent and SERP features">
                            <SearchIntentWidget data={data.organicKeywords} />
                            <SerpFeaturesWidget data={data.organicKeywords} />
                        </div>
                    </section>

                    {data.trafficIntelligence && <TrafficIntelligenceOverview data={data.trafficIntelligence} />}

                    <p className="domain-overview-source-note">
                        Saved SEO snapshot · {data.overview.availableHistoryMonths} months available · figures are estimates · detailed SEO sections reuse this report.
                    </p>
                </main>
            </div>
        )
    }

    return (
        <div className="domain-overview-shell font-sans">
            <main className="domain-overview-page domain-search-page" data-testid="domain-search-page">
                <DomainSearchForm
                    onSearch={handleSearch}
                    isLoading={isLoading}
                    eyebrow="Organic research"
                    description="Analyze search visibility, ranking coverage, top pages, and organic competitors."
                    footerTitle="Saved reports open instantly"
                    footerDescription="Enter a domain to open its SEO report, or continue from a saved report below."
                />
                {isLoading && (
                    <div className="domain-inline-status">
                        <RefreshCw className="h-4 w-4 animate-spin text-teal-700" />
                        Opening the newest saved domain snapshot…
                    </div>
                )}
                {error && !isLoading && <ErrorBanner message={error} />}
                {!isLoading && projectId && (
                    <SeoDomainResearchSnapshotList projectId={projectId} onSelectSnapshot={handleSnapshotSelect} />
                )}
            </main>
        </div>
    )
}

function reportQuery(values: SearchFormValues) {
    return new URLSearchParams({
        domain: values.domain,
        country: values.country,
        language_code: values.language_code,
        range: String(values.historyMonths),
        limit: String(values.keywordLimit),
    }).toString()
}

function boundedNumber(raw: string | null, fallback: number, min: number, max: number) {
    const value = Number(raw)
    return Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback
}

function boundedKeywordLimit(raw: string | null): 100 | 250 | 500 | 1000 {
    const value = Number(raw)
    return value === 250 || value === 500 || value === 1000 ? value : 100
}

function Panel({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
    return (
        <section className="domain-analytics-panel min-w-0">
            <div className="domain-analytics-panel-heading">
                <h3>{title}</h3>
                <p>{subtitle}</p>
            </div>
            <div className="domain-analytics-panel-body">{children}</div>
        </section>
    )
}

function ErrorBanner({ message }: { message: string }) {
    const isCreditError = message.toLowerCase().includes("credit") || message.toLowerCase().includes("pay")
    return (
        <div className="domain-error-banner flex items-center justify-between gap-3" role="alert">
            <div className="flex items-center gap-2">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{message}</span>
            </div>
            {isCreditError && (
                <Link
                    to="/billing"
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                >
                    Add Credits
                </Link>
            )}
        </div>
    )
}

function LoadingState({ label }: { label: string }) {
    return (
        <div className="min-h-[520px] bg-slate-50 px-5 py-8">
            <div className="mb-4 h-20 animate-pulse rounded-2xl bg-white shadow-sm ring-1 ring-slate-200" />
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-28 animate-pulse rounded-2xl bg-white shadow-sm ring-1 ring-slate-200" />)}
            </div>
            <p className="mt-5 flex items-center justify-center gap-2 text-sm font-medium text-slate-500">
                <RefreshCw className="h-4 w-4 animate-spin" /> {label}…
            </p>
        </div>
    )
}

function EmptyState({ message }: { message: string }) {
    return (
        <div className="flex min-h-[520px] items-center justify-center bg-slate-50 px-5">
            <div className={`${domainResearchSurface} max-w-md px-8 py-10 text-center`}>
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                    <AlertCircle className="h-5 w-5" />
                </div>
                <p className="mt-4 text-sm font-semibold text-slate-800">No data to show.</p>
                <p className="mt-1 text-xs text-slate-500">{message}</p>
            </div>
        </div>
    )
}
