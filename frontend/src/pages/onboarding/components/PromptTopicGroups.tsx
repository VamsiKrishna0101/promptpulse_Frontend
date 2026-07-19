import { Check, Lock, Trash2 } from "lucide-react"
import type { SuggestedPrompt } from "../types"

export function PromptTopicGroups({
  prompts,
  selected,
  limit,
  onToggle,
  onRemovePrompt,
}: {
  prompts: SuggestedPrompt[]
  selected: Set<number>
  limit: number
  onToggle: (index: number) => void
  onRemovePrompt: (index: number) => void
}) {
  const groups = new Map<string, Array<{ prompt: SuggestedPrompt; index: number }>>()
  prompts.forEach((prompt, index) => {
    const topic = prompt.topic.trim() || "Other"
    groups.set(topic, [...(groups.get(topic) ?? []), { prompt, index }])
  })

  return (
    <div className="mt-4 grid gap-3">
      {[...groups.entries()].map(([topic, rows]) => {
        const selectedInTopic = rows.filter(({ index }) => selected.has(index)).length
        return (
          <section key={topic} className="overflow-hidden rounded-xl border border-[#e4e4e7] bg-white">
            <header className="flex items-center justify-between border-b border-[#e4e4e7] bg-[#fafafa] px-4 py-3">
              <div>
                <h3 className="text-[13px] font-semibold text-[#18181b]">{topic}</h3>
                <p className="mt-0.5 text-[10.5px] font-medium text-[#71717a]">{rows.length} prompts in this buyer theme</p>
              </div>
              <span className="rounded-full border border-[#d4d4d8] bg-white px-2.5 py-1 text-[10px] font-semibold text-[#52525b]">
                {selectedInTopic} selected
              </span>
            </header>

            <div className="divide-y divide-[#f1f5f9]">
              {rows.map(({ prompt, index }) => {
                const checked = selected.has(index)
                const locked = !checked && selected.size >= limit
                return (
                  <div key={`${prompt.text}-${index}`} className={`grid grid-cols-[32px_1fr_auto] items-center gap-3 px-4 py-3 ${checked ? "bg-emerald-50/60" : "bg-white"}`}>
                    <button
                      type="button"
                      disabled={locked}
                      onClick={() => onToggle(index)}
                      className={`grid h-8 w-8 place-items-center rounded-lg border ${checked ? "border-emerald-200 bg-white text-emerald-700" : "border-[#e4e4e7] bg-[#fafafa] text-[#a1a1aa]"}`}
                    >
                      {checked ? <Check size={14} /> : locked ? <Lock size={12} /> : <span className="h-2 w-2 rounded-full bg-[#d4d4d8]" />}
                    </button>
                    <button type="button" disabled={locked} onClick={() => onToggle(index)} className="min-w-0 text-left disabled:cursor-not-allowed">
                      <p className="text-[12.5px] font-semibold leading-5 text-[#18181b]">{prompt.text}</p>
                      <p className="mt-1 text-[9.5px] font-semibold uppercase tracking-[0.1em] text-[#94a3b8]">
                        {prompt.type.replace(/_/g, " ")} · {prompt.source === "CUSTOMER" ? "Your prompt" : "Recommended"}
                      </p>
                    </button>
                    {prompt.source === "CUSTOMER" && (
                      <button type="button" onClick={() => onRemovePrompt(index)} aria-label="Remove prompt" className="grid h-8 w-8 place-items-center rounded-lg text-[#a1a1aa] hover:bg-red-50 hover:text-red-600">
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        )
      })}
    </div>
  )
}
