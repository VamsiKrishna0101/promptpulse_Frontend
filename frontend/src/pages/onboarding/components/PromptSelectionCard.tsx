import { CheckCheck, RotateCcw, Search } from "lucide-react"
import type { SuggestedPrompt } from "../types"
import { PromptImportPanel } from "./PromptImportPanel"
import { PromptTopicGroups } from "./PromptTopicGroups"

export function PromptSelectionCard({
  prompts,
  selected,
  limit,
  onToggle,
  onSelectionChange,
  customPromptText,
  customPromptTopic,
  onCustomPromptTextChange,
  onCustomPromptTopicChange,
  onAddCustomPrompt,
  onImportPrompts,
  onRemovePrompt,
}: {
  prompts: SuggestedPrompt[]
  selected: Set<number>
  limit: number
  onToggle: (index: number) => void
  onSelectionChange: (indices: Set<number>) => void
  customPromptText: string
  customPromptTopic: string
  onCustomPromptTextChange: (value: string) => void
  onCustomPromptTopicChange: (value: string) => void
  onAddCustomPrompt: () => void
  onImportPrompts: (prompts: SuggestedPrompt[]) => void
  onRemovePrompt: (index: number) => void
}) {
  const topics = [...new Set(prompts.map((prompt) => prompt.topic).filter(Boolean))]
  const unusedCount = prompts.length - selected.size

  function selectBalanced() {
    const queues = topics.map((topic) => prompts
      .map((prompt, index) => ({ prompt, index }))
      .filter(({ prompt }) => prompt.topic === topic)
      .map(({ index }) => index))
    const next = new Set<number>()
    while (next.size < limit && queues.some((queue) => queue.length)) {
      for (const queue of queues) {
        const index = queue.shift()
        if (index !== undefined) next.add(index)
        if (next.size >= limit) break
      }
    }
    onSelectionChange(next)
  }

  return (
    <section className="rounded-2xl border border-[#e4e4e7] bg-[#fafafa] p-4 shadow-[0_1px_3px_rgba(9,9,11,0.05)]">
      <div className="flex flex-col gap-4 border-b border-[#e4e4e7] pb-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-[#e4e4e7] bg-white px-3 py-1.5 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[#71717a]">
            <Search size={12} /> Topic-first prompt library
          </p>
          <h2 className="mt-3 text-[24px] font-semibold tracking-[-0.04em] text-[#18181b]">Choose the buyer conversations to track.</h2>
          <p className="mt-2 max-w-2xl text-[13px] font-medium leading-6 text-[#52525b]">
            Selected prompts power the first run. The other {unusedCount} prompts are still saved under Suggestions, ready to activate later without losing your work.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => onSelectionChange(new Set())} disabled={!selected.size} className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#e4e4e7] bg-white px-3 text-[12px] font-semibold text-[#52525b] disabled:opacity-40">
            <RotateCcw size={13} /> Deselect all
          </button>
          <button type="button" onClick={selectBalanced} disabled={!prompts.length} className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#e4e4e7] bg-white px-3 text-[12px] font-semibold text-[#18181b] disabled:opacity-40">
            <CheckCheck size={13} /> Balance across topics
          </button>
          <div className="rounded-xl border border-[#e4e4e7] bg-white px-4 py-2 text-right">
            <p className="text-[9.5px] font-semibold uppercase tracking-[0.12em] text-[#a1a1aa]">PAYG active pool</p>
            <p className="mt-0.5 text-[22px] font-semibold tracking-[-0.04em] text-[#18181b]">{selected.size} selected</p>
            <p className="text-[10px] text-[#71717a]">No subscription prompt cap</p>
          </div>
        </div>
      </div>

      <PromptImportPanel
        customPromptText={customPromptText}
        customPromptTopic={customPromptTopic}
        topics={topics}
        onCustomPromptTextChange={onCustomPromptTextChange}
        onCustomPromptTopicChange={onCustomPromptTopicChange}
        onAddCustomPrompt={onAddCustomPrompt}
        onImportPrompts={onImportPrompts}
      />

      <PromptTopicGroups prompts={prompts} selected={selected} limit={limit} onToggle={onToggle} onRemovePrompt={onRemovePrompt} />
    </section>
  )
}
