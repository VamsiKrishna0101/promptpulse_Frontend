import { useState } from "react"
import type { ModelInsight } from "../utils/reportMapper"
import {
  Cpu,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Swords,
  Activity,
} from "lucide-react"

function getModelLogo(modelName: string) {
  const modelDomains: Record<string, string> = {
    chatgpt: "openai.com",
    gemini: "gemini.google.com",
    claude: "claude.ai",
    perplexity: "perplexity.ai",
    copilot: "copilot.microsoft.com",
    meta: "meta.ai",
    llama: "meta.ai",
  }

  const key = Object.keys(modelDomains).find((k) =>
    modelName.toLowerCase().includes(k),
  )

  return key
    ? `https://www.google.com/s2/favicons?domain=${modelDomains[key]}&sz=64`
    : null
}

const STATUS_STYLE: Record<
  string,
  { bg: string; text: string; ring: string; bar: string }
> = {
  strong: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    ring: "ring-emerald-200",
    bar: "bg-emerald-500",
  },
  steady: {
    bg: "bg-[#f4f4f5]",
    text: "text-[#52525b]",
    ring: "ring-[#e4e4e7]",
    bar: "bg-[#a1a1aa]",
  },
  weak: {
    bg: "bg-red-50",
    text: "text-red-700",
    ring: "ring-red-200",
    bar: "bg-red-500",
  },
}

export function ModelCards({ models }: { models: ModelInsight[] }) {
  const [active, setActive] = useState(0)
  if (!models || !models.length) return null

  const model = models[active]
  const logoUrl = getModelLogo(model.model)
  const st = STATUS_STYLE[model.status?.toLowerCase()] ?? STATUS_STYLE.steady

  return (
    <div className="flex flex-col gap-2.5">
      {/* Model Selector Tabs */}
      <div className="flex gap-1 rounded-xl border border-[#e4e4e7] bg-white p-1 shadow-[0_1px_2px_rgba(9,9,11,0.035)]">
        {models.map((m, i) => {
          const logo = getModelLogo(m.model)
          const isActive = i === active
          const mst = STATUS_STYLE[m.status?.toLowerCase()] ?? STATUS_STYLE.steady

          return (
            <button
              key={m.model}
              onClick={() => setActive(i)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] font-semibold transition-all ${isActive
                  ? "border border-[#e4e4e7] bg-[#fafafa] text-[#18181b] shadow-[0_1px_2px_rgba(9,9,11,0.05)]"
                  : "border border-transparent text-[#52525b] hover:bg-[#fafafa] hover:text-[#18181b]"
                }`}
            >
              {logo ? (
                <img src={logo} alt={m.model} className="h-3.5 w-3.5 object-contain" />
              ) : (
                <Cpu size={14} className="text-[#a1a1aa]" />
              )}

              <span className="truncate">{m.model}</span>

              <span
                className={`ml-auto hidden rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.08em] ring-1 ring-inset sm:inline-flex ${mst.bg} ${mst.text} ${mst.ring}`}
              >
                {m.status}
              </span>
            </button>
          )
        })}
      </div>

      {/* Active Model Card */}
      <div className="rounded-xl border border-[#e4e4e7] bg-white p-3.5 shadow-[0_1px_2px_rgba(9,9,11,0.04)]">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-[#e4e4e7] pb-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#e4e4e7] bg-[#fafafa] shadow-sm">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={model.model}
                  className="h-6 w-6 object-contain"
                />
              ) : (
                <Cpu size={19} className="text-[#a1a1aa]" />
              )}
            </div>

            <div className="min-w-0">
              <h3 className="truncate text-[15px] font-semibold text-[#18181b]">
                {model.model}
              </h3>

              <span
                className={`mt-1 inline-flex items-center rounded-full px-2.5 py-0.5 text-[10.5px] font-semibold uppercase tracking-[0.08em] ring-1 ring-inset ${st.bg} ${st.text} ${st.ring}`}
              >
                {model.status}
              </span>
            </div>
          </div>

          {model.mention_rate !== undefined && (
            <div className="shrink-0 text-right">
              <div className="text-[24px] font-semibold leading-none tracking-[-0.05em] text-[#18181b]">
                {model.mention_rate}%
              </div>

              <div className="mt-1 text-[9.5px] font-semibold uppercase tracking-[0.1em] text-[#a1a1aa]">
                Mention Rate
              </div>
            </div>
          )}
        </div>

        {/* Metrics Row */}
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {model.mention_rate_delta !== undefined && (
            <div className={`flex flex-col rounded-lg border p-2.5 ${model.mention_rate_delta >= 0 ? "border-emerald-200 bg-emerald-50/80" : "border-red-200 bg-red-50/80"}`}>
              <span className="text-[9.5px] font-semibold uppercase tracking-[0.1em] text-[#71717a]">
                Rate Delta
              </span>

              <span
                className={`mt-1.5 text-[17px] font-semibold ${model.mention_rate_delta >= 0
                    ? "text-emerald-700"
                    : "text-red-700"
                  }`}
              >
                {model.mention_rate_delta > 0 ? "+" : ""}
                {model.mention_rate_delta}%
              </span>

              <span className="mt-1 flex items-center gap-1 text-[10px] text-[#a1a1aa]">
                {model.mention_rate_delta >= 0 ? (
                  <TrendingUp size={11} />
                ) : (
                  <TrendingDown size={11} />
                )}
                vs prev period
              </span>
            </div>
          )}

          {model.average_position !== undefined && (
            <div className="flex flex-col rounded-lg border border-[#e4e4e7] bg-[#fafafa] p-2.5">
              <span className="text-[9.5px] font-semibold uppercase tracking-[0.1em] text-[#71717a]">
                Avg Position
              </span>

              <span className="mt-1.5 text-[17px] font-semibold text-[#18181b]">
                {model.average_position.toFixed(2)}
              </span>

              <span className="mt-1 text-[10px] text-[#a1a1aa]">
                lower is better
              </span>
            </div>
          )}

          {model.runs !== undefined && (
            <div className="flex flex-col rounded-lg border border-[#e4e4e7] bg-[#fafafa] p-2.5">
              <span className="text-[9.5px] font-semibold uppercase tracking-[0.1em] text-[#71717a]">
                Runs
              </span>

              <span className="mt-1.5 text-[17px] font-semibold text-[#18181b]">
                {model.runs}
              </span>

              <span className="mt-1 flex items-center gap-1 text-[10px] text-[#a1a1aa]">
                <Activity size={10} /> total prompts
              </span>
            </div>
          )}

          {model.top_competitor && (
            <div className="flex flex-col rounded-lg border border-red-200 bg-red-50/80 p-2.5">
              <span className="flex items-center gap-1 text-[9.5px] font-semibold uppercase tracking-[0.1em] text-red-600">
                <Swords size={10} /> Top Rival
              </span>

              <span className="mt-1.5 truncate text-[13.5px] font-semibold text-red-950">
                {model.top_competitor.name}
              </span>

              <span className="mt-1 text-[11px] font-semibold text-red-700">
                {model.top_competitor.mention_rate}% SOV
              </span>
            </div>
          )}
        </div>

        {/* Summary */}
        <p className="mt-3 line-clamp-2 border-t border-[#e4e4e7] pt-3 text-[12.5px] font-medium leading-5 text-[#52525b]">
          {model.summary}
        </p>

        {/* Top Sources */}
        {model.top_sources && model.top_sources.length > 0 && (
          <div className="mt-4">
            <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#71717a]">
              Top Sources for this Model
            </div>

            <div className="flex flex-wrap gap-2">
              {model.top_sources.map((s, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 rounded-lg border border-[#e4e4e7] bg-[#fafafa] px-3 py-1.5"
                >
                  <span className="text-[12px] font-semibold text-[#18181b]">
                    {s.domain}
                  </span>

                  <span className="text-[10px] font-semibold text-[#a1a1aa]">
                    {s.citations} citations
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Strengths + Risks grid */}
        <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {model.strengths?.length > 0 && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50/70 p-3">
              <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-emerald-700">
                Strengths
              </div>

              <ul className="flex flex-col gap-2">
                {model.strengths.map((s, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-[12.5px] font-medium text-emerald-900/85"
                  >
                    <CheckCircle2
                      size={13}
                      className="mt-0.5 shrink-0 text-emerald-600"
                    />

                    <span className="leading-snug">{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {model.risks?.length > 0 && (
            <div className="rounded-lg border border-red-200 bg-red-50/70 p-3">
              <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-red-700">
                Risks
              </div>

              <ul className="flex flex-col gap-2">
                {model.risks.map((r, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-[12.5px] font-medium text-red-900/85"
                  >
                    <AlertTriangle
                      size={13}
                      className="mt-0.5 shrink-0 text-red-600"
                    />

                    <span className="leading-snug">{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Recommended Action */}
        {model.recommended_action && (
          <div className="mt-3 flex items-start gap-3 rounded-lg border border-[#e4e4e7] bg-[#fafafa] p-3">
            <ArrowRight size={15} className="mt-0.5 shrink-0 text-[#71717a]" />

            <div>
              <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#71717a]">
                Recommended Action
              </div>

              <p className="text-[12.5px] font-medium leading-relaxed text-[#52525b]">
                {model.recommended_action}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
