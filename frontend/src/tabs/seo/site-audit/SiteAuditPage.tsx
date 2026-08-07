import { Fragment, useEffect, useMemo, useState } from "react"
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FileSearch,
  FileWarning,
  Globe2,
  Link2,
  Loader2,
  RefreshCw,
  ScanSearch,
  Search,
  ShieldCheck,
} from "lucide-react"
import { useSearchParams } from "react-router-dom"
import { useProjects } from "@/hooks/useProjects"
import {
  siteAuditApi,
  type SiteAuditHistoryRecord,
  type SiteAuditIssueRecord,
  type SiteAuditPageRecord,
  type SiteAuditRecord,
  type SiteAuditStatus,
} from "./siteAuditApi"
import "./site-audit.css"

const ISSUE_PAGE_SIZE = 20
const URL_PAGE_SIZE = 20
const SEVERITY_ORDER = ["CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO"]

type GroupedIssue = {
  key: string
  category: string
  severity: string
  title: string
  description: string
  recommendation: string
  priorityScore: number
  issueCount: number
  pageIds: string[]
}

const AUDIT_CATEGORIES = [
  { label: "Crawlability", categories: ["ROBOTS", "REDIRECT"] },
  { label: "Indexability", categories: ["INDEXABILITY", "CANONICAL"] },
  { label: "On-page", categories: ["TITLE", "META_DESCRIPTION", "HEADINGS", "IMAGES"] },
  { label: "Internal links", categories: ["LINKS", "ORPHAN_PAGES"] },
  { label: "Enhancements", categories: ["SCHEMA", "PERFORMANCE", "SECURITY", "OTHER"] },
]

export function SiteAuditPage() {
  const { selectedProject, isLoading: projectsLoading } = useProjects()
  const projectId = selectedProject?.id ?? null
  const [searchParams, setSearchParams] = useSearchParams()
  const auditId = searchParams.get("audit")
  const [history, setHistory] = useState<SiteAuditHistoryRecord[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [status, setStatus] = useState<SiteAuditStatus | null>(null)
  const [audit, setAudit] = useState<SiteAuditRecord | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [starting, setStarting] = useState(false)

  useEffect(() => {
    if (!projectId) return
    let active = true
    setHistoryLoading(true)
    siteAuditApi.history(projectId)
      .then(rows => { if (active) setHistory(rows) })
      .catch(() => { if (active) setHistory([]) })
      .finally(() => { if (active) setHistoryLoading(false) })
    return () => { active = false }
  }, [projectId])

  useEffect(() => {
    if (!projectId || !auditId) {
      setStatus(null)
      setAudit(null)
      return
    }

    let active = true
    let timer: ReturnType<typeof setTimeout> | null = null
    setAudit(null)
    setError(null)

    const check = async () => {
      try {
        const nextStatus = await siteAuditApi.status(projectId, auditId)
        if (!active) return
        setStatus(nextStatus)
        if (nextStatus.status === "COMPLETED") {
          const results = await siteAuditApi.results(projectId, auditId)
          if (!active) return
          setAudit(results)
          setHistory(current => current.some(row => row.id === results.id)
            ? current
            : [{ ...results, _count: { pages: results.pages.length } }, ...current])
          return
        }
        if (nextStatus.status === "FAILED") {
          setError(nextStatus.errorReason || "The crawl could not be completed.")
          return
        }
        timer = setTimeout(check, 1800)
      } catch (caught) {
        if (active) setError(readableError(caught))
      }
    }

    void check()
    return () => {
      active = false
      if (timer) clearTimeout(timer)
    }
  }, [auditId, projectId])

  async function startAudit(input: { url: string; maxPages: number }) {
    if (!projectId || starting) return
    setStarting(true)
    setError(null)
    try {
      const result = await siteAuditApi.start(projectId, {
        startUrl: normalizeStartUrl(input.url),
        maxPages: input.maxPages,
      })
      setSearchParams({ audit: result.auditId })
    } catch (caught) {
      setError(readableError(caught))
    } finally {
      setStarting(false)
    }
  }

  if (projectsLoading) return <AuditLoading label="Loading Site Audit" />
  if (!selectedProject || !projectId) return <AuditEmpty message="Select a project to use Site Audit." />

  if (!auditId) {
    return (
      <AuditShell>
        <AuditLauncher onStart={startAudit} starting={starting} error={error} />
        <AuditHistory
          rows={history}
          loading={historyLoading}
          onOpen={id => setSearchParams({ audit: id })}
        />
      </AuditShell>
    )
  }

  if (!audit && !error) {
    return (
      <AuditShell>
        <AuditProgress status={status} onBack={() => setSearchParams({})} />
      </AuditShell>
    )
  }

  if (error || !audit) {
    return (
      <AuditShell>
        <AuditError message={error || "The audit results are unavailable."} onBack={() => setSearchParams({})} />
      </AuditShell>
    )
  }

  return (
    <AuditShell>
      <AuditReport
        audit={audit}
        onBack={() => setSearchParams({})}
        onRerun={() => startAudit({ url: audit.url, maxPages: Math.max(100, audit.pages.length) })}
        rerunning={starting}
      />
    </AuditShell>
  )
}

function AuditShell({ children }: { children: React.ReactNode }) {
  return <div className="site-audit-shell"><main className="site-audit-page">{children}</main></div>
}

function AuditLauncher({ onStart, starting, error }: {
  onStart: (input: { url: string; maxPages: number }) => void
  starting: boolean
  error: string | null
}) {
  const [url, setUrl] = useState("")
  const [maxPages, setMaxPages] = useState(100)
  const [validation, setValidation] = useState("")

  const submit = () => {
    const value = url.trim()
    if (!value) return
    try {
      const normalized = normalizeStartUrl(value)
      const parsed = new URL(normalized)
      if (!parsed.hostname.includes(".")) throw new Error("invalid")
      setValidation("")
      onStart({ url: normalized, maxPages })
    } catch {
      setValidation("Enter a valid public website, for example example.com")
    }
  }

  return (
    <section className="site-audit-launcher">
      <header className="site-audit-section-heading">
        <div>
          <span className="site-audit-eyebrow">Technical SEO</span>
          <h1>Site audit</h1>
          <p>Crawl your website, surface technical problems, and prioritize the fixes with the greatest search impact.</p>
        </div>
      </header>

      <div className="site-audit-launcher-body">
        <label className="site-audit-label" htmlFor="site-audit-url">Website URL</label>
        <div className="site-audit-url-row">
          <div className={`site-audit-url-input ${validation ? "has-error" : ""}`}>
            <Search className="h-4 w-4" />
            <input
              id="site-audit-url"
              value={url}
              onChange={event => setUrl(event.target.value)}
              onKeyDown={event => event.key === "Enter" && submit()}
              placeholder="example.com"
              autoFocus
            />
          </div>
          <button type="button" className="site-audit-primary" onClick={submit} disabled={!url.trim() || starting}>
            {starting ? <><Loader2 className="h-4 w-4 animate-spin" /> Starting crawl</> : <>Run site audit <ArrowRight className="h-4 w-4" /></>}
          </button>
        </div>
        {validation && <p className="site-audit-validation">{validation}</p>}

        <div className="site-audit-options">
          <div>
            <label className="site-audit-label" htmlFor="site-audit-pages">Crawl limit</label>
            <select id="site-audit-pages" value={maxPages} onChange={event => setMaxPages(Number(event.target.value))}>
              {[50, 100, 250, 500, 1000].map(value => <option key={value} value={value}>Up to {value.toLocaleString()} pages</option>)}
            </select>
          </div>
          <div className="site-audit-option-copy">
            <strong>Safe, respectful crawl</strong>
            <span>Follows robots.txt, stays on the selected domain, and checks technical SEO plus homepage performance.</span>
          </div>
        </div>

        {error && <InlineError message={error} />}
      </div>
    </section>
  )
}

function AuditHistory({ rows, loading, onOpen }: {
  rows: SiteAuditHistoryRecord[]
  loading: boolean
  onOpen: (id: string) => void
}) {
  return (
    <section className="site-audit-surface site-audit-history">
      <div className="site-audit-table-heading">
        <div>
          <span className="site-audit-eyebrow">Audit history</span>
          <h2>Previous crawls</h2>
          <p>Open an existing audit without running the crawler again.</p>
        </div>
        <span className="site-audit-count">{rows.length} audits</span>
      </div>
      {loading ? (
        <div className="site-audit-centered"><Loader2 className="h-5 w-5 animate-spin text-zinc-600" /> Loading audit history</div>
      ) : rows.length === 0 ? (
        <div className="site-audit-empty-history">
          <FileWarning className="h-5 w-5" />
          <strong>No site audits yet</strong>
          <span>Run the first crawl above. Future visits can open the saved report instantly.</span>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="site-audit-table min-w-[760px]">
            <thead><tr><th>Website</th><th>Status</th><th className="text-right">Health</th><th className="text-right">Pages</th><th className="text-right">Audited</th></tr></thead>
            <tbody>
              {rows.map(row => (
                <tr key={row.id} onClick={() => onOpen(row.id)} className="cursor-pointer">
                  <td><DomainCell url={row.url} /></td>
                  <td><StatusText status={row.status} /></td>
                  <td className="text-right"><strong className="site-audit-score-text">{row.status === "COMPLETED" ? row.overall_score : "—"}</strong></td>
                  <td className="text-right tabular-nums">{row._count?.pages ?? 0}</td>
                  <td className="text-right"><span className="site-audit-open-row">{formatDate(row.created_at)} <ChevronRight className="h-3.5 w-3.5" /></span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

function AuditProgress({ status, onBack }: { status: SiteAuditStatus | null; onBack: () => void }) {
  const [elapsed, setElapsed] = useState(0)
  const pagesCrawled = status?.pagesCrawled ?? 0
  const queued = status?.status === "QUEUED"

  useEffect(() => {
    const timer = setInterval(() => setElapsed(value => value + 1), 1000)
    return () => clearInterval(timer)
  }, [])

  const stages = [
    { label: "Discovering URLs", detail: "Reading crawl rules and internal links", icon: Globe2, state: pagesCrawled > 0 ? "done" : "active" },
    { label: "Crawling pages", detail: "Checking responses and indexability", icon: ScanSearch, state: pagesCrawled > 0 ? "active" : "pending" },
    { label: "Analyzing signals", detail: "Reviewing content, metadata, and links", icon: Link2, state: "pending" },
    { label: "Building report", detail: "Grouping findings by priority and coverage", icon: FileSearch, state: "pending" },
  ]

  return (
    <section className="site-audit-progress">
      <header className="site-audit-progress-header">
        <button type="button" className="site-audit-back" onClick={onBack}><ArrowLeft className="h-4 w-4" /> Audit history</button>
        <div className="site-audit-progress-domain">
          {status?.url ? <DomainCell url={status.url} /> : <span>Preparing website details</span>}
        </div>
        <span className="site-audit-live-status"><i /> {queued ? "Queued" : "Crawl in progress"}</span>
      </header>

      <div className="site-audit-progress-workspace">
        <div className="site-audit-progress-main">
          <div className="site-audit-progress-title">
            <span className="site-audit-progress-mark"><Activity className="h-5 w-5" /></span>
            <div>
              <span className="site-audit-eyebrow">Live site audit</span>
              <h1>{queued ? "Preparing your technical crawl" : "Scanning your website"}</h1>
              <p>{queued ? "Applying crawl rules and preparing the first request." : "We’re reviewing every discovered page and organizing findings as the crawl runs."}</p>
            </div>
          </div>

          <div className="site-audit-current-task">
            <div>
              <span>{queued ? "Connecting to" : "Currently auditing"}</span>
              <strong>{status?.url || "Preparing crawl target…"}</strong>
            </div>
            <span className="site-audit-current-signal"><RefreshCw className="h-3.5 w-3.5 animate-spin" /> Live</span>
          </div>

          <div className="site-audit-progress-track" aria-label="Site audit is running"><span /></div>
          <div className="site-audit-progress-note"><ShieldCheck className="h-3.5 w-3.5" /><span>The crawl follows robots.txt, stays on this domain, and continues safely in the background.</span></div>

          <div className="site-audit-progress-stats">
            <div><span>Pages crawled</span><strong>{pagesCrawled.toLocaleString()}</strong><small>URLs inspected</small></div>
            <div><span>Checks detected</span><strong>{(status?.issuesFound ?? 0).toLocaleString()}</strong><small>Before grouping</small></div>
            <div><span>Elapsed</span><strong>{formatElapsed(elapsed)}</strong><small>Live session</small></div>
          </div>
        </div>

        <aside className="site-audit-progress-aside">
          <div className="site-audit-progress-aside-heading">
            <div><span className="site-audit-eyebrow">Audit pipeline</span><h2>What happens next</h2></div>
            <span>{pagesCrawled ? `${pagesCrawled} crawled` : "Starting"}</span>
          </div>
          <ol className="site-audit-stage-list">
            {stages.map(({ label, detail, icon: Icon, state }, index) => <li key={label} className={`is-${state}`}>
              <span className="site-audit-stage-icon">{state === "done" ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}</span>
              <div><span>0{index + 1}</span><strong>{label}</strong><small>{detail}</small></div>
              {state === "active" && <Loader2 className="site-audit-stage-loader h-3.5 w-3.5 animate-spin" />}
            </li>)}
          </ol>
          <div className="site-audit-progress-footnote"><Clock3 className="h-4 w-4" /><div><strong>No need to wait here</strong><span>You can leave this page and reopen the saved audit when it finishes.</span></div></div>
        </aside>
      </div>
    </section>
  )
}

function AuditReport({ audit, onBack, onRerun, rerunning }: {
  audit: SiteAuditRecord
  onBack: () => void
  onRerun: () => void
  rerunning: boolean
}) {
  const reportIssues = useMemo(() => sanitizeLegacyIssues(audit.issues, audit.pages), [audit.issues, audit.pages])
  const groupedIssues = useMemo(() => groupIssues(reportIssues), [reportIssues])
  const critical = groupedIssues.filter(issue => issue.severity === "CRITICAL").length
  const high = groupedIssues.filter(issue => issue.severity === "HIGH").length
  const indexable = audit.pages.filter(page => page.indexable).length
  const issueCounts = SEVERITY_ORDER.map(severity => ({
    severity,
    count: groupedIssues.filter(issue => issue.severity === severity).length,
  }))
  const categoryScores = AUDIT_CATEGORIES.map(category => ({
    label: category.label,
    score: calculateCategoryScore(groupedIssues.filter(issue => category.categories.includes(issue.category)), audit.pages.length),
  }))
  const fallbackHealth = Math.round(categoryScores.reduce((sum, item) => sum + item.score, 0) / Math.max(1, categoryScores.length))
  const displayedHealth = audit.overall_score === 0 && reportIssues.length < audit.issues.length ? fallbackHealth : audit.overall_score

  return (
    <>
      <section className="site-audit-report-summary">
        <div className="site-audit-report-head">
          <button type="button" className="site-audit-back is-icon" onClick={onBack} aria-label="Back to audit history"><ArrowLeft className="h-4 w-4" /></button>
          <DomainCell url={audit.url} large />
          <div className="site-audit-report-meta">
            <span>Completed {formatDate(audit.updated_at || audit.created_at)}</span>
            <button type="button" className="site-audit-secondary" onClick={onRerun} disabled={rerunning}>
              {rerunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />} Run again
            </button>
          </div>
        </div>
        <div className="site-audit-kpis">
          <Metric label="Site health" value={`${displayedHealth}`} detail="Severity and coverage weighted" emphasized />
          <Metric label="Crawled pages" value={compact(audit.pages.length)} detail={`${indexable} indexable pages`} />
          <Metric label="Grouped findings" value={compact(groupedIssues.length)} detail={`${compact(reportIssues.length)} relevant page checks`} />
          <Metric label="Priority findings" value={compact(critical + high)} detail="Critical and high severity" alert={critical + high > 0} />
          <Metric label="Performance" value={scoreValue(audit.technical_score)} detail="Homepage mobile score" />
          <Metric label="Best practices" value={scoreValue(audit.content_score)} detail="Homepage quality score" />
        </div>
      </section>

      <section className="site-audit-surface site-audit-overview-band">
        <div className="site-audit-overview-copy">
          <span className="site-audit-eyebrow">Priority overview</span>
          <h2>Technical health at a glance</h2>
          <p>Health is weighted by severity and the share of crawled pages affected. Repeated checks are grouped into actionable findings.</p>
        </div>
        <div className="site-audit-severity-grid">
          {issueCounts.map(item => <SeverityMetric key={item.severity} severity={item.severity} value={item.count} total={Math.max(1, groupedIssues.length)} />)}
        </div>
      </section>

      <section className="site-audit-surface site-audit-category-band">
        <div className="site-audit-category-intro">
          <span className="site-audit-eyebrow">Category health</span>
          <strong>Where technical risk is concentrated</strong>
        </div>
        <div className="site-audit-category-grid">
          {categoryScores.map(item => <CategoryHealth key={item.label} label={item.label} score={item.score} />)}
        </div>
      </section>

      <IssuesTable issues={groupedIssues} pages={audit.pages} rawIssueCount={reportIssues.length} />
      <PagesTable pages={audit.pages} />
    </>
  )
}

function IssuesTable({ issues, pages, rawIssueCount }: { issues: GroupedIssue[]; pages: SiteAuditPageRecord[]; rawIssueCount: number }) {
  const [query, setQuery] = useState("")
  const [severity, setSeverity] = useState("ALL")
  const [category, setCategory] = useState("ALL")
  const [page, setPage] = useState(1)
  const [expanded, setExpanded] = useState<string | null>(null)
  const pageById = useMemo(() => new Map(pages.map(row => [row.id, row])), [pages])
  const categories = useMemo(() => [...new Set(issues.map(issue => issue.category))].sort(), [issues])
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return [...issues]
      .filter(issue => severity === "ALL" || issue.severity === severity)
      .filter(issue => category === "ALL" || issue.category === category)
      .filter(issue => !needle || `${issue.title} ${issue.description} ${issue.pageIds.map(id => pageById.get(id)?.url || "").join(" ")}`.toLowerCase().includes(needle))
      .sort((left, right) => severityRank(left.severity) - severityRank(right.severity) || right.priorityScore - left.priorityScore)
  }, [category, issues, pageById, query, severity])
  const totalPages = Math.max(1, Math.ceil(filtered.length / ISSUE_PAGE_SIZE))
  const visible = filtered.slice((page - 1) * ISSUE_PAGE_SIZE, page * ISSUE_PAGE_SIZE)

  useEffect(() => setPage(1), [query, severity, category])

  return (
    <section className="site-audit-surface">
      <div className="site-audit-table-heading is-toolbar">
        <div><span className="site-audit-eyebrow">Audit findings</span><h2>Prioritized findings</h2><p>{issues.length} grouped findings from {rawIssueCount.toLocaleString()} page-level checks. Open a row to inspect affected URLs.</p></div>
        <div className="site-audit-filters">
          <label className="site-audit-filter-search"><Search className="h-3.5 w-3.5" /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search issues or URLs" /></label>
          <select value={severity} onChange={event => setSeverity(event.target.value)} aria-label="Filter by severity"><option value="ALL">All severities</option>{SEVERITY_ORDER.map(value => <option key={value} value={value}>{titleCase(value)}</option>)}</select>
          <select value={category} onChange={event => setCategory(event.target.value)} aria-label="Filter by category"><option value="ALL">All categories</option>{categories.map(value => <option key={value} value={value}>{titleCase(value)}</option>)}</select>
        </div>
      </div>
      {visible.length === 0 ? <div className="site-audit-centered"><CheckCircle2 className="h-5 w-5 text-zinc-500" /> No issues match these filters.</div> : (
        <div className="overflow-x-auto"><table className="site-audit-table site-audit-issues-table min-w-[960px]"><thead><tr><th>Severity</th><th>Finding</th><th>Coverage</th><th>Recommended action</th><th className="text-right">Priority</th></tr></thead><tbody>{visible.map(issue => {
          const isExpanded = expanded === issue.key
          const affectedPages = issue.pageIds.map(id => pageById.get(id)).filter((row): row is SiteAuditPageRecord => Boolean(row))
          return <Fragment key={issue.key}>
            <tr className="site-audit-finding-row" onClick={() => setExpanded(isExpanded ? null : issue.key)}>
              <td><SeverityBadge severity={issue.severity} /></td>
              <td><strong>{issue.title}</strong><span>{issue.description}</span></td>
              <td><button type="button" className="site-audit-coverage" aria-expanded={isExpanded}>{affectedPages.length ? `${affectedPages.length} page${affectedPages.length === 1 ? "" : "s"}` : "Site-wide"}<ChevronRight className={`h-3.5 w-3.5 ${isExpanded ? "is-expanded" : ""}`} /></button></td>
              <td><p className="site-audit-fix">{issue.recommendation}</p></td>
              <td className="text-right"><strong className="tabular-nums">{issue.priorityScore}</strong></td>
            </tr>
            {isExpanded && <tr className="site-audit-evidence-row"><td colSpan={5}><div className="site-audit-evidence"><div><span>Why it matters</span><p>{issue.description}</p></div><div><span>Affected URLs</span>{affectedPages.length ? <ul>{affectedPages.map(affectedPage => <li key={affectedPage.id}><UrlLink url={affectedPage.url} /></li>)}</ul> : <p>This finding applies to the audited website rather than one URL.</p>}</div></div></td></tr>}
          </Fragment>
        })}</tbody></table></div>
      )}
      <TableFooter count={filtered.length} page={page} totalPages={totalPages} onPage={setPage} label="findings" />
    </section>
  )
}

function PagesTable({ pages }: { pages: SiteAuditPageRecord[] }) {
  const [query, setQuery] = useState("")
  const [indexability, setIndexability] = useState("ALL")
  const [page, setPage] = useState(1)
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return pages.filter(row => {
      const matchesQuery = !needle || `${row.url} ${row.title || ""} ${row.h1 || ""}`.toLowerCase().includes(needle)
      const matchesIndexability = indexability === "ALL" || (indexability === "INDEXABLE" ? row.indexable : !row.indexable)
      return matchesQuery && matchesIndexability
    })
  }, [indexability, pages, query])
  const totalPages = Math.max(1, Math.ceil(filtered.length / URL_PAGE_SIZE))
  const visible = filtered.slice((page - 1) * URL_PAGE_SIZE, page * URL_PAGE_SIZE)

  useEffect(() => setPage(1), [query, indexability])

  return (
    <section className="site-audit-surface">
      <div className="site-audit-table-heading is-toolbar">
        <div><span className="site-audit-eyebrow">Crawl inventory</span><h2>Crawled pages</h2><p>Review indexability, response status, metadata, schema, and content depth.</p></div>
        <div className="site-audit-filters"><label className="site-audit-filter-search"><Search className="h-3.5 w-3.5" /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search URLs or titles" /></label><select value={indexability} onChange={event => setIndexability(event.target.value)} aria-label="Filter by indexability"><option value="ALL">All pages</option><option value="INDEXABLE">Indexable</option><option value="BLOCKED">Not indexable</option></select></div>
      </div>
      <div className="overflow-x-auto"><table className="site-audit-table site-audit-pages-table min-w-[980px]"><thead><tr><th>Page</th><th>Status</th><th>Indexability</th><th className="text-right">Words</th><th>Title</th><th>Schema</th></tr></thead><tbody>{visible.map(row => {
        const document = isDocumentUrl(row.url)
        const redirect = row.status_code != null && row.status_code >= 300 && row.status_code < 400
        const indexabilityLabel = redirect ? "Redirect" : document ? "Document" : row.indexable ? "Indexable" : "Not indexable"
        return <tr key={row.id}><td><UrlLink url={row.url} /></td><td><HttpStatus value={row.status_code} /></td><td><span className={`site-audit-indexability ${row.indexable ? "is-indexable" : redirect ? "is-redirect" : "is-blocked"}`}>{indexabilityLabel}</span></td><td className="text-right tabular-nums">{document ? "—" : row.word_count.toLocaleString()}</td><td><span className="site-audit-page-title">{document ? `${document.toUpperCase()} document` : row.title || "Missing title"}</span></td><td>{document ? "Not applicable" : row.has_schema ? "Detected" : "None"}</td></tr>
      })}</tbody></table></div>
      <TableFooter count={filtered.length} page={page} totalPages={totalPages} onPage={setPage} label="pages" />
    </section>
  )
}

function Metric({ label, value, detail, emphasized = false, alert = false }: { label: string; value: string; detail: string; emphasized?: boolean; alert?: boolean }) {
  return <div className={`site-audit-metric ${emphasized ? "is-emphasized" : ""} ${alert ? "is-alert" : ""} ${value === "Unavailable" ? "is-unavailable" : ""}`}><span>{label}</span><strong>{value}</strong><small>{detail}</small></div>
}

function SeverityMetric({ severity, value, total }: { severity: string; value: number; total: number }) {
  return <div className={`site-audit-severity severity-${severity.toLowerCase()}`}><div><span>{titleCase(severity)}</span><strong>{value}</strong></div><i><b style={{ width: `${Math.max(value ? 7 : 0, (value / total) * 100)}%` }} /></i></div>
}

function SeverityBadge({ severity }: { severity: string }) {
  return <span className={`site-audit-severity-badge severity-${severity.toLowerCase()}`}>{titleCase(severity)}</span>
}

function CategoryHealth({ label, score }: { label: string; score: number }) {
  const tone = score >= 90 ? "good" : score >= 70 ? "watch" : "risk"
  return <div className={`site-audit-category-health is-${tone}`}><div><span>{label}</span><strong>{score}</strong></div><i><b style={{ width: `${score}%` }} /></i></div>
}

function DomainCell({ url, large = false }: { url: string; large?: boolean }) {
  const parsed = safeUrl(url)
  const domain = parsed?.hostname.replace(/^www\./, "") || url
  return <div className={`site-audit-domain ${large ? "is-large" : ""}`}><span className="site-audit-favicon"><img src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=96`} alt="" /></span><div><strong>{domain}</strong><span>{large ? "Technical SEO audit" : parsed?.pathname === "/" ? "Website audit" : parsed?.pathname}</span></div></div>
}

function UrlLink({ url }: { url: string }) {
  return <a className="site-audit-url-link" href={url} target="_blank" rel="noreferrer" title={url}><span>{url.replace(/^https?:\/\//, "")}</span><ExternalLink className="h-3 w-3" /></a>
}

function StatusText({ status }: { status: string }) {
  return <span className={`site-audit-status status-${status.toLowerCase()}`}><i />{titleCase(status)}</span>
}

function HttpStatus({ value }: { value: number | null }) {
  const tone = value == null ? "unknown" : value >= 400 ? "error" : value >= 300 ? "redirect" : "ok"
  return <span className={`site-audit-http is-${tone}`}>{value ?? "—"}</span>
}

function TableFooter({ count, page, totalPages, onPage, label }: { count: number; page: number; totalPages: number; onPage: (page: number) => void; label: string }) {
  return <div className="site-audit-table-footer"><span>{count.toLocaleString()} {label}</span><div><span>Page {page} of {totalPages}</span><button type="button" onClick={() => onPage(Math.max(1, page - 1))} disabled={page === 1} aria-label="Previous page"><ChevronLeft className="h-4 w-4" /></button><button type="button" onClick={() => onPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} aria-label="Next page"><ChevronRight className="h-4 w-4" /></button></div></div>
}

function InlineError({ message }: { message: string }) { return <div className="site-audit-inline-error"><AlertCircle className="h-4 w-4" />{message}</div> }

function AuditError({ message, onBack }: { message: string; onBack: () => void }) {
  return <section className="site-audit-error"><AlertCircle className="h-6 w-6" /><h1>Audit unavailable</h1><p>{message}</p><button type="button" className="site-audit-secondary" onClick={onBack}><ArrowLeft className="h-4 w-4" /> Return to audit history</button></section>
}

function AuditLoading({ label }: { label: string }) { return <div className="site-audit-shell"><div className="site-audit-centered min-h-72"><Loader2 className="h-5 w-5 animate-spin text-zinc-600" />{label}</div></div> }
function AuditEmpty({ message }: { message: string }) { return <div className="site-audit-shell"><div className="site-audit-centered min-h-72">{message}</div></div> }

function readableError(error: unknown) {
  const caught = error as { response?: { data?: { error?: string } }; message?: string }
  return caught?.response?.data?.error || caught?.message || "The Site Audit request failed."
}

function normalizeStartUrl(value: string) { return /^https?:\/\//i.test(value) ? value : `https://${value}` }
function safeUrl(value: string) { try { return new URL(value) } catch { return null } }
function formatDate(value: string) { const date = new Date(value); return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) }
function compact(value: number) { return value >= 1_000_000 ? `${(value / 1_000_000).toFixed(1)}M` : value >= 1_000 ? `${(value / 1_000).toFixed(1)}K` : value.toLocaleString() }
function titleCase(value: string) { return value.toLowerCase().replace(/_/g, " ").replace(/\b\w/g, letter => letter.toUpperCase()) }
function severityRank(value: string) { const index = SEVERITY_ORDER.indexOf(value); return index === -1 ? SEVERITY_ORDER.length : index }
function scoreValue(value: number) { return value > 0 ? `${value}` : "Unavailable" }

function sanitizeLegacyIssues(issues: SiteAuditIssueRecord[], pages: SiteAuditPageRecord[]) {
  const pageById = new Map(pages.map(page => [page.id, page]))
  const htmlOnlyCategories = new Set(["TITLE", "META_DESCRIPTION", "HEADINGS", "IMAGES"])
  return issues.filter(issue => {
    const page = issue.page_id ? pageById.get(issue.page_id) : null
    if (!page) return true
    const document = isDocumentUrl(page.url)
    const redirect = page.status_code != null && page.status_code >= 300 && page.status_code < 400
    if (document && (htmlOnlyCategories.has(issue.category) || issue.title === "Thin Content")) return false
    if (redirect && issue.title !== "Redirected URL") return false
    return true
  })
}

function groupIssues(issues: SiteAuditIssueRecord[]): GroupedIssue[] {
  const groups = new Map<string, GroupedIssue>()
  for (const issue of issues) {
    const key = `${issue.category}:${issue.severity}:${issue.title}:${issue.recommendation}`
    const current = groups.get(key)
    if (current) {
      current.issueCount += 1
      current.priorityScore = Math.max(current.priorityScore, issue.priority_score)
      if (issue.page_id && !current.pageIds.includes(issue.page_id)) current.pageIds.push(issue.page_id)
      continue
    }
    groups.set(key, {
      key,
      category: issue.category,
      severity: issue.severity,
      title: issue.title,
      description: issue.description,
      recommendation: issue.recommendation,
      priorityScore: issue.priority_score,
      issueCount: 1,
      pageIds: issue.page_id ? [issue.page_id] : [],
    })
  }
  return [...groups.values()].sort((left, right) => severityRank(left.severity) - severityRank(right.severity) || right.priorityScore - left.priorityScore)
}

function calculateCategoryScore(issues: GroupedIssue[], pageCount: number) {
  const severityWeight: Record<string, number> = { CRITICAL: 30, HIGH: 18, MEDIUM: 9, LOW: 4, INFO: 1 }
  const deduction = issues.reduce((total, issue) => {
    const affected = Math.max(1, issue.pageIds.length)
    const prevalence = Math.min(1, affected / Math.max(1, pageCount))
    return total + (severityWeight[issue.severity] ?? 3) * (.4 + prevalence * .6)
  }, 0)
  return Math.max(0, Math.round(100 - Math.min(100, deduction)))
}

function isDocumentUrl(value: string) {
  const pathname = safeUrl(value)?.pathname.toLowerCase() || value.toLowerCase()
  const extension = pathname.match(/\.([a-z0-9]{2,5})$/)?.[1] || null
  return extension && ["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx"].includes(extension) ? extension : null
}

function formatElapsed(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, "0")}`
}
