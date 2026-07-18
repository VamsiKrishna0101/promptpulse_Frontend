import type { ComponentType } from "react"
import { ArchiveX, CheckCircle2, Circle, Clock3 } from "lucide-react"
import type { ActionQueueStatus } from "@/lib/actionQueueApi"

export const STATUS_FILTERS = [
  { value: "ALL", label: "All" },
  { value: "OPEN", label: "Open" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "DONE", label: "Done" },
  { value: "DISMISSED", label: "Dismissed" },
] as const

export type StatusFilter = (typeof STATUS_FILTERS)[number]["value"]

export const statusIcon: Record<string, ComponentType<{ size?: number; className?: string }>> = {
  OPEN: Circle,
  IN_PROGRESS: Clock3,
  DONE: CheckCircle2,
  DISMISSED: ArchiveX,
}

export const priorityStyles: Record<string, string> = {
  HIGH: "border-red-100 bg-red-50 text-red-600",
  MEDIUM: "border-amber-100 bg-amber-50 text-amber-600",
  LOW: "border-zinc-200 bg-zinc-50 text-zinc-500",
}

export const priorityOrder: Record<string, number> = {
  HIGH: 0,
  MEDIUM: 1,
  LOW: 2,
}

export const categoryStyles: Record<string, string> = {
  CONTENT: "bg-blue-50 text-blue-700 border-blue-100",
  SOURCE: "bg-emerald-50 text-emerald-700 border-emerald-100",
  PROMPT: "bg-violet-50 text-violet-700 border-violet-100",
  COMPETITOR: "bg-rose-50 text-rose-700 border-rose-100",
  MODEL: "bg-cyan-50 text-cyan-700 border-cyan-100",
  TECHNICAL: "bg-zinc-50 text-zinc-700 border-zinc-200",
  REPORT: "bg-orange-50 text-orange-700 border-orange-100",
}

export const statusButtonStyles: Record<
  ActionQueueStatus,
  { label: string; className: string }
> = {
  IN_PROGRESS: {
    label: "Start",
    className:
      "rounded-lg border border-zinc-200 bg-white px-4 py-2 text-[13px] font-semibold text-zinc-700 hover:border-zinc-300 disabled:opacity-50",
  },
  DONE: {
    label: "Done",
    className:
      "rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-2 text-[13px] font-semibold text-emerald-700 hover:border-emerald-200 disabled:opacity-50",
  },
  DISMISSED: {
    label: "Dismiss",
    className:
      "rounded-lg border border-zinc-200 bg-white px-4 py-2 text-[13px] font-semibold text-zinc-500 hover:border-zinc-300 disabled:opacity-50",
  },
  OPEN: {
    label: "Reopen",
    className:
      "rounded-lg border border-zinc-200 bg-white px-4 py-2 text-[13px] font-semibold text-zinc-700 hover:border-zinc-300 disabled:opacity-50",
  },
}

export const PAGE_SIZE = 10
