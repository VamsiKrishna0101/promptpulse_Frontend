import { useEffect, useMemo, useState } from "react"
import { createPortal } from "react-dom"
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  PlayCircle,
  X,
  Activity,
  Loader2,
  RotateCcw,
} from "lucide-react"
import { useProjects, type Project } from "@/hooks/useProjects"
import { api } from "@/lib/api"
import { useToast } from "@/components/ui/Toast"

function sameLocalDay(value: string | null | undefined) {
  if (!value) return false

  const date = new Date(value)
  const now = new Date()

  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  )
}

function formatTime(value: string | null | undefined) {
  if (!value) return "Not yet"

  return new Date(value).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })
}

function statusLabel(status?: string | null) {
  if (!status) return "No run yet"
  return status.toLowerCase().replace(/_/g, " ")
}

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ")
}

const SUPPORTED_TODAY_RUN_ENGINES = new Set([
  "CHATGPT",
  "GEMINI",
  "PERPLEXITY",
  "GOOGLE_AI_MODE",
  "COPILOT",
])

export function TodayRunStatus({ project }: { project: Project | null }) {
  const [open, setOpen] = useState(false)
  const { refresh } = useProjects()

  const run = project?.runs?.[0]
  const jobs = (run?.scrape_jobs ?? []).filter((job) => SUPPORTED_TODAY_RUN_ENGINES.has(job.engine))

  const succeeded = jobs.filter((job) => job.status === "SUCCESS").length
  const failed = jobs.filter((job) => job.status === "FAILED" || (job.status !== "SUCCESS" && job.error_reason)).length
  const running = run?.status === "RUNNING" || run?.status === "QUEUED"
  const ranToday = sameLocalDay(run?.ran_at)
  const supportedJobsComplete = jobs.length > 0 && jobs.every((job) => job.status === "SUCCESS")
  const completeToday = ranToday && supportedJobsComplete && failed === 0
  const needsReview = ranToday && failed > 0

  const progress = jobs.length
    ? Math.round(((succeeded + failed) / jobs.length) * 100)
    : 0

  const label = !run
    ? "No run"
    : needsReview
      ? "Review"
      : completeToday
        ? "Complete"
        : running
        ? "Running"
        : ranToday
          ? "Review"
          : "Not run"

  const tone = needsReview
    ? "border-red-200 bg-red-50 text-red-700"
    : completeToday
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : running
      ? "border-amber-200 bg-amber-50 text-amber-700"
      : failed > 0
        ? "border-red-200 bg-red-50 text-red-700"
        : "border-[#e4e4e7] bg-white text-[#52525b]"

  const icon = needsReview ? (
    <AlertTriangle size={13} strokeWidth={2.15} />
  ) : completeToday ? (
    <CheckCircle2 size={13} strokeWidth={2.15} />
  ) : running ? (
    <Clock3 size={13} strokeWidth={2.15} />
  ) : (
    <PlayCircle size={13} strokeWidth={2.15} />
  )

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "inline-flex h-8 items-center gap-2 rounded-lg border px-3 text-[12px] font-semibold shadow-[0_1px_2px_rgba(9,9,11,0.04)] transition hover:-translate-y-px hover:shadow-[0_3px_8px_rgba(9,9,11,0.08)]",
          tone,
        )}
        title="Open today's run status"
      >
        {icon}
        <span>Today</span>
        <span className="h-3.5 w-px bg-current/20" />
        <span className="capitalize">{label}</span>
      </button>

      {open && createPortal(
        <TodayRunModal
          project={project}
          succeeded={succeeded}
          failed={failed}
          total={jobs.length}
          progress={progress}
          running={running}
          completeToday={completeToday}
          onRefresh={refresh}
          onClose={() => setOpen(false)}
        />,
        document.body
      )}
    </>
  )
}

function TodayRunModal({
  project,
  succeeded,
  failed,
  total,
  progress,
  running,
  completeToday,
  onRefresh,
  onClose,
}: {
  project: Project | null
  succeeded: number
  failed: number
  total: number
  progress: number
  running: boolean
  completeToday: boolean
  onRefresh: () => Promise<void>
  onClose: () => void
}) {
  const run = project?.runs?.[0]
  const toast = useToast()
  const [retrying, setRetrying] = useState(false)
  const supportedJobs = (run?.scrape_jobs ?? []).filter(job => SUPPORTED_TODAY_RUN_ENGINES.has(job.engine))
  const retryableJobs = supportedJobs.filter(job => job.status === "FAILED" && job.retry_count < 2)
  const exhaustedJobs = supportedJobs.filter(job => job.status === "FAILED" && job.retry_count >= 2)

  async function retryFailedJobs() {
    if (!run?.id || retrying || retryableJobs.length === 0) return

    setRetrying(true)
    try {
      const response = await api.post<{ queued: number }>(`/scraping/runs/${run.id}/retry-failed`)
      await onRefresh()
      toast.success(
        "Retry queued",
        `${response.data.queued} failed ${response.data.queued === 1 ? "job is" : "jobs are"} ready for the next Bright Data processing cycle.`,
      )
    } catch (error: any) {
      toast.error(
        "Retry unavailable",
        error?.response?.data?.error ?? "We could not queue these failed jobs. Please try again.",
      )
    } finally {
      setRetrying(false)
    }
  }

  const state = useMemo(() => {
    if (!run) {
      return {
        label: "No run yet",
        description: "No visibility run has been queued for this project yet.",
        icon: PlayCircle,
        iconClass: "border-[#e4e4e7] bg-white text-[#71717a]",
        progressClass: "bg-[#a1a1aa]",
        badgeClass: "border-[#e4e4e7] bg-white text-[#52525b]",
      }
    }

    if (failed > 0) {
      return {
        label: "Needs review",
        description: `Latest run for ${project?.brand_name ?? "this project"} finished with failed jobs.`,
        icon: AlertTriangle,
        iconClass: "border-red-200 bg-red-50 text-red-700",
        progressClass: "bg-red-500",
        badgeClass: "border-red-200 bg-red-50 text-red-700",
      }
    }

    if (running) {
      return {
        label: "Run in progress",
        description: `AI visibility jobs are running for ${project?.brand_name ?? "this project"}.`,
        icon: Clock3,
        iconClass: "border-amber-200 bg-amber-50 text-amber-700",
        progressClass: "bg-amber-500",
        badgeClass: "border-amber-200 bg-amber-50 text-amber-700",
      }
    }

    if (completeToday) {
      return {
        label: "Run complete",
        description: `Today's visibility run is complete for ${project?.brand_name ?? "this project"}.`,
        icon: CheckCircle2,
        iconClass: "border-emerald-200 bg-emerald-50 text-emerald-700",
        progressClass: "bg-emerald-500",
        badgeClass: "border-emerald-200 bg-emerald-50 text-emerald-700",
      }
    }

    return {
      label: statusLabel(run.status),
      description: `Latest run summary for ${project?.brand_name ?? "this project"}.`,
      icon: Activity,
      iconClass: "border-[#e4e4e7] bg-white text-[#18181b]",
      progressClass: "bg-[#09090b]",
      badgeClass: "border-[#e4e4e7] bg-white text-[#52525b]",
    }
  }, [run, failed, running, completeToday, project?.brand_name])

  const Icon = state.icon

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose()
    }

    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#09090b]/45 px-4 py-6"
      onClick={onClose}
    >
      <div className="w-full max-w-[430px]">
        <div
          className="relative overflow-hidden rounded-2xl border border-[#e4e4e7] bg-[#fafafa] shadow-[0_24px_90px_-42px_rgba(9,9,11,0.8)]"
          onClick={(event) => event.stopPropagation()}
        >
          {/* HEADER */}
          <div className="flex items-center justify-between border-b border-[#e4e4e7] bg-[#fafafa] px-4 py-3">
            <div className="flex items-center gap-2.5">
              <div
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-xl border",
                  state.iconClass,
                )}
              >
                <Icon size={16} strokeWidth={2.15} />
              </div>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#a1a1aa]">
                  Today&apos;s run
                </p>

                <h2 className="text-[15px] font-semibold capitalize tracking-[-0.01em] text-[#18181b]">
                  {state.label}
                </h2>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#e4e4e7] bg-white text-[#52525b] shadow-[0_1px_2px_rgba(9,9,11,0.04)] transition hover:border-[#d4d4d8] hover:bg-[#f4f4f5] hover:text-[#18181b]"
            >
              <X size={16} strokeWidth={2.2} />
            </button>
          </div>

          {/* BODY */}
          <div className="p-4">
            <div className="rounded-xl border border-[#e4e4e7] bg-white p-4 shadow-[0_1px_2px_rgba(9,9,11,0.035)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[13px] font-medium leading-6 text-[#52525b]">
                    {state.description}
                  </p>

                  <div className="mt-3 inline-flex rounded-full border border-[#e4e4e7] bg-[#fafafa] px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-[#71717a]">
                    {statusLabel(run?.status)}
                  </div>
                </div>

                <span
                  className={cn(
                    "shrink-0 rounded-full border px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.1em]",
                    state.badgeClass,
                  )}
                >
                  {progress || 0}%
                </span>
              </div>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#e4e4e7]">
                <div
                  className={cn("h-full rounded-full transition-all", state.progressClass)}
                  style={{ width: `${Math.max(progress, total ? 6 : 0)}%` }}
                />
              </div>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2">
              <RunStat label="Success" value={String(succeeded)} tone="success" />
              <RunStat label="Failed" value={String(failed)} tone="failed" />
              <RunStat label="Total" value={String(total)} tone="neutral" />
            </div>

            <div className="mt-3 rounded-xl border border-[#e4e4e7] bg-white px-4 py-3 shadow-[0_1px_2px_rgba(9,9,11,0.035)]">
              <div className="flex items-center justify-between gap-4">
                <span className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[#a1a1aa]">
                  Last update
                </span>

                <span className="text-[13px] font-semibold text-[#18181b]">
                  {formatTime(run?.completed_at ?? run?.ran_at)}
                </span>
              </div>
            </div>

            {failed > 0 && (
              <div className="mt-3 rounded-xl border border-red-100 bg-white p-3 shadow-[0_1px_2px_rgba(9,9,11,0.035)]">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[12px] font-semibold text-[#18181b]">
                      Retry failed jobs
                    </p>
                    <p className="mt-0.5 text-[10.5px] leading-4 text-[#71717a]">
                      Up to two retries per job. Retrying does not deduct credits.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void retryFailedJobs()}
                    disabled={retrying || retryableJobs.length === 0}
                    className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-[#18181b] px-3 text-[11px] font-semibold text-white transition hover:bg-[#27272a] disabled:cursor-not-allowed disabled:bg-[#e4e4e7] disabled:text-[#a1a1aa]"
                  >
                    {retrying ? <Loader2 size={13} className="animate-spin" /> : <RotateCcw size={13} />}
                    {retrying ? "Queuing..." : retryableJobs.length > 0 ? `Retry ${retryableJobs.length}` : "Limit reached"}
                  </button>
                </div>
                {exhaustedJobs.length > 0 && (
                  <p className="mt-2 border-t border-[#f4f4f5] pt-2 text-[10.5px] text-red-600">
                    {exhaustedJobs.length} {exhaustedJobs.length === 1 ? "job has" : "jobs have"} used both retry attempts.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function RunStat({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone: "success" | "failed" | "neutral"
}) {
  return (
    <div
      className={cn(
        "rounded-xl border px-3 py-3 shadow-[0_1px_2px_rgba(9,9,11,0.035)]",
        tone === "success" && "border-emerald-200 bg-emerald-50",
        tone === "failed" && "border-red-200 bg-red-50",
        tone === "neutral" && "border-[#e4e4e7] bg-white",
      )}
    >
      <p
        className={cn(
          "text-[9.5px] font-semibold uppercase tracking-[0.1em]",
          tone === "success" && "text-emerald-700",
          tone === "failed" && "text-red-700",
          tone === "neutral" && "text-[#a1a1aa]",
        )}
      >
        {label}
      </p>

      <p
        className={cn(
          "mt-1 text-[20px] font-semibold tracking-[-0.04em]",
          tone === "success" && "text-emerald-900",
          tone === "failed" && "text-red-900",
          tone === "neutral" && "text-[#18181b]",
        )}
      >
        {value}
      </p>
    </div>
  )
}
