import { Check, Cpu, Lock } from "lucide-react"
import { faviconUrl } from "@/lib/aiModels"
import type { Plan, ProjectEngine } from "../types"

type EngineOption = {
  id: ProjectEngine
  name: string
  domain: string
  description: string
}

const ENGINE_OPTIONS: EngineOption[] = [
  { id: "CHATGPT", name: "ChatGPT", domain: "chatgpt.com", description: "Best default for commercial buyer questions." },
  { id: "GEMINI", name: "Gemini", domain: "gemini.google.com", description: "Strong Google ecosystem and research-style answers." },
  { id: "PERPLEXITY", name: "Perplexity", domain: "perplexity.ai", description: "Source-heavy answers with explicit citations." },
  { id: "GOOGLE_AI_MODE", name: "Google AI Mode", domain: "google.com", description: "Premium Google AI search surface." },
  { id: "COPILOT", name: "Copilot", domain: "copilot.microsoft.com", description: "Microsoft/Bing discovery behavior." },
]

export const DEFAULT_ENGINE_SELECTION: ProjectEngine[] = ["CHATGPT", "GEMINI", "PERPLEXITY"]

function engineLimitLabel(limit: number | "all") {
  return limit === "all" ? "all engines" : `${limit} engines`
}

export function EngineSelectionCard({
  selected,
  limit,
  plan,
  onToggle,
}: {
  selected: ProjectEngine[]
  limit: number | "all"
  plan: Plan
  onToggle: (engine: ProjectEngine) => void
}) {
  const numericLimit = limit === "all" ? ENGINE_OPTIONS.length : limit
  const canAddMore = selected.length < numericLimit

  return (
    <section className="rounded-2xl border border-[#e4e4e7] bg-[#fafafa] p-4 shadow-[0_1px_3px_rgba(9,9,11,0.05)]">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#e4e4e7] pb-4">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-[#e4e4e7] bg-white px-3 py-1.5 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[#71717a]">
            <Cpu size={12} />
            AI engines
          </p>
          <h2 className="mt-3 text-[24px] font-semibold tracking-[-0.04em] text-[#18181b]">
            Choose where PromptPulse should track your brand.
          </h2>
          <p className="mt-1.5 max-w-2xl text-[13px] font-medium leading-6 text-[#52525b]">
            Your {plan.toLowerCase()} plan can track {engineLimitLabel(limit)} per project. We recommend ChatGPT, Gemini, and Perplexity for the first benchmark.
          </p>
        </div>

        <div className="rounded-xl border border-[#e4e4e7] bg-white px-3 py-2 text-right">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#a1a1aa]">Selected</p>
          <p className="text-[22px] font-semibold tracking-[-0.04em] text-[#18181b]">
            {selected.length} / {numericLimit}
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {ENGINE_OPTIONS.map((engine) => {
          const checked = selected.includes(engine.id)
          const locked = !checked && !canAddMore

          return (
            <button
              key={engine.id}
              type="button"
              onClick={() => onToggle(engine.id)}
              disabled={locked}
              className={[
                "group flex min-h-[116px] flex-col rounded-2xl border p-4 text-left transition",
                checked
                  ? "border-[#09090b] bg-white shadow-[0_12px_30px_-22px_rgba(9,9,11,0.55)]"
                  : "border-[#e4e4e7] bg-white/80 hover:border-[#c7c7cc]",
                locked ? "cursor-not-allowed opacity-45" : "",
              ].join(" ")}
            >
              <span className="flex items-start justify-between gap-3">
                <span className="flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#e4e4e7] bg-[#fafafa]">
                    <img src={faviconUrl(engine.domain, 64) ?? ""} alt="" className="h-4.5 w-4.5 rounded-[4px]" />
                  </span>
                  <span className="text-[15px] font-semibold text-[#18181b]">{engine.name}</span>
                </span>

                <span className={[
                  "flex h-6 w-6 items-center justify-center rounded-full border",
                  checked ? "border-[#09090b] bg-[#09090b] text-white" : "border-[#e4e4e7] bg-white text-[#a1a1aa]",
                ].join(" ")}>
                  {locked ? <Lock size={12} /> : checked ? <Check size={13} /> : null}
                </span>
              </span>

              <span className="mt-3 text-[12.5px] font-medium leading-5 text-[#52525b]">{engine.description}</span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
