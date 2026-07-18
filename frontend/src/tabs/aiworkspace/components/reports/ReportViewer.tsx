import { useMemo, useState } from "react"
import { ArrowLeft, BarChart3, Bot, Gauge, Sparkles } from "lucide-react"
import type { SavedReportDetail } from "@/lib/aiReportsApi"
import { mapReport } from "./utils/reportMapper"
import { OverviewTab } from "./tabs/OverviewTab"
import { VisibilityTab } from "./tabs/VisibilityTab"
import { IntelligenceTab } from "./tabs/IntelligenceTab"
import { RecommendationsTab } from "./tabs/RecommendationsTab"
import { ReportExportButtons } from "./export/ReportExportButtons"
import { DeltaPill, ScoreRing, toFiniteNumber } from "./components/ReportVisuals"

const TABS = [
  { id: "overview", label: "Overview", icon: Sparkles },
  { id: "visibility", label: "Visibility", icon: Gauge },
  { id: "intelligence", label: "Intelligence", icon: Bot },
  { id: "recommendations", label: "Recommendations", icon: BarChart3 },
] as const

type TabId = (typeof TABS)[number]["id"]

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ")
}

export function ReportViewer({ detail, onBack }: { detail: SavedReportDetail; onBack: () => void }) {
  const [tab, setTab] = useState<TabId>("overview")
  const report = useMemo(() => mapReport(detail), [detail])
  const visibilityScore = toFiniteNumber(report.overallMovement?.visibility_score ?? report.metrics[0]?.value)
  const mentionRate = toFiniteNumber(report.overallMovement?.brand_mention_rate ?? report.metrics[1]?.value)
  const avgPosition = toFiniteNumber(report.overallMovement?.average_position ?? report.metrics[2]?.value)

  return (
    <div className="report-page min-h-0 bg-zinc-50/60 px-4 pb-5 pt-4">
      {/* HEADER */}
      <div className="mb-3 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-[0_18px_60px_-48px_rgba(9,9,11,0.55)]">
        <div className="flex items-center justify-between gap-3 border-b border-zinc-200 px-4 py-2.5">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-[11.5px] font-semibold text-zinc-600 shadow-[0_1px_2px_rgba(9,9,11,0.04)] transition hover:border-zinc-300 hover:text-zinc-950"
          >
            <ArrowLeft size={12} strokeWidth={2.2} />
            Back to reports
          </button>

          <div className="flex items-center gap-3">
            <p className="hidden text-[10.5px] font-semibold uppercase tracking-[0.12em] text-zinc-400 sm:block">
              {report.periodLabel}
            </p>
            <ReportExportButtons report={report} />
          </div>
        </div>

        <div className="relative flex flex-col gap-4 px-5 py-4 md:flex-row md:items-center md:justify-between">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgba(24,24,27,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(24,24,27,0.05) 1px, transparent 1px)",
              backgroundSize: "34px 34px",
              maskImage: "radial-gradient(ellipse 45% 80% at 0% 0%, black 15%, transparent 70%)",
              WebkitMaskImage: "radial-gradient(ellipse 45% 80% at 0% 0%, black 15%, transparent 70%)",
            }}
          />

          <div className="relative flex min-w-0 items-start gap-3.5">
            <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-950 shadow-[0_16px_30px_-18px_rgba(9,9,11,0.65)]">
              <Sparkles size={16} className="text-white" strokeWidth={2.2} />
            </div>

            <div className="min-w-0">
              <div className="mb-1.5 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                  Executive report
                </span>
                {report.overallMovement?.visibility_score_delta !== undefined && (
                  <DeltaPill value={report.overallMovement.visibility_score_delta} />
                )}
              </div>

              <h1 className="text-[19px] font-bold leading-tight tracking-tight text-zinc-950">
                {report.brandName} visibility report
              </h1>
              <p className="mt-1 max-w-xl text-[12.5px] font-medium leading-[1.5] text-zinc-500">
                {report.headline}
              </p>
            </div>
          </div>

          <div className="relative flex shrink-0 items-center gap-5 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 md:pl-5">
            <ScoreRing value={visibilityScore} label="Visibility score" size="sm" />
            <div className="hidden h-10 w-px bg-zinc-200 sm:block" />
            <div className="hidden gap-4 sm:flex">
              <div>
                <p className="text-[9.5px] font-semibold uppercase tracking-[0.12em] text-zinc-400">Mentions</p>
                <p className="mt-0.5 text-[15px] font-semibold tabular-nums text-zinc-950">
                  {mentionRate ?? "NA"}
                  {mentionRate !== null ? "%" : ""}
                </p>
              </div>
              <div>
                <p className="text-[9.5px] font-semibold uppercase tracking-[0.12em] text-zinc-400">Avg pos</p>
                <p className="mt-0.5 text-[15px] font-semibold tabular-nums text-zinc-950">{avgPosition ?? "NA"}</p>
              </div>
              <div>
                <p className="text-[9.5px] font-semibold uppercase tracking-[0.12em] text-zinc-400">Runs</p>
                <p className="mt-0.5 text-[15px] font-semibold tabular-nums text-zinc-950">
                  {report.overallMovement?.total_runs ?? "NA"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="mb-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-1.5 shadow-[0_1px_3px_rgba(9,9,11,0.05)]">
        <div className="grid grid-cols-2 gap-1 lg:grid-cols-4">
          {TABS.map((item) => {
            const Icon = item.icon
            const active = tab === item.id
            return (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-[12.5px] font-semibold transition",
                  active
                    ? "border border-zinc-200 bg-white text-zinc-950 shadow-[0_1px_2px_rgba(9,9,11,0.06)]"
                    : "border border-transparent text-zinc-500 hover:bg-zinc-100 hover:text-zinc-950",
                )}
              >
                <Icon size={14} strokeWidth={2.15} className={active ? "text-amber-600" : "text-zinc-400"} />
                {item.label}
              </button>
            )
          })}
        </div>
      </div>

      {tab === "overview" && <OverviewTab report={report} />}
      {tab === "visibility" && <VisibilityTab report={report} />}
      {tab === "intelligence" && <IntelligenceTab report={report} />}
      {tab === "recommendations" && <RecommendationsTab report={report} />}
    </div>
  )
}
