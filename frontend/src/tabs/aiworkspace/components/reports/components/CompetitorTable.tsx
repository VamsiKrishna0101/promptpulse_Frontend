import type { CompetitorInsight } from "../utils/reportMapper"
import {
  Swords,
  ShieldAlert,
  Target,
  TrendingUp,
  TrendingDown,
  Crosshair,
} from "lucide-react"

const THREAT_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  high: {
    bg: "bg-red-50",
    color: "text-red-700",
    border: "border-red-200",
  },
  medium: {
    bg: "bg-amber-50",
    color: "text-amber-700",
    border: "border-amber-200",
  },
  low: {
    bg: "bg-emerald-50",
    color: "text-emerald-700",
    border: "border-emerald-200",
  },
}

export function CompetitorTable({
  competitors,
}: {
  competitors: CompetitorInsight[]
}) {
  if (!competitors || !competitors.length) {
    return (
      <p className="text-[13px] font-medium text-[#71717a]">
        No competitor data available.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {competitors.map((comp, idx) => {
        const style =
          THREAT_STYLE[comp.threat_level?.toLowerCase()] || THREAT_STYLE.medium

        return (
          <div
            key={idx}
            className="flex flex-col gap-3 rounded-xl border border-[#e4e4e7] bg-white p-4 shadow-[0_1px_2px_rgba(9,9,11,0.04)] transition-colors hover:border-[#d4d4d8]"
          >
            {/* Header row */}
            <div className="flex items-center justify-between gap-4 border-b border-[#e4e4e7] pb-3">
              <div className="flex min-w-0 items-center gap-3">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${style.border} ${style.bg}`}
                >
                  <Swords size={16} className={style.color} strokeWidth={2.1} />
                </div>

                <div className="min-w-0">
                  <h4 className="truncate text-[14px] font-semibold text-[#18181b]">
                    {comp.competitor}
                  </h4>

                  <div className="mt-1 flex items-center gap-1.5">
                    <ShieldAlert size={12} className={style.color} />

                    <span
                      className={`text-[10px] font-semibold uppercase tracking-[0.09em] ${style.color}`}
                    >
                      {comp.threat_level} Threat
                    </span>
                  </div>
                </div>
              </div>

              {comp.current_mention_rate !== undefined && (
                <div className="shrink-0 text-right">
                  <span className="block text-[19px] font-semibold leading-none tracking-[-0.04em] text-[#18181b]">
                    {comp.current_mention_rate}%
                  </span>

                  <span className="mt-1 block text-[9.5px] font-semibold uppercase tracking-[0.1em] text-[#a1a1aa]">
                    Share of Voice
                  </span>
                </div>
              )}
            </div>

            {/* Sub-Metrics Row */}
            {(comp.mention_rate_delta !== undefined ||
              comp.current_average_position !== undefined ||
              comp.position_delta !== undefined ||
              comp.prompts_won_against_brand !== undefined) && (
                <div className="grid grid-cols-2 gap-2 rounded-lg border border-[#e4e4e7] bg-[#fafafa] p-3 md:grid-cols-4">
                  {comp.mention_rate_delta !== undefined && (
                    <div className="flex flex-col">
                      <span className="mb-1 text-[9.5px] font-semibold uppercase tracking-[0.1em] text-[#71717a]">
                        SOV Change
                      </span>

                      <span
                        className={`flex items-center gap-1 text-[13.5px] font-semibold ${comp.mention_rate_delta >= 0
                            ? "text-emerald-700"
                            : "text-red-700"
                          }`}
                      >
                        {comp.mention_rate_delta > 0 ? "+" : ""}
                        {comp.mention_rate_delta}%
                      </span>
                    </div>
                  )}

                  {comp.current_average_position !== undefined && (
                    <div className="flex flex-col">
                      <span className="mb-1 text-[9.5px] font-semibold uppercase tracking-[0.1em] text-[#71717a]">
                        Avg Position
                      </span>

                      <span className="text-[13.5px] font-semibold text-[#18181b]">
                        {comp.current_average_position.toFixed(2)}
                      </span>
                    </div>
                  )}

                  {comp.position_delta !== undefined && (
                    <div className="flex flex-col">
                      <span className="mb-1 text-[9.5px] font-semibold uppercase tracking-[0.1em] text-[#71717a]">
                        Pos Change
                      </span>

                      <span
                        className={`flex items-center gap-1 text-[13.5px] font-semibold ${comp.position_delta <= 0
                            ? "text-emerald-700"
                            : "text-red-700"
                          }`}
                      >
                        {comp.position_delta > 0 ? (
                          <TrendingDown size={13} strokeWidth={2.1} />
                        ) : (
                          <TrendingUp size={13} strokeWidth={2.1} />
                        )}

                        {comp.position_delta > 0 ? "+" : ""}
                        {comp.position_delta}
                      </span>
                    </div>
                  )}

                  {comp.prompts_won_against_brand !== undefined && (
                    <div className="flex flex-col">
                      <span className="mb-1 text-[9.5px] font-semibold uppercase tracking-[0.1em] text-[#71717a]">
                        Prompts Won
                      </span>

                      <span className="flex items-center gap-1 text-[13.5px] font-semibold text-[#18181b]">
                        <Crosshair
                          size={13}
                          className="text-red-600"
                          strokeWidth={2.1}
                        />
                        {comp.prompts_won_against_brand}
                      </span>
                    </div>
                  )}
                </div>
              )}

            {/* Summaries */}
            <div className="flex flex-col gap-3">
              <p className="text-[13px] font-medium leading-[1.6] text-[#52525b]">
                {comp.summary}
              </p>

              {comp.why_they_are_winning?.length > 0 && (
                <div className="rounded-lg border border-[#e4e4e7] bg-[#fafafa] px-4 py-3">
                  <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#71717a]">
                    Why They Are Winning
                  </div>

                  <ul className="flex flex-col gap-2">
                    {comp.why_they_are_winning.map((reason, i) => (
                      <li
                        key={i}
                        className="flex text-[12px] font-medium leading-[1.5] text-[#52525b]"
                      >
                        <span className="mr-2 text-[#a1a1aa]">•</span>
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {comp.recommended_response && (
                <div className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
                  <Target
                    size={14}
                    className="mt-0.5 shrink-0 text-emerald-700"
                    strokeWidth={2.1}
                  />

                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-emerald-700">
                      Recommended Response
                    </div>

                    <p className="mt-1 text-[12px] font-medium leading-[1.5] text-emerald-900/80">
                      {comp.recommended_response}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}