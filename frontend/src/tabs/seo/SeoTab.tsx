import { useMemo, useState } from "react"
import { Bot, ChevronLeft, FileText, Globe2, MapPin, ShieldCheck, Sparkles } from "lucide-react"
import { useProjects } from "@/hooks/useProjects"
import { useSeoAudit } from "@/hooks/useSeoAudit"
import { Sk } from "@/tabs/overview/overview"
import { SeoActionsPanel, SeoContentPlanPanel, SeoLocalChecklistPanel } from "./components/SeoActionPanels"
import { SeoAuditGenerating } from "./components/SeoAuditGenerating"
import { SeoEmptyState } from "./components/SeoEmptyState"
import { SeoHero } from "./components/SeoHero"
import { SeoIssuesPanel } from "./components/SeoIssuesPanel"
import { SeoKeywordIntelligence } from "./components/SeoKeywordIntelligence"
import { SeoMetricCard, SeoScoreCard } from "./components/SeoMetricCard"
import { SeoPagesPanel } from "./components/SeoPagesPanel"
import { SeoReportHistory } from "./components/SeoReportHistory"
import { SeoScanSummary } from "./components/SeoScanSummary"
import { SeoSectionNav } from "./components/SeoSectionNav"
import type { SeoSection } from "./lib/seoSections"

export function SeoTab() {
  const { selectedProject } = useProjects()
  const projectId = selectedProject?.id ?? null
  const { audit, intelligence, costs, history, isLoading, isRunning, error, run, loadAudit, clearAudit } = useSeoAudit(projectId)
  const [activeSection, setActiveSection] = useState<SeoSection>("summary")

  const counts = useMemo(() => {
    if (!audit) return { high: 0, medium: 0, actions: 0 }
    return {
      high: audit.issues.filter(issue => issue.severity === "HIGH").length,
      medium: audit.issues.filter(issue => issue.severity === "MEDIUM").length,
      actions: audit.actions.length,
    }
  }, [audit])

  if (isRunning) {
    return (
      <div data-product-tour-id="seo-shell" className="pb-10">
        <SeoAuditGenerating />
      </div>
    )
  }

  return (
    <div data-product-tour-id="seo-shell" className="flex flex-col gap-4 pb-10">
      {audit && (
        <button
          type="button"
          onClick={clearAudit}
          className="inline-flex w-fit items-center gap-1.5 rounded-lg px-2 py-1.5 text-[12px] font-bold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
        >
          <ChevronLeft size={14} /> Back to reports
        </button>
      )}

      <SeoHero
        audit={audit}
        costs={costs}
        isRunning={isRunning}
        canRun={Boolean(projectId)}
        onRunFull={() => void run({ mode: "full" })}
      />

      {error && (
        <div className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-[12.5px] font-bold text-rose-600">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="grid gap-3 md:grid-cols-3">
          <Sk cls="h-40 rounded-2xl" />
          <Sk cls="h-40 rounded-2xl" />
          <Sk cls="h-40 rounded-2xl" />
        </div>
      ) : !audit ? (
        <>
          <SeoEmptyState costs={costs} isRunning={isRunning} onRun={(mode) => void run({ mode })} />
          {history.length > 0 && (
            <div className="mt-2">
              <SeoReportHistory history={history} onSelect={(id) => void loadAudit(id)} />
            </div>
          )}
        </>
      ) : (
        <>
          <SeoSectionNav active={activeSection} onChange={setActiveSection} />

          {activeSection === "summary" && (
            <>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
                <SeoScoreCard label="Overall" score={audit.overall_score} icon={<Sparkles size={14} />} />
                <SeoScoreCard label="Technical" score={audit.technical_score} icon={<ShieldCheck size={14} />} />
                <SeoScoreCard label="AI readiness" score={audit.ai_readiness_score} icon={<Bot size={14} />} />
                <SeoScoreCard label="Local" score={audit.local_score} icon={<MapPin size={14} />} />
                <SeoScoreCard label="Content" score={audit.content_score} icon={<FileText size={14} />} />
                <SeoScoreCard label="Schema" score={audit.schema_score} icon={<Globe2 size={14} />} />
              </div>
              <SeoScanSummary audit={audit} />
              <div className="grid gap-3 md:grid-cols-3">
                <SeoMetricCard label="High priority" value={counts.high} />
                <SeoMetricCard label="Medium issues" value={counts.medium} />
                <SeoMetricCard label="Actions ready" value={counts.actions} />
              </div>
            </>
          )}

          {activeSection === "keyword-map" && <SeoKeywordIntelligence intelligence={intelligence} />}

          {activeSection === "content-plan" && (
            <div className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
              <SeoContentPlanPanel intelligence={intelligence} />
              <SeoActionsPanel audit={audit} />
            </div>
          )}

          {activeSection === "local-seo" && <SeoLocalChecklistPanel intelligence={intelligence} />}

          {activeSection === "technical-health" && (
            <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
              <SeoIssuesPanel audit={audit} />
              <SeoActionsPanel audit={audit} />
            </div>
          )}

          {activeSection === "crawled-pages" && <SeoPagesPanel audit={audit} />}
        </>
      )}
    </div>
  )
}
