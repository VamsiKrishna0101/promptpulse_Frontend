import { ChevronRight } from "lucide-react"
import type { ActionQueueItem } from "@/lib/actionQueueApi"
import { priorityStyles, categoryStyles, statusIcon } from "./constants"
import { labelize } from "./utils"

interface ActionQueueListItemProps {
  item: ActionQueueItem
  onClick: () => void
}

export function ActionQueueListItem({ item, onClick }: ActionQueueListItemProps) {
  const StatusIcon = statusIcon[item.status] ?? statusIcon.OPEN

  const impactColor =
    item.impact_score >= 80
      ? "text-emerald-600"
      : item.impact_score >= 50
        ? "text-amber-600"
        : "text-zinc-500"

  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full border-b border-zinc-100 px-6 py-4 text-left transition hover:bg-zinc-50/70 last:border-b-0"
    >
      <div className="flex items-start gap-4">
        {/* Left: badges + title + desc */}
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${priorityStyles[item.priority] ?? priorityStyles.LOW}`}
            >
              {item.priority}
            </span>
            <span
              className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${categoryStyles[item.category] ?? categoryStyles.TECHNICAL}`}
            >
              {item.category}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
              <StatusIcon size={11} />
              {labelize(item.status)}
            </span>
          </div>
          <p className="text-[14px] font-semibold leading-snug text-zinc-950 group-hover:text-zinc-800">
            {item.title}
          </p>
          {item.description && (
            <p className="mt-1 line-clamp-2 text-[12.5px] leading-5 text-zinc-500">{item.description}</p>
          )}
        </div>

        {/* Right: scores + arrow */}
        <div className="flex shrink-0 items-center gap-4">
          <div className="hidden text-right sm:block">
            <p className="text-[10px] font-bold uppercase tracking-wide text-zinc-400">Impact</p>
            <p className={`mt-0.5 text-[18px] font-bold tabular-nums ${impactColor}`}>
              {item.impact_score}
            </p>
          </div>
          <ChevronRight
            size={16}
            className="text-zinc-400 transition group-hover:translate-x-0.5 group-hover:text-zinc-700"
          />
        </div>
      </div>
    </button>
  )
}
