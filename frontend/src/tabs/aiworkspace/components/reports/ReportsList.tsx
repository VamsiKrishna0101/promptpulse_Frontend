import { CalendarDays, CheckCircle2, ChevronRight, Clock3, FileText, Gauge, Sparkles } from "lucide-react"
import type { SavedReportSummary } from "@/lib/aiReportsApi"
import { asRecord, dateLabel, periodLabel, text } from "./utils/reportHelpers"
import { ScoreRing, toFiniteNumber } from "./components/ReportVisuals"

function statusStyle(status: string) {
  const normalized = status.toLowerCase()
  if (normalized === "done" || normalized === "completed") return "border-emerald-200 bg-emerald-50 text-emerald-700"
  if (normalized === "failed") return "border-red-200 bg-red-50 text-red-700"
  return "border-amber-200 bg-amber-50 text-amber-700"
}

function reportHeadline(summary: Record<string, unknown>) {
  return text(
    summary.headline,
    text(summary.summary, "Open the report to review visibility movement, competitor pressure, source gaps, and recommended actions."),
  )
}

export function ReportsList({
  reports,
  isLoading,
  onOpen,
}: {
  reports: SavedReportSummary[]
  isLoading: boolean
  onOpen: (id: string) => void
}) {
  if (isLoading) {
    return (
      <div className="grid min-h-[220px] place-items-center rounded-3xl border border-zinc-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.03)]">
        <div className="text-center">
          <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-zinc-950 text-white">
            <Clock3 size={18} />
          </div>
          <p className="text-[13px] font-semibold text-zinc-800">Loading reports...</p>
          <p className="mt-1 text-[12px] font-medium text-zinc-500">Pulling your saved visibility snapshots.</p>
        </div>
      </div>
    )
  }

  if (!reports.length) {
    return (
      <div className="relative overflow-hidden rounded-3xl border border-dashed border-zinc-300 bg-white p-9 text-center shadow-[0_1px_3px_rgba(15,23,42,0.03)]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(24,24,27,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(24,24,27,0.05) 1px, transparent 1px)",
            backgroundSize: "36px 36px",
            maskImage: "radial-gradient(circle at 50% 0%, black 0%, transparent 72%)",
            WebkitMaskImage: "radial-gradient(circle at 50% 0%, black 0%, transparent 72%)",
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-0 h-40 w-40 -translate-x-1/2 rounded-full bg-amber-300/20 blur-[80px]"
        />
        <div className="relative mx-auto max-w-md">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-zinc-950 text-white shadow-[0_18px_38px_-24px_rgba(9,9,11,0.75)]">
            <Sparkles size={20} />
          </div>
          <h3 className="text-[18px] font-bold tracking-tight text-zinc-950">No reports yet</h3>
          <p className="mt-2 text-[13px] font-medium leading-6 text-zinc-500">
            Generate your first AI visibility report to get an executive summary, score breakdown, source intelligence, and next-step recommendations.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-3">
      {reports.map((report) => {
        const summary = asRecord(report.summary)
        const brandName = report.brand_name || text(summary.brand_name, "Brand")
        const score = toFiniteNumber(summary.visibility_score)
        const mentionRate = toFiniteNumber(summary.brand_mention_rate ?? summary.mention_rate)
        const status = report.status || "unknown"

        return (
          <button
            key={report.id}
            type="button"
            onClick={() => onOpen(report.id)}
            className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-4 text-left shadow-[0_1px_3px_rgba(15,23,42,0.035)] transition-all duration-200 hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-[0_18px_48px_-34px_rgba(9,9,11,0.45)]"
          >
            <div className="absolute inset-y-0 left-0 w-1 bg-amber-500 opacity-0 transition-opacity group-hover:opacity-100" />

            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_240px_auto] lg:items-center">
              <div className="flex min-w-0 items-start gap-4">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-100">
                  <FileText size={18} />
                </div>

                <div className="min-w-0">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-[0.09em] ${statusStyle(status)}`}>
                      <CheckCircle2 size={11} />
                      {status}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[10.5px] font-semibold text-zinc-500">
                      <CalendarDays size={11} />
                      {periodLabel(report.period_type)}
                    </span>
                  </div>

                  <h3 className="truncate text-[16px] font-bold tracking-tight text-zinc-950">{brandName} visibility report</h3>
                  <p className="mt-1 line-clamp-2 max-w-3xl text-[12.5px] font-medium leading-5 text-zinc-500">{reportHeadline(summary)}</p>
                  <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-zinc-400">Generated {dateLabel(report.created_at)}</p>
                </div>
              </div>

              {/* Single score block — ring plus ONE supporting stat (mentions), no duplicate visibility number */}
              <div className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5">
                <ScoreRing value={score} label="" size="sm" />
                <div className="min-w-0 border-l border-zinc-200 pl-3">
                  <p className="text-[9.5px] font-semibold uppercase tracking-[0.1em] text-zinc-400">Mentions</p>
                  <p className="mt-0.5 text-[17px] font-semibold tracking-[-0.03em] tabular-nums text-zinc-950">
                    {mentionRate ?? "NA"}
                    {mentionRate !== null ? "%" : ""}
                  </p>
                </div>
              </div>

              <div className="hidden justify-self-end lg:block">
                <span className="grid h-10 w-10 place-items-center rounded-full border border-zinc-200 bg-white text-zinc-500 transition-all group-hover:border-amber-500 group-hover:bg-amber-500 group-hover:text-white">
                  <ChevronRight size={17} />
                </span>
              </div>
            </div>
          </button>
        )
      })}

      <div className="flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-[12px] font-medium text-zinc-500">
        <Gauge size={14} className="text-amber-600" />
        Reports are snapshots. Use them to compare movement, explain change, and decide the next action cycle.
      </div>
    </div>
  )
}
