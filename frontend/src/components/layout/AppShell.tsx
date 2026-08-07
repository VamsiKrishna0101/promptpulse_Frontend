import { useRef, useState, useEffect } from "react"
import type { ReactNode } from "react"
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom"
import { Sidebar } from "./Sidebar"
import { ProjectsProvider, useProjects } from "@/hooks/useProjects"
import { DAYS_OPTIONS, MODEL_OPTIONS, useFilterOptions } from "@/hooks/useFilters"
import { useSubscription } from "@/hooks/useSubscription"
import { SaraFloatingAssistant } from "@/components/sara/SaraFloatingAssistant"
import { Bot, Calendar, FolderOpen, ChevronDown, Check, Coins, Globe2, Tag, SlidersHorizontal, Sparkles, CircleCheck, Quote } from "lucide-react"
import { downloadCsvExport, type ExportResource } from "@/lib/exportDownload"
import { ProductTourProvider } from "@/features/product-tour/ProductTourProvider"
import { TodayRunStatus } from "@/components/status/TodayRunStatus"
import { MODEL_ICON_DOMAINS, modelIconUrl } from "@/lib/aiModels"
import { useToast } from "@/components/ui/Toast"
import { useAuth } from "@/hooks/useAuth"
import { api } from "@/lib/api"
import { WorkspaceModeSwitcher } from "@/features/workspace-mode/WorkspaceModeSwitcher"
import { useWorkspaceMode } from "@/features/workspace-mode/useWorkspaceMode"
import { TopClientSwitcher } from "./TopClientSwitcher"
import { ExportDropdown, type ExportFormat } from "./ExportDropdown"

type DropdownOption = { label: string; value: string }

const EXPORT_RESOURCE_BY_PATH: Record<string, ExportResource> = {
  "/dashboard": "overview",
  "/prompts": "prompts",
  "/sources": "sources",
  "/competitors": "competitors",
  "/chat": "chats",
  "/analytics": "web-analytics",
}

const FILTER_ENABLED_PATHS = new Set([
  ...Object.keys(EXPORT_RESOURCE_BY_PATH),
  "/opportunities",
  "/geo-articles",
  "/ai-workspace/content-briefs",
])

function FilterDropdown({
  icon,
  options,
  paramKey,
  allLabel,
  isModelFilter,
}: {
  icon: ReactNode
  options: DropdownOption[]
  paramKey: string
  allLabel: string
  isModelFilter?: boolean
}) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const current = searchParams.get(paramKey) ?? ""
  const selected = options.find(o => o.value === current)
  const active = !!current

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onClickOutside)
    return () => document.removeEventListener("mousedown", onClickOutside)
  }, [])

  function pick(value: string) {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      if (value) next.set(paramKey, value)
      else next.delete(paramKey)
      return next
    }, { replace: true })
    setOpen(false)
  }

  return (
    <div className="relative z-[80] flex-shrink-0" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className={[
          "flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-[12px] font-medium transition-all select-none whitespace-nowrap flex-shrink-0 shadow-[0_1px_2px_rgba(0,0,0,0.04)]",
          active
            ? "border-slate-900 bg-slate-900 text-white shadow-[0_1px_2px_rgba(0,0,0,0.12)]"
            : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50",
        ].join(" ")}
      >
        <span className={active ? "text-white" : "text-slate-500"}>
          {isModelFilter && selected?.value && MODEL_ICON_DOMAINS[selected.value]
            ? <img src={modelIconUrl(selected.value, 64) ?? ""} width={13} height={13} className="rounded-[2px]" alt="" />
            : icon}
        </span>
        <span className="whitespace-nowrap leading-none font-medium max-w-[120px] truncate">
          {selected ? selected.label : allLabel}
        </span>
        <ChevronDown size={11} className={`transition-transform duration-150 ${active ? "text-white" : "text-slate-400"} ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute left-0 top-[calc(100%+5px)] z-[120] min-w-[170px] rounded-xl border border-slate-200 bg-white py-1 shadow-[0_12px_32px_-8px_rgba(15,23,42,0.15)] ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-100">
          <button
            onClick={() => pick("")}
            className="flex w-full items-center justify-between px-3 py-2 text-[12px] font-medium text-slate-600 hover:bg-slate-50"
          >
            <span>{allLabel}</span>
            {!current && <Check size={11} className="text-slate-900 font-bold" />}
          </button>
          {options.map(opt => (
            <button
              key={opt.value}
              onClick={() => pick(opt.value)}
              className="flex w-full items-center gap-2 px-3 py-2 text-[12px] font-medium text-slate-700 hover:bg-slate-50"
            >
              {isModelFilter && MODEL_ICON_DOMAINS[opt.value] && (
                <img src={modelIconUrl(opt.value, 64) ?? ""} width={13} height={13} className="rounded-[2px]" alt="" />
              )}
              <span className="flex-1 text-left truncate">{opt.label}</span>
              {current === opt.value && <Check size={11} className="text-slate-900 font-bold" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function AdvancedFiltersButton({
  activeCount,
  countryOptions,
  intentOptions,
  tagOptions,
}: {
  activeCount: number
  countryOptions: DropdownOption[]
  intentOptions: DropdownOption[]
  tagOptions: DropdownOption[]
}) {
  const [open, setOpen] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onClickOutside)
    return () => document.removeEventListener("mousedown", onClickOutside)
  }, [])

  function pickParam(paramKey: string, value: string) {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      if (value) next.set(paramKey, value)
      else next.delete(paramKey)
      return next
    }, { replace: true })
  }

  function resetAdvanced() {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
        ;["country", "intent", "tag", "mentioned", "cited"].forEach(k => next.delete(k))
      return next
    }, { replace: true })
  }

  return (
    <div className="relative z-[80] flex-shrink-0" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(value => !value)}
        className={[
          "flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-[12px] font-medium transition-all select-none whitespace-nowrap flex-shrink-0 shadow-[0_1px_2px_rgba(0,0,0,0.04)]",
          activeCount > 0
            ? "border-slate-900 bg-slate-900 text-white shadow-[0_1px_2px_rgba(0,0,0,0.12)]"
            : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
        ].join(" ")}
      >
        <SlidersHorizontal size={13} className={activeCount > 0 ? "text-white" : "text-slate-500"} />
        <span className="whitespace-nowrap leading-none font-medium">More filters</span>
        {activeCount > 0 && (
          <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-indigo-500 px-1 text-[10px] font-bold text-white leading-none">
            {activeCount}
          </span>
        )}
        <ChevronDown size={11} className={`transition-transform duration-150 ${activeCount > 0 ? "text-white" : "text-slate-400"} ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute left-0 top-[calc(100%+5px)] z-[120] w-[320px] rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_20px_50px_rgba(15,23,42,0.18)] ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-100">
          <div className="mb-3.5 flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div>
              <p className="text-[12.5px] font-bold text-slate-900">Refine Workspace</p>
              <p className="text-[10.5px] text-slate-400">Granular filters for current view</p>
            </div>
            {activeCount > 0 ? (
              <button
                type="button"
                onClick={resetAdvanced}
                className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 transition"
              >
                Reset ({activeCount})
              </button>
            ) : (
              <Sparkles size={14} className="text-amber-500" />
            )}
          </div>

          <div className="space-y-2.5">
            {/* Markets / Country */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-[12px] font-medium text-slate-600">
                <Globe2 size={13} className="text-slate-400" />
                <span>Market</span>
              </div>
              <select
                value={searchParams.get("country") ?? ""}
                onChange={e => pickParam("country", e.target.value)}
                className="h-7.5 max-w-[170px] truncate rounded-lg border border-slate-200 bg-slate-50 px-2 text-[11.5px] font-medium text-slate-800 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">All Markets</option>
                {countryOptions.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            {/* Search Intent */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-[12px] font-medium text-slate-600">
                <Sparkles size={13} className="text-slate-400" />
                <span>Intent</span>
              </div>
              <select
                value={searchParams.get("intent") ?? ""}
                onChange={e => pickParam("intent", e.target.value)}
                className="h-7.5 max-w-[170px] truncate rounded-lg border border-slate-200 bg-slate-50 px-2 text-[11.5px] font-medium text-slate-800 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">All Intents</option>
                {intentOptions.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            {/* Tags */}
            {tagOptions.length > 0 && (
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-[12px] font-medium text-slate-600">
                  <Tag size={13} className="text-slate-400" />
                  <span>Tag</span>
                </div>
                <select
                  value={searchParams.get("tag") ?? ""}
                  onChange={e => pickParam("tag", e.target.value)}
                  className="h-7.5 max-w-[170px] truncate rounded-lg border border-slate-200 bg-slate-50 px-2 text-[11.5px] font-medium text-slate-800 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">All Tags</option>
                  {tagOptions.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Brand Mentioned */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-[12px] font-medium text-slate-600">
                <CircleCheck size={13} className="text-slate-400" />
                <span>Mentioned</span>
              </div>
              <select
                value={searchParams.get("mentioned") ?? ""}
                onChange={e => pickParam("mentioned", e.target.value)}
                className="h-7.5 max-w-[170px] truncate rounded-lg border border-slate-200 bg-slate-50 px-2 text-[11.5px] font-medium text-slate-800 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">Any mention</option>
                <option value="true">Mentioned</option>
                <option value="false">Not mentioned</option>
              </select>
            </div>

            {/* Citation Status */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-[12px] font-medium text-slate-600">
                <Quote size={13} className="text-slate-400" />
                <span>Cited</span>
              </div>
              <select
                value={searchParams.get("cited") ?? ""}
                onChange={e => pickParam("cited", e.target.value)}
                className="h-7.5 max-w-[170px] truncate rounded-lg border border-slate-200 bg-slate-50 px-2 text-[11.5px] font-medium text-slate-800 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">Any citation</option>
                <option value="true">Cited</option>
                <option value="false">Not cited</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

type RecentTransaction = {
  id: string
  amount: number
  action: string
  description: string | null
  metadata?: any
  created_at: string
}

function formatShortDeduction(tx: RecentTransaction) {
  if (tx.action === "seo_audit" && tx.metadata?.url) {
    return `Audit: ${tx.metadata.url.replace(/^https?:\/\//, "")}`
  }
  const parts = [
    tx.metadata?.successful_checks ? `${tx.metadata.successful_checks} checks` : null,
    tx.metadata?.source === "brightdata_batch" ? "Daily run" : null,
  ].filter(Boolean)
  return parts.length ? parts.join(" · ") : tx.action
}

function CreditsPill() {
  const { data, isLoading: subLoading } = useSubscription()
  const balance = data?.credits_balance ?? 0
  const isLow = data?.low_balance ?? false
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const [deductions, setDeductions] = useState<RecentTransaction[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false)
    }
    document.addEventListener("mousedown", onClickOutside)
    return () => document.removeEventListener("mousedown", onClickOutside)
  }, [])

  useEffect(() => {
    if (!isOpen) return
    setIsLoading(true)
    api.get<{ transactions: RecentTransaction[] }>("/payments/transactions?days=30&type=debit&page=1&limit=5")
      .then(res => setDeductions(res.data.transactions ?? []))
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [isOpen])

  return (
    <div className="relative flex-shrink-0" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        title={subLoading ? "Loading credits" : `${balance.toLocaleString()} credits remaining`}
        className={[
          "flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-[12px] font-semibold transition whitespace-nowrap flex-shrink-0 shadow-[0_1px_2px_rgba(0,0,0,0.04)]",
          isLow
            ? "border-rose-200 bg-rose-50 text-rose-900 hover:bg-rose-100"
            : "border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100",
          isOpen ? "ring-2 ring-slate-900/10" : ""
        ].join(" ")}
      >
        <Coins size={13} className={isLow ? "text-rose-500" : "text-slate-500"} />
        <span className="whitespace-nowrap tabular-nums leading-none">{subLoading ? "Credits" : balance.toLocaleString()}</span>
        <span className="hidden text-slate-500 sm:inline whitespace-nowrap leading-none font-medium">credits</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-72 origin-top-right overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl ring-1 ring-black/5">
          <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Recent deductions</h4>
          </div>

          <div className="max-h-64 overflow-y-auto p-2">
            {isLoading ? (
              <div className="flex h-20 items-center justify-center">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
              </div>
            ) : deductions.length === 0 ? (
              <div className="px-3 py-6 text-center">
                <p className="text-xs font-semibold text-slate-500">No recent deductions.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                {deductions.map(tx => (
                  <div key={tx.id} className="flex items-start justify-between gap-3 rounded-lg p-2 transition hover:bg-slate-50">
                    <div>
                      <p className="text-[13px] font-semibold text-slate-900">{tx.description ?? tx.action}</p>
                      <p className="mt-0.5 text-[11px] text-slate-500">{formatShortDeduction(tx)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[13px] font-bold tabular-nums text-rose-600">{tx.amount}</p>
                      <p className="text-[10px] font-medium text-slate-400">
                        {new Date(tx.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="border-t border-slate-100 bg-slate-50 p-2">
            <Link
              to="/billing"
              onClick={() => setIsOpen(false)}
              className="block w-full rounded-lg bg-white px-3 py-2 text-center text-xs font-bold text-sky-700 shadow-sm transition hover:bg-sky-50"
            >
              View all in billing
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}


function AppShellContent({ children }: { children: ReactNode }) {
  const { projects, selectedProject, isLoading } = useProjects()
  const { isAuthenticated } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const toast = useToast()
  const [exporting, setExporting] = useState<ExportFormat | null>(null)
  const location = useLocation()
  const navigate = useNavigate()
  const mainRef = useRef<HTMLElement>(null)
  const filterOptions = useFilterOptions()
  const { mode, switchWorkspace } = useWorkspaceMode()

  const topicOptions: DropdownOption[] = (filterOptions.topics ?? []).map(t => ({ label: t, value: t }))
  const intentOptions: DropdownOption[] = (filterOptions.intents ?? []).map(t => ({ label: t.replace(/[-_]+/g, " ").replace(/\b\w/g, c => c.toUpperCase()), value: t }))
  const countryOptions: DropdownOption[] = (filterOptions.countries ?? []).map(country => ({ label: country.label, value: country.value }))
  const tagOptions: DropdownOption[] = (filterOptions.tags ?? []).map(t => ({ label: t.replace(/^intent:/, ""), value: t }))
  const exportResource = EXPORT_RESOURCE_BY_PATH[location.pathname]
  const filtersEnabled = FILTER_ENABLED_PATHS.has(location.pathname)
  const filterQuery = searchParams.toString() ? `?${searchParams.toString()}` : ""
  const advancedFilterKeys = ["country", "intent", "tag", "mentioned", "cited"]
  const advancedFilterCount = advancedFilterKeys.filter(key => searchParams.has(key)).length
  const hideSaraAssistant = ["/chat", "/settings", "/profile", "/subscription", "/help", "/ai-workspace"].includes(location.pathname) || location.pathname.startsWith("/admin") || mode === "SEO"

  async function handleExport(format: ExportFormat) {
    if (!selectedProject?.id || !exportResource || exporting) return

    setExporting(format)
    try {
      await downloadCsvExport(selectedProject.id, exportResource, filterQuery, format)
      toast.success(
        format === "pdf" ? "PDF ready" : "PowerPoint ready",
        "Your export has started downloading.",
      )
    } catch (error: any) {
      toast.error("Export failed", error?.message || "We could not prepare this export. Please try again.")
    } finally {
      setExporting(null)
    }
  }

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0, left: 0, behavior: "auto" })
  }, [location.pathname])

  useEffect(() => {
    if (isAuthenticated && !isLoading && projects.length === 0) {
      navigate("/onboarding", { replace: true })
    }
  }, [isAuthenticated, isLoading, navigate, projects.length])

  return (
    <div className="app-premium-shell flex h-screen overflow-hidden">
      {/* Sidebar */}
      <div className="hidden h-screen flex-shrink-0 lg:flex" style={{ background: "#f5f5f5" }}>
        <Sidebar />
      </div>

      {/* Main */}
      <div className="flex h-screen min-w-0 flex-1 flex-col overflow-hidden">

        {/* Top filters */}
        <div className="premium-topbar relative z-[70] min-w-0 flex-shrink-0">
          {/* Filter bar */}
          <div data-product-tour-id="top-filters" className="premium-filterbar flex min-w-0 flex-nowrap items-center justify-between gap-2 overflow-visible px-3 py-1.5 lg:px-4 lg:py-2">

            {/* Zone 1 & 2: Left Switchers & Center Filters */}
            <div className="topbar-controls flex min-w-0 flex-1 flex-nowrap items-center gap-2 overflow-visible scrollbar-none">
              <WorkspaceModeSwitcher mode={mode} onChange={switchWorkspace} />
              <div className="h-4 w-px flex-shrink-0 bg-slate-200" aria-hidden="true" />
              <TopClientSwitcher />

              {filtersEnabled && (
                <>
                  <div className="h-4 w-px flex-shrink-0 bg-slate-200" aria-hidden="true" />

                  {/* Time range */}
                  <FilterDropdown
                    icon={<Calendar size={13} />}
                    options={DAYS_OPTIONS}
                    paramKey="days"
                    allLabel="All Time"
                  />

                  {/* Topics */}
                  {topicOptions.length > 0 && (
                    <FilterDropdown
                      icon={<FolderOpen size={13} />}
                      options={topicOptions}
                      paramKey="topic"
                      allLabel="All Topics"
                    />
                  )}

                  {/* Models */}
                  <FilterDropdown
                    icon={<Bot size={13} />}
                    options={MODEL_OPTIONS.filter(o => o.value !== "")}
                    paramKey="model"
                    allLabel="All Models"
                    isModelFilter
                  />

                  {/* Unified Granular Filters */}
                  <AdvancedFiltersButton
                    activeCount={advancedFilterCount}
                    countryOptions={countryOptions}
                    intentOptions={intentOptions}
                    tagOptions={tagOptions}
                  />

                  {(searchParams.has("days") || searchParams.has("topic") || searchParams.has("model") || advancedFilterCount > 0) && (
                    <button
                      onClick={() => setSearchParams(prev => {
                        const next = new URLSearchParams(prev)
                          ;["days", "topic", "model", ...advancedFilterKeys].forEach(key => next.delete(key))
                        return next
                      }, { replace: true })}
                      className="ml-1 text-[11.5px] font-medium text-slate-400 hover:text-slate-700 transition-colors"
                    >
                      Clear all
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Zone 3: Right Status & Actions */}
            <div className="flex flex-shrink-0 items-center justify-end gap-2">
              {selectedProject && (
                <TodayRunStatus project={selectedProject} />
              )}

              <CreditsPill />

              {/* Compact Unified Export Dropdown */}
              <ExportDropdown
                exportResource={exportResource}
                exporting={exporting}
                onExport={handleExport}
              />
            </div>
          </div>
        </div>

        {/* Page content */}
        <main ref={mainRef} className="premium-main min-h-0 min-w-0 flex-1 overflow-y-auto px-3 py-4 lg:px-4 lg:py-5 xl:px-5">
          <div className="mx-auto min-w-0 max-w-[1440px]">
            {children}
          </div>
        </main>

      </div>
      {!hideSaraAssistant && <SaraFloatingAssistant />}
    </div>
  )
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <ProjectsProvider>
      <ProductTourProvider>
        <AppShellContent>{children}</AppShellContent>
      </ProductTourProvider>
    </ProjectsProvider>
  )
}
