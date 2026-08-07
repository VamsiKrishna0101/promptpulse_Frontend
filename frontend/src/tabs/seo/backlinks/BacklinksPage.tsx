import { useEffect, useState } from "react"
import {
    ArrowLeft,
    ArrowRight,
    Check,
    ExternalLink,
    FileSearch,
    Link2,
    LoaderCircle,
    RefreshCw,
    Search,
    ShieldCheck,
    Sparkles,
} from "lucide-react"
import { useLocation, useNavigate, useSearchParams } from "react-router-dom"
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts"
import { useProjects } from "@/hooks/useProjects"
import { domainResearchApi } from "../domain-research/api/domainResearchApi"
import type {
    BacklinksReportListItem,
    BacklinksReportPayload,
} from "../domain-research/api/domainResearchTypes"
import "./backlinks.css"

type ReportMode = "normal" | "detailed"
type Scope = "domain" | "page"

export function BacklinksPage() {
    const [searchParams] = useSearchParams()
    const target = searchParams.get("target") || searchParams.get("domain")
    return target ? <BacklinksReport target={target} /> : <BacklinksLauncher />
}

function BacklinksLauncher() {
    const navigate = useNavigate()
    const { selectedProject, isLoading: projectsLoading } = useProjects()
    const [target, setTarget] = useState("")
    const [scope, setScope] = useState<Scope>("domain")
    const [mode, setMode] = useState<ReportMode>("normal")
    const [error, setError] = useState("")
    const [reports, setReports] = useState<BacklinksReportListItem[]>([])
    const [loadingReports, setLoadingReports] = useState(true)

    useEffect(() => {
        if (!selectedProject?.id) {
            setLoadingReports(false)
            return
        }
        let active = true
        setLoadingReports(true)
        domainResearchApi.listBacklinksReports(selectedProject.id)
            .then(result => active && setReports(result.reports))
            .catch(() => active && setReports([]))
            .finally(() => active && setLoadingReports(false))
        return () => { active = false }
    }, [selectedProject?.id])

    function runReport() {
        const normalized = normalizeTarget(target, scope)
        if (!normalized) {
            setError(scope === "domain"
                ? "Enter a valid domain, for example example.com"
                : "Enter a complete page URL, for example https://example.com/resources")
            return
        }
        setError("")
        navigate(`/seo/backlinks?${reportQuery(normalized, scope, mode)}`, { state: { runLive: true } })
    }

    return (
        <div className="backlinks-shell">
            <main className="backlinks-page">
                <section className="backlinks-launcher">
                    <div className="backlinks-launcher-heading">
                        <div>
                            <p className="backlinks-eyebrow">Link intelligence</p>
                            <h1>Backlink analysis</h1>
                            <p>Measure authority, inspect referring sources, and uncover the links shaping a site&apos;s organic strength.</p>
                        </div>
                    </div>

                    <div className="backlinks-launcher-body">
                        <div className="backlinks-scope-switch" aria-label="Analysis target">
                            <button className={scope === "domain" ? "active" : ""} onClick={() => setScope("domain")} type="button">Entire domain</button>
                            <button className={scope === "page" ? "active" : ""} onClick={() => setScope("page")} type="button">Exact page</button>
                        </div>

                        <label className="backlinks-label" htmlFor="backlinks-target">{scope === "domain" ? "Domain" : "Page URL"}</label>
                        <div className="backlinks-search-row">
                            <div className={error ? "backlinks-search-field error" : "backlinks-search-field"}>
                                <Search aria-hidden="true" />
                                <input
                                    id="backlinks-target"
                                    value={target}
                                    onChange={event => setTarget(event.target.value)}
                                    onKeyDown={event => event.key === "Enter" && runReport()}
                                    placeholder={scope === "domain" ? "example.com" : "https://example.com/page"}
                                    autoFocus
                                />
                            </div>
                            <button type="button" className="backlinks-primary-action" disabled={!target.trim()} onClick={runReport}>
                                Analyze backlinks <ArrowRight />
                            </button>
                        </div>
                        {error && <p className="backlinks-validation">{error}</p>}

                        <div className="backlinks-mode-heading">
                            <div>
                                <h2>Choose report depth</h2>
                                <p>Select the amount of link intelligence you need before the analysis runs.</p>
                            </div>
                        </div>
                        <div className="backlinks-mode-grid">
                            <ReportModeCard
                                active={mode === "normal"}
                                title="Normal report"
                                subtitle="Fast profile overview"
                                description="Best for routine checks and a clear view of authority, growth, and strongest sources."
                                items={["12-month backlink trend", "Top 100 backlinks", "Top 100 referring domains", "Top 100 linked pages"]}
                                onClick={() => setMode("normal")}
                            />
                            <ReportModeCard
                                active={mode === "detailed"}
                                title="Detailed report"
                                subtitle="Deep link audit"
                                description="Best for strategy, prospecting, and understanding exactly how a backlink profile is built."
                                items={["Everything in Normal", "200 backlink and domain rows", "Anchor-text distribution", "Backlink-profile competitors"]}
                                onClick={() => setMode("detailed")}
                                recommended
                            />
                        </div>
                    </div>
                </section>

                <section className="backlinks-recent">
                    <div className="backlinks-section-heading">
                        <div>
                            <p className="backlinks-eyebrow">Saved analysis</p>
                            <h2>Recent backlink reports</h2>
                            <p>Open a stored report without running another analysis.</p>
                        </div>
                        {!!reports.length && <span>{reports.length} saved</span>}
                    </div>
                    {projectsLoading || loadingReports ? (
                        <div className="backlinks-empty"><LoaderCircle className="spin" /> Loading reports</div>
                    ) : reports.length ? (
                        <div className="backlinks-report-list">
                            <div className="backlinks-list-head"><span>Target</span><span>Report</span><span>Authority</span><span>Backlinks</span><span>Referring domains</span><span>Analyzed</span><span /></div>
                            {reports.map(report => (
                                <button key={report.id} type="button" onClick={() => navigate(`/seo/backlinks?${reportQuery(report.target, report.scope, report.reportMode)}`)}>
                                    <DomainIdentity target={report.target} scope={report.scope} />
                                    <span className="backlinks-depth-tag">{report.reportMode}</span>
                                    <strong>{nullable(report.rank)}</strong>
                                    <strong>{nullable(report.backlinks)}</strong>
                                    <strong>{nullable(report.referringDomains)}</strong>
                                    <time>{formatDate(report.fetchedAt)}</time>
                                    <ArrowRight />
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="backlinks-empty"><FileSearch /> Your saved backlink reports will appear here after the first analysis.</div>
                    )}
                </section>
            </main>
        </div>
    )
}

function ReportModeCard({ active, title, subtitle, description, items, onClick, recommended = false }: {
    active: boolean
    title: string
    subtitle: string
    description: string
    items: string[]
    onClick: () => void
    recommended?: boolean
}) {
    return (
        <button type="button" className={active ? "backlinks-mode-card active" : "backlinks-mode-card"} onClick={onClick} aria-pressed={active}>
            <div className="backlinks-mode-topline">
                <span className="backlinks-mode-radio">{active && <Check />}</span>
                {recommended && <span className="backlinks-recommended"><Sparkles /> Most complete</span>}
            </div>
            <h3>{title}</h3>
            <strong>{subtitle}</strong>
            <p>{description}</p>
            <ul>{items.map(item => <li key={item}><Check />{item}</li>)}</ul>
        </button>
    )
}

function BacklinksReport({ target }: { target: string }) {
    const navigate = useNavigate()
    const location = useLocation()
    const [searchParams] = useSearchParams()
    const { selectedProject, isLoading: projectsLoading } = useProjects()
    const scope: Scope = searchParams.get("scope") === "page" ? "page" : "domain"
    const mode: ReportMode = searchParams.get("report") === "detailed" ? "detailed" : "normal"
    const runLiveOnOpen = Boolean((location.state as { runLive?: boolean } | null)?.runLive)
    const [data, setData] = useState<BacklinksReportPayload | null>(null)
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [error, setError] = useState("")

    useEffect(() => {
        if (!selectedProject?.id) return
        let active = true
        setLoading(true)
        setError("")
        const call = runLiveOnOpen
            ? domainResearchApi.refreshBacklinksReport(selectedProject.id, target, scope, mode)
            : domainResearchApi.getBacklinksReport(selectedProject.id, target, scope, mode)
        call.then(result => active && setData(result))
            .catch(caught => active && setError(apiMessage(caught)))
            .finally(() => active && setLoading(false))
        return () => { active = false }
    }, [mode, runLiveOnOpen, scope, selectedProject?.id, target])

    async function refresh() {
        if (!selectedProject?.id || refreshing) return
        setRefreshing(true)
        setError("")
        try {
            setData(await domainResearchApi.refreshBacklinksReport(selectedProject.id, target, scope, mode))
        } catch (caught) {
            setError(apiMessage(caught))
        } finally {
            setRefreshing(false)
        }
    }

    if (projectsLoading || loading) return <BacklinksLoading target={target} mode={mode} />
    if (error || !data) return <BacklinksError message={error || "This report could not be opened."} onBack={() => navigate("/seo/backlinks")} />

    const summary = data.summary
    const metrics = [
        ["Authority", summary.rank, "Link strength score", "authority"],
        ["Backlinks", summary.backlinks, `${compact(data.backlinks.totalCount)} indexed rows`, "links"],
        ["Referring domains", summary.referringDomains, `${compact(summary.referringIps)} referring IPs`, "domains"],
        ["Follow links", summary.dofollowBacklinks, share(summary.dofollowBacklinks, summary.backlinks), "follow"],
        ["Nofollow links", summary.nofollowBacklinks, share(summary.nofollowBacklinks, summary.backlinks), "nofollow"],
        ["Broken links", summary.brokenBacklinks, `${compact(summary.brokenPages)} broken target pages`, "broken"],
    ] as const

    return (
        <div className="backlinks-shell">
            <main className="backlinks-page backlinks-report-page">
                <header className="backlinks-report-header">
                    <button type="button" className="backlinks-back" onClick={() => navigate("/seo/backlinks")}><ArrowLeft /> New analysis</button>
                    <div className="backlinks-header-divider" />
                    <DomainIdentity target={target} scope={scope} large />
                    <div className="backlinks-report-meta">
                        <span>{mode === "detailed" ? "Detailed report" : "Normal report"}</span>
                        <small>{data.snapshot?.fetchedAt ? `Updated ${formatDateTime(data.snapshot.fetchedAt)}` : "Saved analysis"}</small>
                    </div>
                    <button type="button" className="backlinks-refresh" onClick={refresh} disabled={refreshing}>
                        <RefreshCw className={refreshing ? "spin" : ""} /> {refreshing ? "Refreshing" : "Refresh data"}
                    </button>
                </header>

                <section className="backlinks-metric-grid">
                    {metrics.map(([label, value, detail, tone]) => <Metric key={label} label={label} value={value} detail={detail} tone={tone} />)}
                </section>

                <section className="backlinks-signal-strip">
                    <Signal label="New backlinks" value={summary.newBacklinks} tone="positive" />
                    <Signal label="Lost backlinks" value={summary.lostBacklinks} tone="negative" />
                    <Signal label="New referring domains" value={summary.newReferringDomains} tone="positive" />
                    <Signal label="Lost referring domains" value={summary.lostReferringDomains} tone="negative" />
                </section>

                <section className="backlinks-analytics-grid">
                    <ChartPanel title="Backlink profile over time" subtitle="Authority growth across the last 12 months">
                        <ProfileTrendChart data={data} />
                    </ChartPanel>
                    <ChartPanel title="Link acquisition" subtitle="New and lost links for each historical period">
                        <NewLostChart data={data} />
                    </ChartPanel>
                </section>

                <section className="backlinks-content-grid">
                    <DataPanel title="Referring domains" subtitle="Sites transferring the strongest authority" count={data.referringDomains.totalCount}>
                        <ReferringDomainsTable data={data} />
                    </DataPanel>
                    <DataPanel title="Top linked pages" subtitle="Pages attracting the largest backlink share" count={data.topPages.totalCount}>
                        <TopPagesTable data={data} />
                    </DataPanel>
                </section>

                <DataPanel title="Backlink explorer" subtitle="Individual links discovered for this target" count={data.backlinks.totalCount} wide>
                    <BacklinksTable data={data} />
                </DataPanel>

                {mode === "detailed" && data.anchors && data.competitors ? (
                    <section className="backlinks-content-grid backlinks-detailed-grid">
                        <DataPanel title="Anchor text distribution" subtitle="The words and phrases used to link to this target" count={data.anchors.totalCount}>
                            <AnchorsTable data={data} />
                        </DataPanel>
                        <DataPanel title="Backlink competitors" subtitle="Domains sharing the closest referring-source profile" count={data.competitors.totalCount}>
                            <CompetitorsTable data={data} />
                        </DataPanel>
                    </section>
                ) : (
                    <section className="backlinks-detail-upgrade">
                        <div><p className="backlinks-eyebrow">Need deeper intelligence?</p><h2>Reveal anchor text and backlink competitors</h2><p>The Detailed report expands row coverage and adds the datasets needed for link strategy and prospecting.</p></div>
                        <button type="button" onClick={() => navigate(`/seo/backlinks?${reportQuery(target, scope, "detailed")}`, { state: { runLive: true } })}>Run detailed report <ArrowRight /></button>
                    </section>
                )}
            </main>
        </div>
    )
}

function Metric({ label, value, detail, tone }: { label: string; value: number | null; detail: string; tone: string }) {
    return <div className={`backlinks-metric tone-${tone}`}><p>{label}</p><strong>{nullable(value)}</strong><span>{detail}</span></div>
}

function Signal({ label, value, tone }: { label: string; value: number | null; tone: "positive" | "negative" }) {
    return <div className={`backlinks-signal ${tone}`}><span>{tone === "positive" ? "+" : "−"}</span><div><p>{label}</p><strong>{nullable(value)}</strong></div></div>
}

function ChartPanel({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
    return <section className="backlinks-panel"><PanelHeading title={title} subtitle={subtitle} /><div className="backlinks-chart-body">{children}</div></section>
}

function DataPanel({ title, subtitle, count, children, wide = false }: { title: string; subtitle: string; count: number; children: React.ReactNode; wide?: boolean }) {
    return <section className={`backlinks-panel backlinks-data-panel ${wide ? "wide" : ""}`}><PanelHeading title={title} subtitle={subtitle} count={count} /><div>{children}</div></section>
}

function PanelHeading({ title, subtitle, count }: { title: string; subtitle: string; count?: number }) {
    return <div className="backlinks-panel-heading"><div><h2>{title}</h2><p>{subtitle}</p></div>{count !== undefined && <span>{compact(count)} total</span>}</div>
}

function ProfileTrendChart({ data }: { data: BacklinksReportPayload }) {
    if (!data.trends.length) return <ChartEmpty />
    return <ResponsiveContainer width="100%" height="100%"><AreaChart data={data.trends} margin={{ top: 10, right: 14, left: 0, bottom: 0 }}>
        <defs><linearGradient id="backlinksFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0f766e" stopOpacity={0.22} /><stop offset="100%" stopColor="#0f766e" stopOpacity={0} /></linearGradient></defs>
        <CartesianGrid vertical={false} stroke="#e7e5e4" strokeDasharray="3 5" />
        <XAxis dataKey="date" tickFormatter={shortMonth} tick={{ fill: "#78716c", fontSize: 10 }} axisLine={false} tickLine={false} />
        <YAxis yAxisId="links" tickFormatter={compact} tick={{ fill: "#a8a29e", fontSize: 9 }} axisLine={false} tickLine={false} width={44} />
        <YAxis yAxisId="domains" orientation="right" tickFormatter={compact} tick={{ fill: "#a8a29e", fontSize: 9 }} axisLine={false} tickLine={false} width={42} />
        <Tooltip content={<ChartTooltip />} />
        <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 11, color: "#57534e" }} />
        <Area yAxisId="links" type="monotone" dataKey="backlinks" name="Backlinks" stroke="#0f766e" strokeWidth={2.5} fill="url(#backlinksFill)" activeDot={{ r: 4, fill: "#0f766e", stroke: "white", strokeWidth: 2 }} />
        <Area yAxisId="domains" type="monotone" dataKey="referringDomains" name="Referring domains" stroke="#ca8a04" strokeWidth={2} fill="transparent" activeDot={{ r: 4, fill: "#ca8a04", stroke: "white", strokeWidth: 2 }} />
    </AreaChart></ResponsiveContainer>
}

function NewLostChart({ data }: { data: BacklinksReportPayload }) {
    if (!data.newLostTrends.length) return <ChartEmpty />
    return <ResponsiveContainer width="100%" height="100%"><BarChart data={data.newLostTrends} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="#e7e5e4" strokeDasharray="3 5" />
        <XAxis dataKey="date" tickFormatter={shortMonth} tick={{ fill: "#78716c", fontSize: 10 }} axisLine={false} tickLine={false} />
        <YAxis tickFormatter={compact} tick={{ fill: "#a8a29e", fontSize: 9 }} axisLine={false} tickLine={false} width={44} />
        <Tooltip content={<ChartTooltip />} />
        <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 11, color: "#57534e" }} />
        <Bar dataKey="newBacklinks" name="New links" fill="#16a085" maxBarSize={18} />
        <Bar dataKey="lostBacklinks" name="Lost links" fill="#e11d48" maxBarSize={18} />
    </BarChart></ResponsiveContainer>
}

function ChartTooltip({ active, label, payload }: any) {
    if (!active || !payload?.length) return null
    return <div className="backlinks-chart-tooltip"><p>{formatDate(label)}</p>{payload.map((entry: any) => <div key={entry.dataKey}><span style={{ background: entry.color }} />{entry.name}<strong>{nullable(entry.value)}</strong></div>)}</div>
}

function ChartEmpty() { return <div className="backlinks-chart-empty">Historical data is not available for this target yet.</div> }

function ReferringDomainsTable({ data }: { data: BacklinksReportPayload }) {
    return <Table headers={["Domain", "Authority", "Backlinks", "Pages", "Spam"]}>{data.referringDomains.items.map((item, index) => <tr key={`${item.domain}-${index}`}><td><DomainIdentity target={item.domain || "Unknown"} scope="domain" /></td><td><Rank value={item.rank} /></td><td className="number">{nullable(item.backlinks)}</td><td className="number">{nullable(item.referringPages)}</td><td><Risk value={item.spamScore} /></td></tr>)}</Table>
}

function TopPagesTable({ data }: { data: BacklinksReportPayload }) {
    return <Table headers={["Page", "Authority", "Backlinks", "Domains"]}>{data.topPages.items.map((item, index) => <tr key={`${item.page}-${index}`}><td><UrlCell url={item.page} /></td><td><Rank value={item.rank} /></td><td className="number">{nullable(item.backlinks)}</td><td className="number">{nullable(item.referringDomains)}</td></tr>)}</Table>
}

function BacklinksTable({ data }: { data: BacklinksReportPayload }) {
    return <Table headers={["Referring page", "Anchor text", "Authority", "Type", "First seen", "Status"]} wide>{data.backlinks.items.map((item, index) => <tr key={`${item.urlFrom}-${index}`}><td><UrlCell url={item.urlFrom} domain={item.domainFrom} /></td><td><span className="backlinks-anchor-text">{item.anchor || "No anchor text"}</span></td><td><Rank value={item.domainFromRank} /></td><td><span className={item.isDofollow ? "backlinks-link-type follow" : "backlinks-link-type nofollow"}>{item.isDofollow ? "Follow" : "Nofollow"}</span></td><td>{formatDate(item.firstSeen)}</td><td><span className={`backlinks-row-status ${item.isLost ? "lost" : item.isNew ? "new" : "live"}`}>{item.isLost ? "Lost" : item.isNew ? "New" : "Live"}</span></td></tr>)}</Table>
}

function AnchorsTable({ data }: { data: BacklinksReportPayload }) {
    return <Table headers={["Anchor text", "Authority", "Backlinks", "Domains"]}>{data.anchors?.items.map((item, index) => <tr key={`${item.anchor}-${index}`}><td><span className="backlinks-anchor-text">{item.anchor}</span></td><td><Rank value={item.rank} /></td><td className="number">{nullable(item.backlinks)}</td><td className="number">{nullable(item.referringDomains)}</td></tr>)}</Table>
}

function CompetitorsTable({ data }: { data: BacklinksReportPayload }) {
    return <Table headers={["Competitor", "Authority", "Shared sources", "Backlinks"]}>{data.competitors?.items.map((item, index) => <tr key={`${item.domain}-${index}`}><td><DomainIdentity target={item.domain || "Unknown"} scope="domain" /></td><td><Rank value={item.rank} /></td><td className="number">{nullable(item.intersections)}</td><td className="number">{nullable(item.backlinks)}</td></tr>)}</Table>
}

function Table({ headers, children, wide = false }: { headers: string[]; children: React.ReactNode; wide?: boolean }) {
    return <div className={`backlinks-table-wrap ${wide ? "wide" : ""}`}><table><thead><tr>{headers.map(header => <th key={header}>{header}</th>)}</tr></thead><tbody>{children}</tbody></table></div>
}

function DomainIdentity({ target, scope, large = false }: { target: string; scope: Scope; large?: boolean }) {
    const domain = hostname(target)
    const [failed, setFailed] = useState(false)
    return <div className={`backlinks-domain ${large ? "large" : ""}`}>
        <span className="backlinks-domain-logo">{failed ? <Link2 /> : <img loading="lazy" src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=96`} alt="" onError={() => setFailed(true)} />}</span>
        <span><strong>{large ? target : domain}</strong><small>{scope === "page" ? "Exact page" : "Entire domain"}</small></span>
        {large && <a href={scope === "page" ? target : `https://${target}`} target="_blank" rel="noreferrer" aria-label={`Open ${target}`}><ExternalLink /></a>}
    </div>
}

function UrlCell({ url, domain }: { url: string | null; domain?: string | null }) {
    if (!url) return <span className="muted">—</span>
    return <div className="backlinks-url-cell"><strong>{domain || hostname(url)}</strong><span>{url}</span></div>
}

function Rank({ value }: { value: number | null }) { return <span className="backlinks-rank">{value ?? "—"}</span> }
function Risk({ value }: { value: number | null }) { return <span className={`backlinks-risk ${(value ?? 0) > 60 ? "high" : (value ?? 0) > 30 ? "medium" : "low"}`}>{value == null ? "—" : `${value}%`}</span> }

function BacklinksLoading({ target, mode }: { target: string; mode: ReportMode }) {
    return <div className="backlinks-shell"><div className="backlinks-loading"><span><LoaderCircle /></span><p className="backlinks-eyebrow">{mode} backlink report</p><h1>Building link intelligence for {target}</h1><p>Collecting authority, source, page, and historical link signals. You can leave this screen while the analysis completes.</p><div className="backlinks-loading-bar"><i /></div><div className="backlinks-loading-steps"><span>Profile summary</span><span>Source analysis</span><span>Historical trends</span><span>{mode === "detailed" ? "Anchors & competitors" : "Top linked pages"}</span></div></div></div>
}

function BacklinksError({ message, onBack }: { message: string; onBack: () => void }) {
    return <div className="backlinks-shell"><div className="backlinks-error"><span><ShieldCheck /></span><h1>Report unavailable</h1><p>{message}</p><button type="button" onClick={onBack}><ArrowLeft /> Back to backlink reports</button></div></div>
}

function normalizeTarget(value: string, scope: Scope) {
    const trimmed = value.trim()
    if (scope === "page") {
        try { const url = new URL(trimmed); return ["http:", "https:"].includes(url.protocol) ? url.toString() : null } catch { return null }
    }
    const domain = trimmed.replace(/^https?:\/\//i, "").replace(/^www\./i, "").split("/")[0]
    return /^(?=.{3,253}$)([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i.test(domain) ? domain.toLowerCase() : null
}

function reportQuery(target: string, scope: Scope, mode: ReportMode) {
    return new URLSearchParams({ target, scope, report: mode }).toString()
}

function hostname(value: string) {
    try { return new URL(value.includes("://") ? value : `https://${value}`).hostname.replace(/^www\./, "") } catch { return value }
}

function compact(value: number | null | undefined) {
    if (value == null || !Number.isFinite(value)) return "—"
    if (Math.abs(value) >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`
    if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
    if (Math.abs(value) >= 1_000) return `${(value / 1_000).toFixed(1)}K`
    return value.toLocaleString()
}
function nullable(value: number | null | undefined) { return compact(value) }
function share(value: number | null, total: number | null) { return value == null || !total ? "Share unavailable" : `${Math.round((value / total) * 100)}% of links` }
function shortMonth(value: string) { const date = new Date(value); return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("en-US", { month: "short" }) }
function formatDate(value: string | null | undefined) { if (!value) return "—"; const date = new Date(value); return Number.isNaN(date.getTime()) ? value.slice(0, 10) : date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) }
function formatDateTime(value: string) { const date = new Date(value); return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) }
function apiMessage(error: any) { return error?.response?.data?.error || error?.message || "The backlink report could not be loaded." }
