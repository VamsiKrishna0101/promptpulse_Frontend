import type { ReportViewModel } from "../utils/reportMapper"
import { CompetitorTable } from "../components/CompetitorTable"
import { ScoreBreakdown } from "../components/ScoreBreakdown"
import { TrendingUp, AlertCircle, Users } from "lucide-react"

export function VisibilityTab({ report }: { report: ReportViewModel }) {
  return (
    <div className="flex flex-col gap-3">
      <section className="rounded-2xl border border-[#e4e4e7] bg-[#fafafa] p-4 shadow-[0_1px_3px_rgba(9,9,11,0.05)]">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#71717a]">
          Visibility Score
        </p>

        <p className="mb-3 max-w-5xl text-[13px] font-medium leading-[1.5] text-[#52525b]">
          {report.visibility.explanation}
        </p>

        <ScoreBreakdown components={report.visibility.components} />
      </section>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <section className="relative overflow-hidden rounded-2xl border border-[#e4e4e7] bg-[#fafafa] p-4 shadow-[0_1px_3px_rgba(9,9,11,0.05)]">
          <div className="absolute inset-y-0 left-0 w-[3px] bg-emerald-500" />

          <div className="mb-3 flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700">
              <TrendingUp size={14} strokeWidth={2.1} />
            </div>

            <h3 className="text-[13.5px] font-semibold text-[#18181b]">
              Strongest Area
            </h3>
          </div>

          <p className="text-[13px] font-medium leading-[1.6] text-[#52525b]">
            {report.visibility.strongest}
          </p>
        </section>

        <section className="relative overflow-hidden rounded-2xl border border-[#e4e4e7] bg-[#fafafa] p-4 shadow-[0_1px_3px_rgba(9,9,11,0.05)]">
          <div className="absolute inset-y-0 left-0 w-[3px] bg-red-500" />

          <div className="mb-3 flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-700">
              <AlertCircle size={14} strokeWidth={2.1} />
            </div>

            <h3 className="text-[13.5px] font-semibold text-[#18181b]">
              Weakest Area
            </h3>
          </div>

          <p className="text-[13px] font-medium leading-[1.6] text-[#52525b]">
            {report.visibility.weakest}
          </p>
        </section>
      </div>

      <section className="rounded-2xl border border-[#e4e4e7] bg-[#fafafa] p-4 shadow-[0_1px_3px_rgba(9,9,11,0.05)]">
        <div className="mb-4 flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#09090b] text-white">
            <Users size={14} strokeWidth={2.1} />
          </div>

          <div>
            <h3 className="text-[13.5px] font-semibold text-[#18181b]">
              Share of Voice & Competitors
            </h3>

            <p className="text-[12px] font-medium text-[#71717a]">
              How frequently you appear vs alternatives.
            </p>
          </div>
        </div>

        <CompetitorTable competitors={report.intelligence.competitors} />
      </section>
    </div>
  )
}
