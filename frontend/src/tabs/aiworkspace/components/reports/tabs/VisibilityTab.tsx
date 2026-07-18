import type { ReportViewModel } from "../utils/reportMapper"
import { CompetitorTable } from "../components/CompetitorTable"
import { ScoreBreakdown } from "../components/ScoreBreakdown"
import { TrendingUp, AlertCircle, Users, Gauge, Trophy } from "lucide-react"
import {
  ComparisonBarChart,
  ComponentRadarChart,
  InsightPanel,
  ScoreRing,
  toFiniteNumber,
} from "../components/ReportVisuals"

export function VisibilityTab({ report }: { report: ReportViewModel }) {
  const score = toFiniteNumber(report.overallMovement?.visibility_score)

  const componentRadarData = report.visibility.components
    .map((component) => {
      const value = toFiniteNumber(component.score)
      return value === null ? null : { label: component.component.replace(/_/g, " "), value }
    })
    .filter(Boolean) as Array<{ label: string; value: number }>

  const leaderboardBars = report.leaderboard.slice(0, 6).map((entry) => ({
    label: entry.name,
    value: entry.mention_rate,
    meta: "% SOV",
    tone: entry.type === "own_brand" ? ("good" as const) : ("neutral" as const),
  }))

  return (
    <div className="flex flex-col gap-3">
      <div className="grid gap-3 xl:grid-cols-[360px_minmax(0,1fr)]">
        <section className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-[0_1px_3px_rgba(9,9,11,0.05)]">
          <ScoreRing
            value={score}
            label="Visibility score"
            caption={report.visibility.explanation || "Overall visibility quality for this reporting period."}
          />

          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-2.5">
              <p className="text-[9.5px] font-semibold uppercase tracking-[0.12em] text-zinc-400">Mention rate</p>
              <p className="mt-1 text-[20px] font-semibold tracking-[-0.05em] text-zinc-950">
                {report.overallMovement?.brand_mention_rate ?? "NA"}%
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-2.5">
              <p className="text-[9.5px] font-semibold uppercase tracking-[0.12em] text-zinc-400">Avg position</p>
              <p className="mt-1 text-[20px] font-semibold tracking-[-0.05em] text-zinc-950">
                {report.overallMovement?.average_position ?? "NA"}
              </p>
            </div>
          </div>
        </section>

        <InsightPanel icon={Gauge} eyebrow="Score drivers" title="Component contribution">
          <ComponentRadarChart items={componentRadarData} />
        </InsightPanel>
      </div>

      <ScoreBreakdown components={report.visibility.components} />

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <section className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50 p-4 shadow-[0_1px_3px_rgba(9,9,11,0.05)]">
          <div className="absolute inset-y-0 left-0 w-[3px] bg-emerald-500" />
          <div className="mb-3 flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl ring-1 ring-inset ring-emerald-100 bg-emerald-50 text-emerald-700">
              <TrendingUp size={14} strokeWidth={2.1} />
            </div>
            <h3 className="text-[13.5px] font-semibold text-zinc-950">Strongest area</h3>
          </div>
          <p className="text-[13px] font-medium leading-[1.6] text-zinc-600">{report.visibility.strongest}</p>
        </section>

        <section className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50 p-4 shadow-[0_1px_3px_rgba(9,9,11,0.05)]">
          <div className="absolute inset-y-0 left-0 w-[3px] bg-red-500" />
          <div className="mb-3 flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl ring-1 ring-inset ring-red-100 bg-red-50 text-red-700">
              <AlertCircle size={14} strokeWidth={2.1} />
            </div>
            <h3 className="text-[13.5px] font-semibold text-zinc-950">Weakest area</h3>
          </div>
          <p className="text-[13px] font-medium leading-[1.6] text-zinc-600">{report.visibility.weakest}</p>
        </section>
      </div>

      {leaderboardBars.length > 0 && (
        <InsightPanel icon={Trophy} eyebrow="Competitive map" title="Share of voice comparison">
          <ComparisonBarChart items={leaderboardBars} />
        </InsightPanel>
      )}

      <section className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 shadow-[0_1px_3px_rgba(9,9,11,0.05)]">
        <div className="mb-4 flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-950 text-white">
            <Users size={14} strokeWidth={2.1} />
          </div>
          <div>
            <h3 className="text-[13.5px] font-semibold text-zinc-950">Share of voice and competitors</h3>
            <p className="text-[12px] font-medium text-zinc-500">How frequently you appear vs alternatives.</p>
          </div>
        </div>
        <CompetitorTable competitors={report.intelligence.competitors} />
      </section>
    </div>
  )
}
