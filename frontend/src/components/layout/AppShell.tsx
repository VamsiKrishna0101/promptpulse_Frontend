import { useRef, useState, useEffect } from "react"
import type { ReactNode } from "react"
import { useLocation, useNavigate, useSearchParams } from "react-router-dom"
import { Sidebar } from "./Sidebar"
import { ProjectsProvider, useProjects } from "@/hooks/useProjects"
import { DAYS_OPTIONS, MODEL_OPTIONS, useFilterOptions } from "@/hooks/useFilters"
import { SaraFloatingAssistant } from "@/components/sara/SaraFloatingAssistant"
import { Bot, Calendar, FolderOpen, ChevronDown, Check } from "lucide-react"
import { downloadCsvExport, type ExportResource } from "@/lib/exportDownload"
import { exportOverviewCsv, exportOverviewPdf } from "@/lib/overviewReportExport"
import { ProductTourProvider } from "@/features/product-tour/ProductTourProvider"
import { TodayRunStatus } from "@/components/status/TodayRunStatus"

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

  const MODEL_ICONS: Record<string, string> = {
    chatgpt: "chatgpt.com",
    gemini: "gemini.google.com",
    perplexity: "perplexity.ai",
    claude: "claude.ai",
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className={[
          "flex h-7 items-center gap-1.5 rounded-lg border px-2.5 text-[12px] font-medium transition-colors duration-100 select-none",
          active
            ? "bg-zinc-950 text-white border-zinc-950 shadow-[0_1px_2px_rgba(0,0,0,0.12)]"
            : "bg-[#f6f6f7] text-zinc-600 border-zinc-200 hover:border-zinc-300 hover:bg-white shadow-[0_1px_1px_rgba(0,0,0,0.04)]",
        ].join(" ")}
      >
        <span className={active ? "text-zinc-300" : "text-zinc-400"}>
          {isModelFilter && selected?.value && MODEL_ICONS[selected.value]
            ? <img src={`https://www.google.com/s2/favicons?domain=${MODEL_ICONS[selected.value]}&sz=32`} width={13} height={13} className="rounded-[2px]" alt="" />
            : icon}
        </span>
        {selected ? selected.label : allLabel}
        <ChevronDown size={11} className={active ? "text-zinc-400" : "text-zinc-400"} />
      </button>

      {open && (
        <div className="absolute left-0 top-[calc(100%+4px)] z-50 min-w-[160px] rounded-xl border border-zinc-200 bg-white py-1 shadow-[0_4px_20px_rgba(0,0,0,0.10)]">
          <button
            onClick={() => pick("")}
            className="flex w-full items-center justify-between px-3 py-1.5 text-[12px] font-medium text-zinc-600 hover:bg-zinc-50"
          >
            <span>{allLabel}</span>
            {!current && <Check size={11} className="text-zinc-800" />}
          </button>
          {options.map(opt => (
            <button
              key={opt.value}
              onClick={() => pick(opt.value)}
              className="flex w-full items-center gap-2 px-3 py-1.5 text-[12px] font-medium text-zinc-700 hover:bg-zinc-50"
            >
              {isModelFilter && MODEL_ICONS[opt.value] && (
                <img src={`https://www.google.com/s2/favicons?domain=${MODEL_ICONS[opt.value]}&sz=32`} width={13} height={13} className="rounded-[2px]" alt="" />
              )}
              <span className="flex-1 text-left">{opt.label}</span>
              {current === opt.value && <Check size={11} className="text-zinc-800" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function BrandFilterIcon({ domain, name }: { domain?: string | null; name: string }) {
  const [failed, setFailed] = useState(false)
  const logoDomain = domain?.trim() || "refractone.com"
  const logoSrc = failed ? "/favicon.svg" : `https://www.google.com/s2/favicons?domain=${encodeURIComponent(logoDomain)}&sz=32`

  useEffect(() => {
    setFailed(false)
  }, [logoDomain])

  return (
    <span className="flex h-4 w-4 items-center justify-center overflow-hidden rounded-[4px] bg-white">
      <img
        src={logoSrc}
        alt={`${name} logo`}
        className="h-3.5 w-3.5 object-contain"
        onError={() => setFailed(true)}
      />
    </span>
  )
}

function AppShellContent({ children }: { children: ReactNode }) {
  const { projects, selectedProject, isLoading } = useProjects()
  const [searchParams, setSearchParams] = useSearchParams()
  const location = useLocation()
  const navigate = useNavigate()
  const mainRef = useRef<HTMLElement>(null)
  const filterOptions = useFilterOptions()

  const topicOptions: DropdownOption[] = filterOptions.topics.map(t => ({ label: t, value: t }))
  const exportResource = EXPORT_RESOURCE_BY_PATH[location.pathname]
  const filtersEnabled = FILTER_ENABLED_PATHS.has(location.pathname)
  const filterQuery = searchParams.toString() ? `?${searchParams.toString()}` : ""
  const hideSaraAssistant = ["/chat", "/settings", "/profile", "/subscription", "/help", "/ai-workspace"].includes(location.pathname) || location.pathname.startsWith("/admin")

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0, left: 0, behavior: "auto" })
  }, [location.pathname])

  useEffect(() => {
    if (!isLoading && projects.length === 0) {
      navigate("/onboarding", { replace: true })
    }
  }, [isLoading, navigate, projects.length])

  return (
    <div className="app-premium-shell flex h-screen overflow-hidden">
      {/* Sidebar */}
      <div className="hidden h-screen flex-shrink-0 lg:flex">
        <Sidebar />
      </div>

      {/* Main */}
      <div className="flex h-screen min-w-0 flex-1 flex-col overflow-hidden">

        {/* Top filters */}
        <div className="premium-topbar z-40 flex-shrink-0">
          {/* Filter bar */}
          {filtersEnabled && (
            <div data-product-tour-id="top-filters" className="premium-filterbar flex items-center gap-2 px-6 py-3">
              {/* Brand chip — static, always active */}
              <button className="flex h-7 items-center gap-1.5 rounded-lg border border-zinc-950 bg-zinc-950 px-2.5 text-[12px] font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.12)]">
                <BrandFilterIcon
                  domain={selectedProject?.brand_url}
                  name={selectedProject?.brand_name ?? "Project"}
                />
                {selectedProject?.brand_name ?? "No Project"}
              </button>

              {/* Time range */}
              <FilterDropdown
                icon={<Calendar size={13} />}
                options={DAYS_OPTIONS}
                paramKey="days"
                allLabel="All Time"
              />

              {/* Topics */}
              <FilterDropdown
                icon={<FolderOpen size={13} />}
                options={topicOptions}
                paramKey="topic"
                allLabel="All Topics"
              />

              {/* Models */}
              <FilterDropdown
                icon={<Bot size={13} />}
                options={MODEL_OPTIONS.filter(o => o.value !== "")}
                paramKey="model"
                allLabel="All Models"
                isModelFilter
              />

              {/* Clear all — shown when any filter is active */}
              {(searchParams.has("days") || searchParams.has("model") || searchParams.has("topic")) && (
                <button
                  onClick={() => setSearchParams({}, { replace: true })}
                  className="ml-1 text-[11px] font-medium text-zinc-400 hover:text-zinc-700 transition-colors"
                >
                  Clear all
                </button>
              )}

              {selectedProject && (
                <div className="ml-1">
                  <TodayRunStatus project={selectedProject} />
                </div>
              )}

              <div className="ml-auto flex items-center gap-1.5">
                {/* PDF export — all resources */}
                {exportResource && (
                  <button
                    type="button"
                    onClick={() => {
                      if (exportResource === "overview") {
                        void exportOverviewPdf(selectedProject, filterQuery)
                      } else {
                        void downloadCsvExport(selectedProject?.id ?? null, exportResource, filterQuery, "pdf")
                      }
                    }}
                    className="flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-[12px] font-semibold text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-rose-500">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                      <line x1="16" y1="13" x2="8" y2="13"/>
                      <line x1="16" y1="17" x2="8" y2="17"/>
                      <polyline points="10 9 9 9 8 9"/>
                    </svg>
                    PDF
                  </button>
                )}
                {/* CSV export — all resources */}
                {exportResource && (
                  <button
                    type="button"
                    onClick={() => {
                      if (exportResource === "overview") {
                        void exportOverviewCsv(selectedProject, filterQuery)
                        return
                      }
                      void downloadCsvExport(selectedProject?.id ?? null, exportResource, filterQuery)
                    }}
                    className="flex h-8 items-center gap-1.5 rounded-lg bg-slate-950 px-3 text-[12px] font-semibold text-white shadow-[0_8px_16px_-8px_rgba(15,23,42,0.5)] transition hover:bg-slate-800"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="7 10 12 15 17 10"/>
                      <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    CSV
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Page content */}
        <main ref={mainRef} className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <div className="mx-auto max-w-[1440px]">
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
