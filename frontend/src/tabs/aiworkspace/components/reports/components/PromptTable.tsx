import type { PromptInsight } from "../utils/reportMapper"
import {
  MessageSquareQuote,
  Target,
  Zap,
  Activity,
} from "lucide-react"

function deltaTone(value?: number, positiveWhenDown = false) {
  if (value === undefined) return "text-[#18181b]"
  const good = positiveWhenDown ? value <= 0 : value >= 0
  return good ? "text-emerald-700" : "text-red-700"
}

export function PromptTable({ prompts }: { prompts: PromptInsight[] }) {
  if (!prompts || !prompts.length) {
    return (
      <p className="text-[13px] font-medium text-[#71717a]">
        No prompt movement available.
      </p>
    )
  }

  return (
    <div className="grid gap-2.5 xl:grid-cols-2">
      {prompts.map((prompt, idx) => (
        <div
          key={idx}
          className="flex flex-col gap-2.5 rounded-xl border border-[#e4e4e7] bg-white p-3 shadow-[0_1px_2px_rgba(9,9,11,0.04)] transition-all hover:-translate-y-0.5 hover:border-[#d4d4d8] hover:shadow-[0_10px_28px_-24px_rgba(9,9,11,0.35)]"
        >
          {/* Header */}
          <div className="flex items-start gap-2.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[#e4e4e7] bg-[#fafafa] shadow-sm">
              <MessageSquareQuote size={13} className="text-[#71717a]" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-[12.5px] font-semibold leading-5 text-[#18181b]">
                {prompt.prompt}
              </p>

              {prompt.intent && (
                <span className="mt-1.5 inline-flex items-center gap-1 rounded-md border border-[#e4e4e7] bg-[#fafafa] px-2 py-0.5 text-[9.5px] font-semibold uppercase tracking-[0.08em] text-[#71717a]">
                  <Target size={10} />
                  {prompt.intent}
                </span>
              )}
            </div>
          </div>

          {/* Metrics */}
          {(prompt.volume_score !== undefined ||
            prompt.mention_rate_delta !== undefined ||
            prompt.position_delta !== undefined) && (
              <div className="grid grid-cols-3 gap-2 border-y border-[#e4e4e7] py-2.5">
                {prompt.volume_score !== undefined && (
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-1 text-[9px] font-semibold uppercase text-[#a1a1aa]">
                      <Activity size={10} /> Volume
                    </div>

                    <span className="text-[12.5px] font-semibold text-[#18181b]">
                      {prompt.volume_score}
                    </span>
                  </div>
                )}

                {prompt.mention_rate_delta !== undefined && (
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-1 text-[9px] font-semibold uppercase text-[#a1a1aa]">
                      <Zap size={10} /> Delta
                    </div>

                    <span
                      className={`flex items-center gap-1 text-[12.5px] font-semibold ${deltaTone(prompt.mention_rate_delta)}`}
                    >
                      {prompt.mention_rate_delta > 0 ? "+" : ""}
                      {prompt.mention_rate_delta}%
                    </span>
                  </div>
                )}

                {prompt.position_delta !== undefined && (
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-1 text-[9px] font-semibold uppercase text-[#a1a1aa]">
                      <Target size={10} /> Pos Change
                    </div>

                    <span
                      className={`flex items-center gap-1 text-[12.5px] font-semibold ${deltaTone(prompt.position_delta, true)}`}
                    >
                      {prompt.position_delta > 0 ? "+" : ""}
                      {prompt.position_delta}
                    </span>
                  </div>
                )}
              </div>
            )}

          {/* Top Competitor */}
          {prompt.top_competitor && (
            <div className="flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50/70 px-3 py-2">
              <span className="text-[9.5px] font-semibold uppercase tracking-[0.1em] text-red-700">
                Competitor Threat
              </span>

              <div className="flex items-center gap-2">
                <span className="max-w-[140px] truncate text-[12px] font-semibold text-red-950">
                  {prompt.top_competitor.name}
                </span>

                <span className="rounded-md border border-red-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-red-700">
                  {prompt.top_competitor.mention_rate}%
                </span>
              </div>
            </div>
          )}

          {/* Summary */}
          {prompt.summary && (
            <p className="line-clamp-2 text-[12.5px] font-medium leading-5 text-[#52525b]">
              {prompt.summary}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}
