import { useState } from "react"
import type { ModelInsight } from "../utils/reportMapper"
import { Cpu, CheckCircle2, AlertTriangle, ArrowRight, TrendingUp, TrendingDown, Minus, Swords, Activity, ShieldCheck } from "lucide-react"
import { faviconUrl, modelIconUrl, formatModelName } from "@/lib/aiModels"

function getModelLogo(modelName: string) {
  const sharedLogo = modelIconUrl(modelName, 64)
  if (sharedLogo) return sharedLogo
  const modelDomains: Record<string, string> = { meta: "meta.ai", llama: "meta.ai" }
  const key = Object.keys(modelDomains).find((k) => modelName.toLowerCase().includes(k))
  return key ? faviconUrl(modelDomains[key], 64) : null
}

const STATUS_STYLE: Record<string, { bg: string; text: string; ring: string }> = {
  strong: { bg: "bg-emerald-50", text: "text-emerald-700", ring: "ring-emerald-200" },
  steady: { bg: "bg-zinc-100", text: "text-zinc-600", ring: "ring-zinc-200" },
  weak: { bg: "bg-zinc-100", text: "text-zinc-500", ring: "ring-zinc-200" },
}

/* A value of 0 is "no signal yet", not "bad" or "good" — it gets its own neutral tone,
   separate from positive/negative so an untouched 0% doesn't render as celebratory or alarming. */
function deltaTone(value: number) {
  if (value === 0) return { bg: "border-zinc-200 bg-zinc-50", text: "text-zinc-500", Icon: Minus }
  if (value > 0) return { bg: "border-emerald-200 bg-emerald-50/80", text: "text-emerald-700", Icon: TrendingUp }
  return { bg: "border-red-200 bg-red-50/80", text: "text-red-700", Icon: TrendingDown }
}

function mentionTone(value: number, hasRuns: boolean) {
  if (!hasRuns) return { bg: "border-zinc-200 bg-zinc-50", text: "text-zinc-500" }
  if (value === 0) return { bg: "border-zinc-200 bg-zinc-50", text: "text-zinc-500" }
  if (value >= 60) return { bg: "border-emerald-200 bg-emerald-50/80", text: "text-emerald-700" }
  return { bg: "border-amber-200 bg-amber-50/80", text: "text-amber-700" }
}

/* A risk list containing only a "no material risks" placeholder string should read as reassurance,
   not an alert — red chrome is reserved for when there's an actual named risk. */
function hasRealRisks(risks?: string[]) {
  if (!risks || risks.length === 0) return false
  return !(risks.length === 1 && /no material risk/i.test(risks[0]))
}

export function ModelCards({ models }: { models: ModelInsight[] }) {
  const [active, setActive] = useState(0)
  if (!models || !models.length) return null

  const model = models[active]
  const displayName = model.model_label || formatModelName(model.model)
  const logoUrl = getModelLogo(model.model)
  const st = STATUS_STYLE[model.status?.toLowerCase()] ?? STATUS_STYLE.steady
  const realRisks = hasRealRisks(model.risks)

  return (
    <div className="flex flex-col gap-2.5">
      {/* Model Selector Tabs — redesigned so badge and next label never collide */}
      {/* Model Selector Tabs */}
      <div className="grid gap-1.5 sm:grid-cols-3">
        {models.map((m, i) => {
          const logo = getModelLogo(m.model)
          const isActive = i === active
          const noRuns = m.runs === 0

          return (
            <button
              key={m.model}
              onClick={() => setActive(i)}
              className={`relative flex min-w-0 flex-col gap-1.5 rounded-xl border px-3.5 py-2.5 text-left transition-all ${isActive
                  ? "border-zinc-900 bg-white shadow-[0_4px_14px_-6px_rgba(9,9,11,0.25)]"
                  : "border-zinc-200 bg-zinc-50 hover:border-zinc-300 hover:bg-white"
                }`}
            >
              {isActive && <span className="absolute inset-x-0 top-0 h-[3px] rounded-t-xl bg-amber-500" />}
              <div className="flex min-w-0 items-center gap-1.5">
                {logo ? (
                  <img src={logo} alt={m.model} className="h-4 w-4 shrink-0 object-contain" />
                ) : (
                  <Cpu size={15} className="shrink-0 text-zinc-400" />
                )}
                <span className={`truncate text-[12.5px] font-semibold ${isActive ? "text-zinc-950" : "text-zinc-500"}`}>
                  {m.model_label || formatModelName(m.model)}
                </span>
              </div>
              <span
                className={`inline-flex w-fit items-center rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.08em] ${noRuns ? "bg-zinc-200 text-zinc-500" : "bg-emerald-100 text-emerald-700"
                  }`}
              >
                {noRuns ? "no runs" : `${m.mention_rate ?? 0}% mentions`}
              </span>
            </button>
          )
        })}
      </div>

      {/* Active Model Card */}
      <div className="rounded-xl border border-zinc-200 bg-white p-3.5 shadow-[0_1px_2px_rgba(9,9,11,0.04)]">
        <div className="flex items-start justify-between gap-4 border-b border-zinc-200 pb-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-zinc-100">
              {logoUrl ? <img src={logoUrl} alt={model.model} className="h-6 w-6 object-contain" /> : <Cpu size={19} className="text-zinc-400" />}
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-[15px] font-semibold text-zinc-950">{displayName}</h3>
              <span className={`mt-1 inline-flex items-center rounded-full px-2.5 py-0.5 text-[10.5px] font-semibold uppercase tracking-[0.08em] ring-1 ring-inset ${st.bg} ${st.text} ${st.ring}`}>
                {model.status}
              </span>
            </div>
          </div>

          {model.mention_rate !== undefined && model.runs !== 0 && (
            <div className="shrink-0 text-right">
              <div className="text-[24px] font-semibold leading-none tracking-[-0.03em] text-zinc-950">{model.mention_rate}%</div>
              <div className="mt-1 text-[9.5px] font-semibold uppercase tracking-[0.1em] text-zinc-400">Mention rate</div>
            </div>
          )}
          {model.runs === 0 && (
            <div className="shrink-0 rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-zinc-500">
              No runs
            </div>
          )}
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {model.mention_rate !== undefined && (() => {
            const t = mentionTone(model.mention_rate, model.runs !== 0)
            return (
              <div className={`flex flex-col rounded-lg border p-2.5 ${t.bg}`}>
                <span className="text-[9.5px] font-semibold uppercase tracking-[0.1em] text-zinc-500">Mention rate</span>
                <span className={`mt-1.5 text-[17px] font-semibold ${t.text}`}>{model.mention_rate}%</span>
                <span className="mt-1 text-[10px] text-zinc-400">{model.runs === 0 ? "no completed runs" : "current period"}</span>
              </div>
            )
          })()}

          {model.mention_rate_delta !== undefined && (() => {
            const t = deltaTone(model.mention_rate_delta)
            return (
              <div className={`flex flex-col rounded-lg border p-2.5 ${t.bg}`}>
                <span className="text-[9.5px] font-semibold uppercase tracking-[0.1em] text-zinc-500">Rate delta</span>
                <span className={`mt-1.5 text-[17px] font-semibold ${t.text}`}>
                  {model.mention_rate_delta > 0 ? "+" : ""}
                  {model.mention_rate_delta}%
                </span>
                <span className="mt-1 flex items-center gap-1 text-[10px] text-zinc-400">
                  <t.Icon size={11} /> vs prev period
                </span>
              </div>
            )
          })()}

          {typeof model.average_position === "number" && Number.isFinite(model.average_position) && (
            <div className="flex flex-col rounded-lg border border-zinc-200 bg-zinc-50 p-2.5">
              <span className="text-[9.5px] font-semibold uppercase tracking-[0.1em] text-zinc-500">Avg position</span>
              <span className="mt-1.5 text-[17px] font-semibold text-zinc-950">{model.average_position.toFixed(2)}</span>
              <span className="mt-1 text-[10px] text-zinc-400">lower is better</span>
            </div>
          )}

          {model.runs !== undefined && (
            <div className="flex flex-col rounded-lg border border-zinc-200 bg-zinc-50 p-2.5">
              <span className="text-[9.5px] font-semibold uppercase tracking-[0.1em] text-zinc-500">Runs</span>
              <span className="mt-1.5 text-[17px] font-semibold text-zinc-950">{model.runs}</span>
              <span className="mt-1 flex items-center gap-1 text-[10px] text-zinc-400"><Activity size={10} /> total prompts</span>
            </div>
          )}

          {model.top_competitor && (
            <div className="flex flex-col rounded-lg border border-red-200 bg-red-50/80 p-2.5">
              <span className="flex items-center gap-1 text-[9.5px] font-semibold uppercase tracking-[0.1em] text-red-600"><Swords size={10} /> Top rival</span>
              <span className="mt-1.5 truncate text-[13.5px] font-semibold text-red-950">{model.top_competitor.name}</span>
              <span className="mt-1 text-[11px] font-semibold text-red-700">{model.top_competitor.mention_rate}% SOV</span>
            </div>
          )}
        </div>

        <p className="mt-3 line-clamp-2 border-t border-zinc-200 pt-3 text-[12.5px] font-medium leading-5 text-zinc-600">{model.summary}</p>

        {model.top_sources && model.top_sources.length > 0 && (
          <div className="mt-4">
            <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-amber-700">Top sources for this model</div>
            <div className="flex flex-wrap gap-2">
              {model.top_sources.map((s, i) => (
                <div key={i} className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5">
                  <span className="text-[12px] font-semibold text-zinc-950">{s.domain}</span>
                  <span className="text-[10px] font-semibold text-zinc-400">{s.citations} citations</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {model.strengths?.length > 0 && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50/70 p-3">
              <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-emerald-700">Strengths</div>
              <ul className="flex flex-col gap-2">
                {model.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-[12.5px] font-medium text-emerald-900/85">
                    <CheckCircle2 size={13} className="mt-0.5 shrink-0 text-emerald-600" />
                    <span className="leading-snug">{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Risk box: neutral/reassuring styling when there's nothing real to flag, red only for actual named risks */}
          {model.risks?.length > 0 && (
            <div className={`rounded-lg border p-3 ${realRisks ? "border-red-200 bg-red-50/70" : "border-zinc-200 bg-zinc-50"}`}>
              <div className={`mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] ${realRisks ? "text-red-700" : "text-zinc-500"}`}>
                {realRisks ? <AlertTriangle size={11} /> : <ShieldCheck size={11} />}
                {realRisks ? "Risks" : "No risks flagged"}
              </div>
              <ul className="flex flex-col gap-2">
                {model.risks.map((r, i) => (
                  <li key={i} className={`flex items-start gap-2 text-[12.5px] font-medium ${realRisks ? "text-red-900/85" : "text-zinc-600"}`}>
                    {realRisks ? (
                      <AlertTriangle size={13} className="mt-0.5 shrink-0 text-red-600" />
                    ) : (
                      <ShieldCheck size={13} className="mt-0.5 shrink-0 text-zinc-400" />
                    )}
                    <span className="leading-snug">{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {model.recommended_action && (
          <div className="mt-3 flex items-start gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-3">
            <ArrowRight size={15} className="mt-0.5 shrink-0 text-zinc-500" />
            <div>
              <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-zinc-500">Recommended action</div>
              <p className="text-[12.5px] font-medium leading-relaxed text-zinc-600">{model.recommended_action}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}