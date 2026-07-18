import { CalendarDays, ChevronRight, Clock3, Radio, Sparkles } from "lucide-react"
import type { RedditRun } from "@/lib/redditIntelligenceApi"
import { dateLabel, isCompletedRunStatus, statusClass } from "./redditHelpers"

export function RedditRunsList({
  runs,
  isLoading,
  onOpen,
}: {
  runs: RedditRun[]
  isLoading: boolean
  onOpen: (runId: string) => void
}) {
  if (isLoading) {
    return (
      <div className="grid min-h-[220px] place-items-center rounded-2xl border border-zinc-200 bg-white">
        <div className="text-center">
          <div className="mx-auto mb-3 grid h-11 w-11 place-items-center rounded-xl bg-zinc-950 text-white">
            <Clock3 size={17} />
          </div>
          <p className="text-[13px] font-semibold text-zinc-800">Loading Reddit scans...</p>
          <p className="mt-1 text-[12px] font-medium text-zinc-500">Pulling saved buyer conversation snapshots.</p>
        </div>
      </div>
    )
  }

  if (!runs.length) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-dashed border-zinc-300 bg-white p-9 text-center shadow-[0_1px_3px_rgba(15,23,42,0.03)]">
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
        <div className="relative mx-auto max-w-md">
          <div className="mx-auto mb-4 grid h-[52px] w-[52px] place-items-center rounded-xl bg-zinc-950 text-white">
            <Radio size={20} />
          </div>
          <h3 className="text-[16px] font-bold tracking-tight text-zinc-950">No Reddit scans yet</h3>
          <p className="mt-2 text-[13px] leading-6 text-zinc-500">
            Run Standard or Deep to create your first saved Reddit Intelligence snapshot.
          </p>
        </div>
      </div>
    )
  }

  const completedRuns = runs.filter((run) => isCompletedRunStatus(run.status) || (run.posts?.length ?? 0) > 0)
  const failedRuns = runs.filter((run) => run.status.toLowerCase() === "failed")

  if (!completedRuns.length) {
    return (
      <div className="grid gap-3">
        <div className="relative overflow-hidden rounded-2xl border border-dashed border-zinc-300 bg-white p-9 text-center shadow-[0_1px_3px_rgba(15,23,42,0.03)]">
          <div className="relative mx-auto max-w-md">
            <div className="mx-auto mb-4 grid h-[52px] w-[52px] place-items-center rounded-xl bg-zinc-950 text-white">
              <Radio size={20} />
            </div>
            <h3 className="text-[16px] font-bold tracking-tight text-zinc-950">No completed Reddit scans yet</h3>
            <p className="mt-2 text-[13px] leading-6 text-zinc-500">
              The previous attempts failed before storing posts. Run a Standard scan after preferences are set to create the first usable snapshot.
            </p>
          </div>
        </div>

        {failedRuns.length > 0 && (
          <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3">
            <p className="text-[12px] font-semibold text-red-800">Recent failed attempts: {failedRuns.length}</p>
            <p className="mt-1 text-[12px] leading-5 text-red-700">
              These are kept for debugging and credit-refund history, but they are hidden from the main scan list because they have no Reddit posts.
            </p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="grid gap-3">
      {completedRuns.map((run) => {
        const summary = run.summary ?? {}
        const headline = String(summary.headline ?? summary.takeaway ?? "Reddit buyer conversation scan")
        const postCount = run.posts?.length ?? 0

        return (
          <button
            key={run.id}
            type="button"
            onClick={() => onOpen(run.id)}
            className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-4 text-left shadow-[0_1px_3px_rgba(15,23,42,0.05)] transition-all duration-200 hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-[0_16px_40px_-30px_rgba(9,9,11,0.4)]"
          >
            <div className="absolute inset-y-0 left-0 w-1 bg-orange-500 opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_270px_auto] lg:items-center">
              <div className="flex min-w-0 items-start gap-3.5">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-orange-50 text-orange-700 ring-1 ring-inset ring-orange-100">
                  <Radio size={17} />
                </div>
                <div className="min-w-0">
                  <div className="mb-1.5 flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-[0.08em] ${statusClass(run.status)}`}>
                      {run.status}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[10.5px] font-medium text-zinc-500">
                      <CalendarDays size={11} />
                      {dateLabel(run.completed_at ?? run.created_at)}
                    </span>
                  </div>
                  <h3 className="truncate text-[14.5px] font-semibold tracking-tight text-zinc-950">{run.mode} Reddit scan</h3>
                  <p className="mt-1 line-clamp-2 max-w-3xl text-[12px] leading-5 text-zinc-500">{headline}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 rounded-xl border border-zinc-200 bg-zinc-50 p-2">
                <Mini label="Posts" value={postCount} />
                <Mini label="Keywords" value={run.keyword_count} />
                <Mini label="Credits" value={run.credits_spent} />
              </div>

              <div className="hidden justify-self-end lg:block">
                <span className="grid h-9 w-9 place-items-center rounded-full border border-zinc-200 bg-white text-zinc-500 transition-all group-hover:border-orange-500 group-hover:bg-orange-500 group-hover:text-white">
                  <ChevronRight size={16} />
                </span>
              </div>
            </div>
          </button>
        )
      })}

      <div className="flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-[12px] font-medium text-zinc-500">
        <Sparkles size={14} className="text-orange-600" />
        Reddit scans are saved snapshots. Open one to inspect posts, themes, actions, and AI-cited Reddit threads.
      </div>

      {failedRuns.length > 0 && (
        <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-[12px] font-medium text-red-700">
          Hidden from this list: {failedRuns.length} failed empty attempt{failedRuns.length === 1 ? "" : "s"}.
        </div>
      )}
    </div>
  )
}

function Mini({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-white px-2 py-1.5 text-center">
      <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-zinc-400">{label}</p>
      <p className="mt-1 text-[14px] font-bold text-zinc-950">{value}</p>
    </div>
  )
}