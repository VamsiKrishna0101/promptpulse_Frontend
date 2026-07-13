import { useMemo, useState } from "react"
import {
  ArrowLeft,
  BarChart3,
  Bot,
  Gauge,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"

import type { SavedReportDetail } from "@/lib/aiReportsApi"
import { mapReport } from "./utils/reportMapper"
import { OverviewTab } from "./tabs/OverviewTab"
import { VisibilityTab } from "./tabs/VisibilityTab"
import { IntelligenceTab } from "./tabs/IntelligenceTab"
import { RecommendationsTab } from "./tabs/RecommendationsTab"
import { ReportExportButtons } from "./export/ReportExportButtons"

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

function isPositiveValue(value: string | number) {
  return String(value).trim().startsWith("+")
}

function isNegativeValue(value: string | number) {
  return String(value).trim().startsWith("-")
}

export function ReportViewer({
  detail,
  onBack,
}: {
  detail: SavedReportDetail
  onBack: () => void
}) {
  const [tab, setTab] = useState<TabId>("overview")
  const report = useMemo(() => mapReport(detail), [detail])

  return (
    <div className="report-page bg-[#f4f4f5] px-4 pb-5 pt-3">
      {/* HEADER */}
      <div className="mb-3 rounded-2xl border border-[#e4e4e7] bg-[#fafafa] shadow-[0_1px_3px_rgba(9,9,11,0.06)]">
        <div className="flex items-center justify-between gap-3 border-b border-[#e4e4e7] px-4 py-2.5">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-lg border border-[#e4e4e7] bg-white px-2.5 py-1.5 text-[11.5px] font-semibold text-[#52525b] shadow-[0_1px_2px_rgba(9,9,11,0.04)] transition hover:border-[#d4d4d8] hover:text-[#18181b]"
          >
            <ArrowLeft size={12} strokeWidth={2.2} />
            Back to reports
          </button>

          <div className="flex items-center gap-3">
            <p className="hidden text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[#a1a1aa] sm:block">
              {report.periodLabel}
            </p>
            <ReportExportButtons report={report} />
          </div>
        </div>

        <div className="flex flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#09090b] shadow-sm">
              <Sparkles size={16} className="text-white" strokeWidth={2.2} />
            </div>

            <div className="min-w-0">
              <h1 className="truncate text-[20px] font-semibold leading-tight tracking-[-0.04em] text-[#18181b]">
                {report.brandName} Visibility Report
              </h1>

              <p className="mt-1 max-w-3xl text-[12.5px] font-medium leading-[1.45] text-[#52525b]">
                {report.headline}
              </p>
            </div>
          </div>

          {report.metrics.length > 0 && (
            <div className="grid shrink-0 grid-cols-2 gap-2 sm:grid-cols-4 lg:max-w-[520px]">
              {report.metrics.map((m) => {
                const positive = isPositiveValue(m.value)
                const negative = isNegativeValue(m.value)
                const isDelta = m.label.toLowerCase().includes("delta")

                return (
                  <div
                    key={m.label}
                    className="min-w-[104px] rounded-xl border border-[#e4e4e7] bg-white px-3 py-2.5 shadow-[0_1px_2px_rgba(9,9,11,0.04)]"
                  >
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <p className="truncate text-[9px] font-semibold uppercase tracking-[0.1em] text-[#a1a1aa]">
                        {m.label}
                      </p>

                      {isDelta && (
                        <span
                          className={cn(
                            "inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                            positive &&
                            "border-emerald-200 bg-emerald-50 text-emerald-700",
                            negative && "border-red-200 bg-red-50 text-red-700",
                            !positive &&
                            !negative &&
                            "border-[#e4e4e7] bg-[#f4f4f5] text-[#52525b]",
                          )}
                        >
                          {positive ? (
                            <ArrowUpRight size={11} strokeWidth={2.4} />
                          ) : negative ? (
                            <ArrowDownRight size={11} strokeWidth={2.4} />
                          ) : (
                            <Sparkles size={10} strokeWidth={2.4} />
                          )}
                        </span>
                      )}
                    </div>

                    <div
                      className={cn(
                        "text-[18px] font-semibold leading-none tracking-[-0.04em] tabular-nums text-[#18181b]",
                        isDelta && positive && "text-emerald-700",
                        isDelta && negative && "text-red-700",
                      )}
                    >
                      {m.value}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* TABS */}
      <div className="mb-3 rounded-2xl border border-[#e4e4e7] bg-[#fafafa] p-1.5 shadow-[0_1px_3px_rgba(9,9,11,0.05)]">
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
                    ? "border border-[#e4e4e7] bg-white text-[#18181b] shadow-[0_1px_2px_rgba(9,9,11,0.06)]"
                    : "border border-transparent text-[#52525b] hover:bg-[#f4f4f5] hover:text-[#18181b]",
                )}
              >
                <Icon
                  size={14}
                  strokeWidth={2.15}
                  className={active ? "text-[#09090b]" : "text-[#a1a1aa]"}
                />
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
