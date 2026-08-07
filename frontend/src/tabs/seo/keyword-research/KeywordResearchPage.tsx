import { useEffect, useMemo, useRef, useState } from "react"
import {
  ArrowRight,
  BarChart3,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Database,
  Download,
  FileText,
  Layers3,
  Presentation,
  Search,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react"
import { useSearchParams } from "react-router-dom"
import { useProjects } from "@/hooks/useProjects"
import { countryFlagUrl } from "@/lib/countries"
import {
  keywordResearchApi,
  type KeywordMatchType,
  type KeywordResearchPayload,
  type KeywordResearchRow,
} from "./api/keywordResearchApi"
import {
  exportKeywordResearchPptx,
  exportKeywordResearchPdf,
  exportKeywordResearchCsv,
} from "./export"

const DATABASES = [
  ["us", "United States"], ["uk", "United Kingdom"], ["ca", "Canada"], ["au", "Australia"],
  ["de", "Germany"], ["fr", "France"], ["es", "Spain"], ["it", "Italy"], ["nl", "Netherlands"],
  ["be", "Belgium"], ["ch", "Switzerland"], ["at", "Austria"], ["se", "Sweden"], ["no", "Norway"],
  ["dk", "Denmark"], ["fi", "Finland"], ["pl", "Poland"], ["cz", "Czechia"], ["hu", "Hungary"],
  ["ro", "Romania"], ["bg", "Bulgaria"], ["gr", "Greece"], ["pt", "Portugal"], ["ie", "Ireland"],
  ["ru", "Russia"], ["ua", "Ukraine"], ["tr", "Turkey"], ["il", "Israel"], ["sa", "Saudi Arabia"],
  ["ae", "United Arab Emirates"], ["in", "India"], ["id", "Indonesia"], ["my", "Malaysia"],
  ["sg", "Singapore"], ["th", "Thailand"], ["vn", "Vietnam"], ["ph", "Philippines"], ["jp", "Japan"],
  ["kr", "South Korea"], ["hk", "Hong Kong"], ["tw", "Taiwan"], ["br", "Brazil"], ["mx", "Mexico"],
  ["ar", "Argentina"], ["cl", "Chile"], ["co", "Colombia"], ["za", "South Africa"],
] as const

const MATCH_TYPES: { id: KeywordMatchType; label: string; description: string }[] = [
  { id: "phrase", label: "Phrase", description: "Contains your seed phrase" },
  { id: "exact", label: "Exact", description: "The exact keyword only" },
  { id: "broad", label: "Broad", description: "Wider keyword variations" },
  { id: "related", label: "Related", description: "Semantically related ideas" },
]

const PAGE_SIZE = 100
const RESULT_LIMITS = [1, 2, 5, 10, 25, 50, 100] as const

export function KeywordResearchPage() {
  const { selectedProject, isLoading: projectsLoading } = useProjects()
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get("q") || "")
  const [database, setDatabase] = useState(searchParams.get("db") || "us")
  const [matchType, setMatchType] = useState<KeywordMatchType>((searchParams.get("type") as KeywordMatchType) || "phrase")
  const [pages, setPages] = useState(Number(searchParams.get("pages") || 1))
  const [result, setResult] = useState<KeywordResearchPayload | null>(null)
  const [recentRuns, setRecentRuns] = useState<KeywordResearchPayload[]>([])
  const [loading, setLoading] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tableQuery, setTableQuery] = useState("")
  const [intentFilter, setIntentFilter] = useState("all")
  const [page, setPage] = useState(1)

  useEffect(() => {
    if (!selectedProject?.id) {
      setHistoryLoading(false)
      return
    }
    let active = true
    setHistoryLoading(true)
    keywordResearchApi.listRuns(selectedProject.id)
      .then(runs => { if (active) setRecentRuns(runs) })
      .catch(() => { if (active) setRecentRuns([]) })
      .finally(() => { if (active) setHistoryLoading(false) })
    return () => { active = false }
  }, [selectedProject?.id])

  useEffect(() => {
    const q = searchParams.get("q")
    if (!q || !selectedProject?.id || result) return
    const input = {
      q,
      db: searchParams.get("db") || "us",
      type: ((searchParams.get("type") as KeywordMatchType) || "phrase"),
      pages: Number(searchParams.get("pages") || 1),
    }
    keywordResearchApi.get(selectedProject.id, input).then(setResult).catch(() => undefined)
  }, [result, searchParams, selectedProject?.id])

  const intents = useMemo(() => Array.from(new Set(
    (result?.keywords || []).map(row => normalizeIntent(row.intent)).filter(Boolean),
  )).sort(), [result])

  const filteredRows = useMemo(() => {
    const needle = tableQuery.trim().toLowerCase()
    return (result?.keywords || []).filter(row => {
      const matchesQuery = !needle || row.keyword.toLowerCase().includes(needle)
      const matchesIntent = intentFilter === "all" || normalizeIntent(row.intent) === intentFilter
      return matchesQuery && matchesIntent
    })
  }, [intentFilter, result, tableQuery])

  const pageCount = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE))
  const visibleRows = filteredRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const selectedMatch = MATCH_TYPES.find(type => type.id === matchType) ?? MATCH_TYPES[0]
  const ideaLimit = pages * 100

  async function runResearch() {
    const projectId = selectedProject?.id
    const trimmed = query.trim()
    if (!projectId || !trimmed || loading) return
    setLoading(true)
    setError(null)
    setPage(1)
    try {
      const input = { q: trimmed, db: database, type: matchType, pages }
      const next = await keywordResearchApi.run(projectId, input)
      setResult(next)
      setRecentRuns(previous => [next, ...previous.filter(run => run.snapshot.id !== next.snapshot.id)].slice(0, 12))
      setSearchParams({ q: trimmed, db: database, type: matchType, pages: String(pages) })
    } catch (caught: any) {
      setError(caught?.response?.data?.error || caught?.message || "Keyword research could not be completed.")
    } finally {
      setLoading(false)
    }
  }

  const [exportingPptx, setExportingPptx] = useState(false)
  const [exportingPdf, setExportingPdf] = useState(false)

  const brandName = selectedProject?.brand_name || "PromptPulse"

  async function handleExportPptx() {
    if (!result) return
    setExportingPptx(true)
    try {
      await exportKeywordResearchPptx(brandName, result)
    } catch (err) {
      console.error("Failed to export PPTX:", err)
    } finally {
      setExportingPptx(false)
    }
  }

  async function handleExportPdf() {
    if (!result) return
    setExportingPdf(true)
    try {
      await exportKeywordResearchPdf(brandName, result)
    } catch (err) {
      console.error("Failed to export PDF:", err)
    } finally {
      setExportingPdf(false)
    }
  }

  function handleExportCsv() {
    if (!result) return
    exportKeywordResearchCsv(filteredRows, result.query)
  }

  function openRun(run: KeywordResearchPayload) {
    setQuery(run.query)
    setDatabase(run.database)
    setMatchType(run.matchType)
    setPages(run.pages)
    setResult(run)
    setPage(1)
    setError(null)
    setSearchParams({ q: run.query, db: run.database, type: run.matchType, pages: String(run.pages) })
  }

  return (
    <div className="min-h-full bg-[#f5f6f8] text-[#131722]">
      <header className="border-b border-[#dfe3e8] bg-white px-5 py-4 xl:px-7">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-1 text-[9px] font-black uppercase tracking-[0.16em] text-[#0f766e]">SEO intelligence</p>
            <h1 className="text-[22px] font-black tracking-[-0.045em]">Keyword Research</h1>
            <p className="mt-1 text-[11px] font-medium text-[#68707d]">Turn one search topic into a prioritized content and paid-search dataset.</p>
          </div>
          <div className="flex items-center divide-x divide-[#dfe3e8] border border-[#dfe3e8] bg-[#fafbfc] text-[9.5px] font-bold text-[#59616d]">
            <span className="flex h-9 items-center gap-2 px-3"><Database size={13} className="text-[#0f766e]" /> 47 markets</span>
            <span className="flex h-9 items-center gap-2 px-3"><Layers3 size={13} className="text-[#be185d]" /> 100 ideas per page</span>
          </div>
        </div>
      </header>

      <main className="space-y-3 px-5 py-4 xl:px-7">
        <section className="border border-[#cfd5dc] bg-white shadow-[0_16px_45px_-42px_rgba(15,23,42,0.85)]">
          <div className="flex items-center justify-between border-b border-[#e3e6ea] px-4 py-3">
            <div>
              <h2 className="text-[13px] font-black tracking-[-0.02em]">Build a keyword dataset</h2>
              <p className="mt-0.5 text-[9.5px] text-[#7b8490]">Choose a market, relationship and maximum number of ideas.</p>
            </div>
            <span className="hidden text-[9px] font-bold text-[#8a929d] sm:block">Each page retrieves up to 100 ideas</span>
          </div>
          <div className="grid lg:grid-cols-[minmax(0,1fr)_190px]">
            <label className="flex h-14 items-center border-b border-[#dfe3e8] px-4 lg:border-b-0 lg:border-r">
              <Search size={17} className="mr-3 shrink-0 text-[#87909e]" />
              <input
                value={query}
                onChange={event => setQuery(event.target.value)}
                onKeyDown={event => { if (event.key === "Enter") void runResearch() }}
                placeholder="Enter a keyword or phrase"
                className="h-full min-w-0 flex-1 bg-transparent text-[14px] font-semibold outline-none placeholder:text-[#a4abb5]"
              />
            </label>
            <button
              type="button"
              onClick={() => void runResearch()}
              disabled={!query.trim() || !selectedProject || loading}
              className="flex h-14 items-center justify-center gap-2 bg-[#121722] px-5 text-[11px] font-black text-white transition hover:bg-[#0f766e] disabled:cursor-not-allowed disabled:bg-[#b8bdc6]"
            >
              {loading ? <><span className="h-3.5 w-3.5 animate-spin border-2 border-white/30 border-t-white" /> Building dataset</> : <>Research keywords <ArrowRight size={14} /></>}
            </button>
          </div>

          <div className="grid border-t border-[#e7e9ed] bg-[#f8f9fa] lg:grid-cols-[280px_minmax(0,1fr)_230px]">
            <CountryDatabaseControl value={database} onChange={setDatabase} />
            <div className="border-t border-[#e2e6ea] px-4 py-3 lg:border-l lg:border-t-0">
              <ControlLabel title="Keyword relationship" detail={selectedMatch.description} />
              <div className="grid grid-cols-2 border border-[#d4d9df] bg-white sm:grid-cols-4">
                {MATCH_TYPES.map(type => <button key={type.id} type="button" onClick={() => setMatchType(type.id)} className={`min-h-11 border-r border-[#e4e7eb] px-3 py-2 text-left transition last:border-r-0 ${matchType === type.id ? "bg-[#e9f6f4] text-[#0b625c] shadow-[inset_0_-2px_0_#0f766e]" : "text-[#6c7480] hover:bg-[#f4f6f7]"}`}><span className="block text-[10px] font-black">{type.label}</span><span className="mt-0.5 hidden text-[8px] font-medium opacity-75 xl:block">{type.description}</span></button>)}
              </div>
            </div>
            <div className="border-t border-[#e2e6ea] px-4 py-3 lg:border-l lg:border-t-0">
              <ControlLabel title="Ideas limit" detail={`${pages} ${pages === 1 ? "page" : "pages"} × 100`} />
              <select value={pages} onChange={event => setPages(Number(event.target.value))} className="h-11 w-full border border-[#d4d9df] bg-white px-3 text-[11px] font-black outline-none focus:border-[#0f766e]">
                {RESULT_LIMITS.map(value => <option key={value} value={value}>Up to {(value * 100).toLocaleString()} ideas</option>)}
              </select>
            </div>
          </div>
          <div className="flex flex-col gap-1 border-t border-[#e3e6ea] bg-white px-4 py-2.5 text-[9.5px] sm:flex-row sm:items-center sm:justify-between">
            <p className="font-bold text-[#39414d]"><span className="text-[#0f766e]">Current run:</span> up to {ideaLimit.toLocaleString()} {selectedMatch.label.toLowerCase()}-match ideas from {databaseName(database)}.</p>
            <p className="text-[#838b97]">Fresh runs use account-adjusted SEO credits · saved datasets are free to reopen.</p>
          </div>
        </section>

        {error && <div className="border-l-4 border-[#e11d48] bg-[#fff1f3] px-4 py-3 text-[11px] font-semibold text-[#9f1239]">{error}</div>}
        {projectsLoading && <div className="h-24 animate-pulse border border-[#dfe3e8] bg-white" />}

        {result ? (
          <>
            <Metrics result={result} />
            <section className="border border-[#dfe3e8] bg-white">
              <div className="flex flex-col gap-3 border-b border-[#e5e8ec] px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-[14px] font-black tracking-[-0.025em]">Keyword opportunities</h2>
                    <span className="bg-[#eef1f4] px-2 py-0.5 text-[9px] font-black text-[#626b78]">{filteredRows.length.toLocaleString()}</span>
                  </div>
                  <p className="mt-0.5 text-[10px] text-[#7c8490]">{result.query} · {databaseName(result.database)} · {capitalize(result.matchType)} match</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <label className="flex h-9 min-w-[210px] items-center border border-[#d9dde3] bg-[#fafbfc] px-3">
                    <Search size={13} className="mr-2 text-[#8c94a0]" />
                    <input
                      value={tableQuery}
                      onChange={(event) => {
                        setTableQuery(event.target.value)
                        setPage(1)
                      }}
                      placeholder="Filter keywords"
                      className="min-w-0 flex-1 bg-transparent text-[10.5px] font-semibold outline-none"
                    />
                  </label>
                  <select
                    value={intentFilter}
                    onChange={(event) => {
                      setIntentFilter(event.target.value)
                      setPage(1)
                    }}
                    className="h-9 border border-[#d9dde3] bg-white px-3 text-[10px] font-bold outline-none"
                  >
                    <option value="all">All intents</option>
                    {intents.map((intent) => (
                      <option key={intent} value={intent}>
                        {capitalize(intent)}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleExportPptx}
                    disabled={exportingPptx}
                    className="flex h-9 items-center gap-1.5 border border-[#fed7aa] bg-[#fffaf5] px-3 text-[10px] font-black text-[#b45309] hover:bg-[#ffedd5] disabled:opacity-50"
                    title="Export 16:9 Widescreen PowerPoint presentation"
                  >
                    {exportingPptx ? (
                      <span className="h-3 w-3 animate-spin border-2 border-[#b45309]/30 border-t-[#b45309]" />
                    ) : (
                      <Presentation size={13} className="text-[#b45309]" />
                    )}
                    PPTX
                  </button>
                  <button
                    type="button"
                    onClick={handleExportPdf}
                    disabled={exportingPdf}
                    className="flex h-9 items-center gap-1.5 border border-[#a7f3d0] bg-[#f0fdf4] px-3 text-[10px] font-black text-[#047857] hover:bg-[#dcfce7] disabled:opacity-50"
                    title="Export executive PDF report"
                  >
                    {exportingPdf ? (
                      <span className="h-3 w-3 animate-spin border-2 border-[#047857]/30 border-t-[#047857]" />
                    ) : (
                      <FileText size={13} className="text-[#047857]" />
                    )}
                    PDF
                  </button>
                  <button
                    type="button"
                    onClick={handleExportCsv}
                    className="flex h-9 items-center gap-1.5 border border-[#d9dde3] bg-white px-3 text-[10px] font-black text-[#424a56] hover:bg-[#f5f6f8]"
                    title="Download dataset as CSV"
                  >
                    <Download size={13} />
                    CSV
                  </button>
                </div>
              </div>
              <KeywordTable rows={visibleRows} />
              <div className="flex items-center justify-between border-t border-[#e5e8ec] px-4 py-3 text-[9.5px] font-bold text-[#707986]">
                <span>Showing {filteredRows.length ? ((page - 1) * PAGE_SIZE) + 1 : 0}–{Math.min(page * PAGE_SIZE, filteredRows.length)} of {filteredRows.length.toLocaleString()}</span>
                <div className="flex items-center gap-1">
                  <button type="button" disabled={page <= 1} onClick={() => setPage(value => Math.max(1, value - 1))} className="flex h-8 w-8 items-center justify-center border border-[#d9dde3] disabled:opacity-35"><ChevronLeft size={13} /></button>
                  <span className="min-w-20 text-center">Page {page} of {pageCount}</span>
                  <button type="button" disabled={page >= pageCount} onClick={() => setPage(value => Math.min(pageCount, value + 1))} className="flex h-8 w-8 items-center justify-center border border-[#d9dde3] disabled:opacity-35"><ChevronRight size={13} /></button>
                </div>
              </div>
            </section>
          </>
        ) : !projectsLoading && (
          <section className="border border-[#dfe3e8] bg-white">
            <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
              <div className="px-6 py-6">
                <p className="text-[9px] font-black uppercase tracking-[0.15em] text-[#0f766e]">How to use it</p>
                <h2 className="mt-2 text-[18px] font-black tracking-[-0.04em]">Find demand before you build content.</h2>
                <p className="mt-2 max-w-2xl text-[11px] font-medium leading-5 text-[#68707d]">Enter a topic your customers search for. You will receive a sortable keyword list showing demand, ranking difficulty, commercial value, intent and seasonal movement.</p>
              </div>
              <div className="grid border-t border-[#e5e8ec] bg-[#fafbfc] sm:grid-cols-3 lg:border-l lg:border-t-0">
                {[
                  ["01", "Choose a market", "Metrics are localized to the selected country."],
                  ["02", "Set the relationship", "Control how closely ideas match your seed."],
                  ["03", "Set the limit", "100 ideas per page, up to 10,000."],
                ].map(([number, title, copy], index) => <div key={number} className={`p-4 ${index ? "border-t border-[#e5e8ec] sm:border-l sm:border-t-0" : ""}`}><span className="text-[9px] font-black text-[#be185d]">{number}</span><p className="mt-2 text-[10.5px] font-black text-[#303743]">{title}</p><p className="mt-1 text-[9px] leading-4 text-[#7c8490]">{copy}</p></div>)}
              </div>
            </div>
          </section>
        )}

        <RecentRuns runs={recentRuns} loading={historyLoading} onOpen={openRun} />
      </main>
    </div>
  )
}

function ControlLabel({ title, detail }: { title: string; detail: string }) {
  return <div className="mb-1.5 flex items-center justify-between gap-2"><p className="text-[8.5px] font-black uppercase tracking-[0.11em] text-[#626b77]">{title}</p><span className="truncate text-[8px] font-semibold text-[#9299a3]">{detail}</span></div>
}

function CountryDatabaseControl({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const rootRef = useRef<HTMLDivElement>(null)
  const selected = DATABASES.find(([code]) => code === value) ?? DATABASES[0]
  const filtered = DATABASES.filter(([code, name]) => `${code} ${name}`.toLowerCase().includes(query.trim().toLowerCase()))

  useEffect(() => {
    function close(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", close)
    return () => document.removeEventListener("mousedown", close)
  }, [])

  return <div ref={rootRef} className="relative px-4 py-3">
    <ControlLabel title="Country database" detail="Localized metrics" />
    <button type="button" onClick={() => setOpen(current => !current)} className="flex h-11 w-full items-center gap-2.5 border border-[#d4d9df] bg-white px-3 text-left outline-none hover:border-[#aeb6c0] focus:border-[#0f766e]">
      <CountryFlag code={selected[0]} name={selected[1]} />
      <span className="min-w-0 flex-1 truncate text-[11px] font-black">{selected[1]}</span>
      <span className="text-[8px] font-black uppercase text-[#9299a3]">{selected[0]}</span>
      <ChevronDown size={13} className={`text-[#7d8590] transition ${open ? "rotate-180" : ""}`} />
    </button>
    {open && <div className="absolute left-4 right-4 top-[78px] z-30 border border-[#cfd5dc] bg-white shadow-[0_18px_45px_-18px_rgba(15,23,42,0.4)]">
      <div className="border-b border-[#e3e6ea] p-2"><label className="flex h-9 items-center border border-[#d8dde3] bg-[#fafbfc] px-2.5"><Search size={12} className="mr-2 text-[#8b939e]" /><input autoFocus value={query} onChange={event => setQuery(event.target.value)} placeholder="Search 47 markets" className="min-w-0 flex-1 bg-transparent text-[10px] font-semibold outline-none" /></label></div>
      <div className="max-h-64 overflow-y-auto p-1">{filtered.map(([code, name]) => <button key={code} type="button" onClick={() => { onChange(code); setOpen(false); setQuery("") }} className={`flex w-full items-center gap-2.5 px-2.5 py-2 text-left hover:bg-[#f4f6f7] ${code === value ? "bg-[#e9f6f4]" : ""}`}><CountryFlag code={code} name={name} /><span className="min-w-0 flex-1 truncate text-[10.5px] font-bold">{name}</span><span className="text-[8px] font-black uppercase text-[#9aa1aa]">{code}</span>{code === value && <Check size={12} className="text-[#0f766e]" />}</button>)}</div>
    </div>}
  </div>
}

function CountryFlag({ code, name }: { code: string; name: string }) {
  const iso = code === "uk" ? "gb" : code
  return <img src={countryFlagUrl(iso)} alt={`${name} flag`} className="h-[15px] w-5 shrink-0 object-cover shadow-[0_0_0_1px_rgba(15,23,42,0.12)]" />
}

function Metrics({ result }: { result: KeywordResearchPayload }) {
  const metrics = [
    { label: "Keyword ideas", value: compact(result.summary.returnedKeywords), note: "returned in this dataset", icon: Sparkles, color: "#0f766e", bg: "#ecf8f6" },
    { label: "Total search demand", value: compact(result.summary.totalSearchVolume), note: "combined monthly searches", icon: TrendingUp, color: "#be185d", bg: "#fdf2f8" },
    { label: "Average difficulty", value: result.summary.averageDifficulty == null ? "—" : `${result.summary.averageDifficulty}%`, note: "ranking competition", icon: Target, color: "#b45309", bg: "#fffbeb" },
    { label: "Average CPC", value: result.summary.averageCpc == null ? "—" : money(result.summary.averageCpc), note: "commercial search value", icon: BarChart3, color: "#52525b", bg: "#f4f4f5" },
  ]
  return <section className="grid border border-[#dfe3e8] bg-white sm:grid-cols-2 xl:grid-cols-4">{metrics.map((metric, index) => { const Icon = metric.icon; return <div key={metric.label} className={`flex items-center gap-3 px-4 py-4 ${index ? "border-t border-[#e5e8ec] sm:border-l sm:border-t-0" : ""}`}><span className="flex h-9 w-9 shrink-0 items-center justify-center" style={{ background: metric.bg, color: metric.color }}><Icon size={16} /></span><div><p className="text-[8.5px] font-black uppercase tracking-[0.1em] text-[#858d99]">{metric.label}</p><p className="mt-0.5 text-[21px] font-black tracking-[-0.04em] tabular-nums">{metric.value}</p><p className="text-[9px] font-medium text-[#8b93a0]">{metric.note}</p></div></div> })}</section>
}

function KeywordTable({ rows }: { rows: KeywordResearchRow[] }) {
  return <div className="overflow-x-auto"><table className="w-full min-w-[1160px] border-collapse text-left"><thead><tr className="bg-[#f7f8fa] text-[8.5px] font-black uppercase tracking-[0.09em] text-[#7b8491]"><th className="border-r border-[#e2e6ea] px-4 py-3">Keyword</th><th className="px-3 py-3">Intent</th><th className="px-3 py-3 text-right">Volume</th><th className="px-3 py-3">Difficulty</th><th className="px-3 py-3 text-right">CPC</th><th className="px-3 py-3">Competition</th><th className="px-3 py-3">SERP features</th><th className="px-4 py-3">12-month trend</th></tr></thead><tbody className="divide-y divide-[#e8ebee]">{rows.map(row => <tr key={row.keyword} className="group hover:bg-[#fbfcfd]"><td className="border-r border-[#edf0f2] px-4 py-3"><p className="max-w-[340px] truncate text-[11px] font-black text-[#202632]" title={row.keyword}>{row.keyword}</p></td><td className="px-3 py-3"><Intent intent={row.intent} /></td><td className="px-3 py-3 text-right text-[10.5px] font-black tabular-nums">{nullableCompact(row.searchVolume)}</td><td className="px-3 py-3"><Difficulty value={row.keywordDifficulty} /></td><td className="px-3 py-3 text-right text-[10.5px] font-bold tabular-nums">{row.cpc == null ? "—" : money(row.cpc)}</td><td className="px-3 py-3 text-[9.5px] font-bold text-[#626b77]">{competition(row.competition)}</td><td className="max-w-[260px] px-3 py-3"><div className="flex max-w-[250px] gap-1 overflow-hidden">{row.serpFeatures.length ? row.serpFeatures.slice(0, 3).map(feature => <span key={feature} className="shrink-0 border border-[#dfe3e8] bg-[#fafbfc] px-1.5 py-0.5 text-[8px] font-bold text-[#626b77]">{feature}</span>) : <span className="text-[9px] text-[#a0a6af]">—</span>}</div></td><td className="px-4 py-3"><Trend values={row.trend} /></td></tr>)}</tbody></table>{!rows.length && <div className="flex h-36 items-center justify-center text-[11px] font-semibold text-[#8b93a0]">No keywords match the current filters.</div>}</div>
}

function RecentRuns({ runs, loading, onOpen }: { runs: KeywordResearchPayload[]; loading: boolean; onOpen: (run: KeywordResearchPayload) => void }) {
  if (!loading && !runs.length) return null
  return <section className="border border-[#dfe3e8] bg-white"><div className="flex items-center justify-between border-b border-[#e5e8ec] px-4 py-3"><div><h2 className="flex items-center gap-2 text-[12px] font-black"><Clock3 size={14} className="text-[#0f766e]" /> Recent keyword datasets</h2><p className="mt-0.5 text-[9.5px] text-[#858d99]">Reopen completed research without running it again.</p></div><span className="bg-[#f0f2f4] px-2 py-1 text-[8.5px] font-black text-[#69727e]">{runs.length} saved</span></div>{loading ? <div className="h-24 animate-pulse bg-[#fafbfc]" /> : <div className="divide-y divide-[#e8ebee]">{runs.map(run => <button key={run.snapshot.id} type="button" onClick={() => onOpen(run)} className="grid w-full grid-cols-[minmax(0,1fr)_110px_110px_150px_26px] items-center gap-3 px-4 py-3 text-left hover:bg-[#fafbfc]"><div className="min-w-0"><p className="truncate text-[11px] font-black">{run.query}</p><div className="mt-1 flex items-center gap-1.5 text-[8.5px] font-semibold text-[#8a929e]"><CountryFlag code={run.database} name={databaseName(run.database)} /><span>{databaseName(run.database)} · {capitalize(run.matchType)}</span></div></div><span className="text-right text-[10px] font-black tabular-nums">{compact(run.summary.returnedKeywords)}</span><span className="text-right text-[10px] font-black tabular-nums">{compact(run.summary.totalSearchVolume)}</span><span className="text-right text-[9px] font-semibold text-[#7c8490]">{formatDate(run.snapshot.fetchedAt)}</span><ChevronRight size={14} className="text-[#a2a8b1]" /></button>)}</div>}</section>
}

function Intent({ intent }: { intent: string | null }) { const value = normalizeIntent(intent); const styles: Record<string, string> = { informational: "bg-[#ecf8f6] text-[#0f766e]", commercial: "bg-[#fdf2f8] text-[#be185d]", transactional: "bg-[#fff7ed] text-[#b45309]", navigational: "bg-[#f4f4f5] text-[#52525b]" }; return value ? <span className={`px-2 py-1 text-[8px] font-black uppercase tracking-[0.06em] ${styles[value] || styles.navigational}`}>{value}</span> : <span className="text-[#a0a6af]">—</span> }
function Difficulty({ value }: { value: number | null }) { if (value == null) return <span className="text-[#a0a6af]">—</span>; const color = value >= 70 ? "#e11d48" : value >= 40 ? "#ca8a04" : "#0f766e"; return <div className="flex items-center gap-2"><span className="w-7 text-right text-[10px] font-black tabular-nums" style={{ color }}>{Math.round(value)}</span><span className="h-1.5 w-14 bg-[#e9ecef]"><span className="block h-full" style={{ width: `${Math.min(100, value)}%`, background: color }} /></span></div> }
function Trend({ values }: { values: number[] }) { if (values.length < 2) return <span className="text-[9px] text-[#a0a6af]">No trend</span>; const width = 104, height = 28, min = Math.min(...values), max = Math.max(...values), spread = max - min || 1; const points = values.map((value, index) => `${(index / (values.length - 1)) * width},${height - 3 - ((value - min) / spread) * (height - 7)}`).join(" "); return <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Twelve month search trend"><polyline points={points} fill="none" stroke="#0f766e" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" /></svg> }

function normalizeIntent(value: string | null) { return (value || "").trim().toLowerCase() }
function competition(value: number | string | null) { if (value == null) return "—"; if (typeof value === "number") return value <= 1 ? `${Math.round(value * 100)}%` : String(Math.round(value)); return capitalize(value) }
function compact(value: number) { if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`; if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`; return Math.round(value).toLocaleString() }
function nullableCompact(value: number | null) { return value == null ? "—" : compact(value) }
function money(value: number) { return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(value) }
function capitalize(value: string) { return value ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase() : value }
function databaseName(code: string) { return DATABASES.find(item => item[0] === code)?.[1] || code.toUpperCase() }
function formatDate(value: string) { return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value)) }
