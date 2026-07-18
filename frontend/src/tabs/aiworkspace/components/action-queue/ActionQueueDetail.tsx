import { ArrowLeft } from "lucide-react"
import type { ActionQueueItem, ActionQueueStatus } from "@/lib/actionQueueApi"
import { priorityStyles, categoryStyles, statusIcon, statusButtonStyles } from "./constants"
import { labelize, getEvidenceLabel } from "./utils"

interface ActionQueueDetailProps {
  item: ActionQueueItem
  isUpdating: boolean
  onBack: () => void
  onStatus: (itemId: string, status: ActionQueueStatus) => Promise<void>
}

export function ActionQueueDetail({ item, isUpdating, onBack, onStatus }: ActionQueueDetailProps) {
  const StatusIcon = statusIcon[item.status] ?? statusIcon.OPEN
  const evidenceLabel = getEvidenceLabel(item)

  const actionButtons: { status: ActionQueueStatus; show: boolean }[] = [
    { status: "IN_PROGRESS", show: item.status !== "IN_PROGRESS" && item.status !== "DONE" },
    { status: "DONE", show: item.status !== "DONE" },
    { status: "DISMISSED", show: item.status !== "DISMISSED" && item.status !== "DONE" },
    { status: "OPEN", show: item.status === "DONE" || item.status === "DISMISSED" },
  ]

  return (
    <div className="flex flex-col gap-5">
      {/* Back nav */}
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 self-start text-[13px] font-semibold text-zinc-500 transition hover:text-zinc-950"
      >
        <ArrowLeft size={15} />
        Back to queue
      </button>

      {/* Header card */}
      <section className="rounded-2xl border border-zinc-200 bg-white p-7 shadow-[0_1px_3px_rgba(15,23,42,0.03)]">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${priorityStyles[item.priority] ?? priorityStyles.LOW}`}
          >
            {item.priority}
          </span>
          <span
            className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${categoryStyles[item.category] ?? categoryStyles.TECHNICAL}`}
          >
            {item.category}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
            <StatusIcon size={12} />
            {labelize(item.status)}
          </span>
        </div>
        <h1 className="text-[20px] font-bold leading-snug text-zinc-950">{item.title}</h1>
        {item.description && (
          <p className="mt-3 max-w-3xl text-[14px] leading-7 text-zinc-500">{item.description}</p>
        )}
      </section>

      <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
        {/* Main content */}
        <div className="flex flex-col gap-4">
          {item.recommended_action && (
            <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-[0_1px_3px_rgba(15,23,42,0.03)]">
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                Recommended action
              </p>
              <p className="text-[14px] leading-7 text-zinc-700">{item.recommended_action}</p>
            </section>
          )}

          {evidenceLabel && (
            <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-[0_1px_3px_rgba(15,23,42,0.03)]">
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-zinc-400">Evidence</p>
              <p className="text-[14px] leading-6 text-zinc-700">{evidenceLabel}</p>
            </section>
          )}

          {item.success_metric && (
            <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-[0_1px_3px_rgba(15,23,42,0.03)]">
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                Success metric
              </p>
              <p className="text-[14px] leading-6 text-zinc-700">{item.success_metric}</p>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4">
          {/* Scores */}
          <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.03)]">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-zinc-400">Scores</p>
            <div className="grid grid-cols-3 gap-2">
              <ScoreBox label="Impact" value={item.impact_score} />
              <ScoreBox label="Effort" value={item.effort_score} />
              <ScoreBox label="Conf." value={item.confidence_score} />
            </div>
          </section>

          {/* Actions */}
          <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.03)]">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              Update status
            </p>
            <div className="flex flex-col gap-2">
              {actionButtons
                .filter((btn) => btn.show)
                .map((btn) => (
                  <button
                    key={btn.status}
                    type="button"
                    disabled={isUpdating}
                    onClick={() => onStatus(item.id, btn.status)}
                    className={statusButtonStyles[btn.status].className}
                  >
                    {statusButtonStyles[btn.status].label}
                  </button>
                ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

function ScoreBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-3 text-center">
      <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">{label}</p>
      <p className="mt-1 text-[18px] font-bold text-zinc-950">{value}</p>
    </div>
  )
}
