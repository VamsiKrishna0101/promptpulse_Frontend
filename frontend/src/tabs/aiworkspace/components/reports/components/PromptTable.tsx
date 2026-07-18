import type { PromptInsight } from "../utils/reportMapper"
import { MessageSquareQuote, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { DataTable } from "./ReportVisuals"

function deltaCell(value?: number, positiveWhenDown = false) {
  if (value === undefined) return <span className="text-[11px] text-zinc-300">—</span>
  const good = positiveWhenDown ? value <= 0 : value >= 0
  const neutral = value === 0
  const Icon = neutral ? Minus : good ? TrendingUp : TrendingDown

  return (
    <span className={`flex items-center justify-end gap-1 text-[12.5px] font-semibold tabular-nums ${neutral ? "text-zinc-400" : good ? "text-emerald-700" : "text-red-700"}`}>
      <Icon size={11} />
      {value > 0 ? "+" : ""}
      {value}
      {!positiveWhenDown && value !== 0 ? "%" : ""}
    </span>
  )
}

export function PromptTable({ prompts }: { prompts: PromptInsight[] }) {
  if (!prompts || !prompts.length) {
    return <p className="text-[13px] font-medium text-zinc-500">No prompt movement available.</p>
  }

  return (
    <DataTable
      columns={[
        { label: "Prompt" },
        { label: "Intent" },
        { label: "Volume", align: "right" },
        { label: "Rate delta", align: "right" },
        { label: "Pos change", align: "right" },
        { label: "Top rival", align: "right" },
      ]}
    >
      {prompts.map((prompt, idx) => (
        <div
          key={idx}
          className="grid items-center gap-3 px-4 py-3 transition hover:bg-zinc-50"
          style={{ gridTemplateColumns: "minmax(160px,2fr) repeat(5, minmax(70px,1fr))" }}
        >
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-zinc-100">
              <MessageSquareQuote size={13} className="text-zinc-500" />
            </div>
            <p className="truncate text-[12.5px] font-semibold text-zinc-950" title={prompt.prompt}>
              {prompt.prompt}
            </p>
          </div>

          <span className="w-fit rounded-full border border-zinc-200 bg-zinc-100 px-2 py-0.5 text-[9.5px] font-semibold uppercase tracking-[0.06em] text-zinc-600">
            {prompt.intent || "—"}
          </span>

          <span className="text-right text-[12.5px] font-semibold tabular-nums text-zinc-950">
            {prompt.volume_score !== undefined ? prompt.volume_score : "—"}
          </span>

          <span className="text-right">{deltaCell(prompt.mention_rate_delta)}</span>
          <span className="text-right">{deltaCell(prompt.position_delta, true)}</span>

          <span className="flex items-center justify-end gap-1.5 text-right">
            {prompt.top_competitor ? (
              <span className="inline-flex max-w-full items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[10.5px] font-semibold text-red-700">
                <span className="truncate max-w-[70px]">{prompt.top_competitor.name}</span>
                <span className="shrink-0">{prompt.top_competitor.mention_rate}%</span>
              </span>
            ) : (
              <span className="text-[11px] text-zinc-300">—</span>
            )}
          </span>
        </div>
      ))}
    </DataTable>
  )
}