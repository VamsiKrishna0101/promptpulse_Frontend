import { Check, Lock, Search, RotateCcw, CheckCheck, Plus, Trash2 } from "lucide-react"
import type { FormEvent } from "react"
import type { SuggestedPrompt } from "../types"

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ")
}

export function PromptSelectionCard({
  prompts,
  selected,
  limit,
  plan,
  totalLimit,
  usedAcrossProjects,
  onToggle,
  customPromptText,
  onCustomPromptTextChange,
  onAddCustomPrompt,
  onRemovePrompt,
}: {
  prompts: SuggestedPrompt[]
  selected: Set<number>
  limit: number
  plan: string
  totalLimit?: number
  usedAcrossProjects?: number
  onToggle: (index: number) => void
  customPromptText: string
  onCustomPromptTextChange: (value: string) => void
  onAddCustomPrompt: () => void
  onRemovePrompt: (index: number) => void
}) {
  const selectedCount = selected.size
  const hasSelected = selectedCount > 0

  function deselectAll() {
    Array.from(selected).forEach((index) => onToggle(index))
  }

  function handleCustomPromptSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onAddCustomPrompt()
  }

  function selectFirstLimit() {
    // First remove existing selections, then select first available prompts up to the remaining account limit.
    Array.from(selected).forEach((index) => onToggle(index))

    prompts.slice(0, limit).forEach((_, index) => {
      if (!selected.has(index)) {
        setTimeout(() => onToggle(index), 0)
      }
    })
  }

  return (
    <section className="rounded-2xl border border-[#e4e4e7] bg-[#fafafa] p-4 shadow-[0_1px_3px_rgba(9,9,11,0.05)]">
      <div className="flex flex-col gap-4 border-b border-[#e4e4e7] pb-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-[#e4e4e7] bg-white px-3 py-1.5 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[#71717a]">
            <Search size={12} />
            Prompt shortlist
          </p>

          <h2 className="mt-3 text-[24px] font-semibold tracking-[-0.04em] text-[#18181b]">
            Select prompts to track first.
          </h2>

          <p className="mt-2 max-w-2xl text-[13px] font-medium leading-6 text-[#52525b]">
            Choose the buyer questions that matter most. Selected prompts will be used
            for your first AI visibility baseline.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={deselectAll}
            disabled={!hasSelected}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#e4e4e7] bg-white px-3 text-[12px] font-semibold text-[#52525b] transition hover:border-[#d4d4d8] hover:text-[#18181b] disabled:cursor-not-allowed disabled:opacity-45"
          >
            <RotateCcw size={13} />
            Deselect all
          </button>

          <button
            type="button"
            onClick={selectFirstLimit}
            disabled={!prompts.length}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#e4e4e7] bg-white px-3 text-[12px] font-semibold text-[#52525b] transition hover:border-[#d4d4d8] hover:text-[#18181b] disabled:cursor-not-allowed disabled:opacity-45"
          >
            <CheckCheck size={13} />
            Select first {limit}
          </button>

          <div className="rounded-xl border border-[#e4e4e7] bg-white px-4 py-2 text-right">
            <p className="text-[9.5px] font-semibold uppercase tracking-[0.12em] text-[#a1a1aa]">
              {plan} pool
            </p>

            <p className="mt-0.5 text-[22px] font-semibold tracking-[-0.04em] text-[#18181b]">
              {selectedCount} / {limit}
            </p>

            {typeof totalLimit === "number" && typeof usedAcrossProjects === "number" && (
              <p className="mt-1 text-[10.5px] font-medium text-[#71717a]">
                {usedAcrossProjects} / {totalLimit} used
              </p>
            )}
          </div>
        </div>
      </div>

      <form
        onSubmit={handleCustomPromptSubmit}
        className="mt-4 rounded-2xl border border-[#e4e4e7] bg-white p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]"
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
          <div className="min-w-0 flex-1">
            <label className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#a1a1aa]">
              Add your own prompt
            </label>

            <textarea
              value={customPromptText}
              onChange={(event) => onCustomPromptTextChange(event.target.value)}
              rows={2}
              placeholder="Example: Which AI visibility tools are best for seed-stage B2B SaaS companies?"
              className="mt-2 w-full resize-none rounded-xl border border-[#e4e4e7] bg-[#fafafa] px-3 py-2.5 text-[13px] font-medium leading-5 text-[#18181b] outline-none transition placeholder:text-[#a1a1aa] focus:border-[#09090b] focus:bg-white"
            />
          </div>

          <button
            type="submit"
            disabled={!customPromptText.trim() || selectedCount >= limit}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#09090b] px-4 text-[12px] font-semibold text-white transition hover:bg-[#27272a] disabled:cursor-not-allowed disabled:opacity-45"
          >
            <Plus size={14} />
            Add prompt
          </button>
        </div>

        {selectedCount >= limit && (
          <p className="mt-2 text-[11px] font-medium text-[#71717a]">
            You have used the remaining prompts in your shared {plan} pool. Deselect or remove one to add another.
          </p>
        )}
      </form>

      <div className="mt-4 grid gap-2">
        {prompts.map((prompt, index) => {
          const checked = selected.has(index)
          const locked = !checked && selected.size >= limit
          const isCustom = prompt.topic.toLowerCase() === "custom"

          return (
            <div
              key={`${prompt.text}-${index}`}
              className={cn(
                "group grid grid-cols-[34px_1fr_auto] items-start gap-3 rounded-xl border p-3 text-left transition",
                checked &&
                "border-emerald-200 bg-emerald-50/70 shadow-[0_1px_2px_rgba(9,9,11,0.04)]",
                locked &&
                "cursor-not-allowed border-[#e4e4e7] bg-[#f4f4f5] opacity-65",
                !checked &&
                !locked &&
                "border-[#e4e4e7] bg-white hover:border-[#d4d4d8] hover:bg-[#fafafa]",
              )}
            >
              <button
                type="button"
                onClick={() => onToggle(index)}
                disabled={locked}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg border text-[12px] font-semibold",
                  checked && "border-emerald-200 bg-white text-emerald-700",
                  locked && "border-[#e4e4e7] bg-white text-[#a1a1aa]",
                  !checked && !locked && "border-[#e4e4e7] bg-[#f4f4f5] text-[#71717a]",
                )}
              >
                {checked ? <Check size={14} /> : locked ? <Lock size={13} /> : index + 1}
              </button>

              <button
                type="button"
                onClick={() => onToggle(index)}
                disabled={locked}
                className="min-w-0 text-left disabled:cursor-not-allowed"
              >
                <span className="mb-1.5 flex flex-wrap items-center gap-1.5">
                  <span
                    className={cn(
                      "rounded-full border px-2 py-0.5 text-[9.5px] font-semibold uppercase tracking-[0.1em]",
                      checked
                        ? "border-emerald-200 bg-white text-emerald-700"
                        : "border-[#e4e4e7] bg-[#fafafa] text-[#71717a]",
                    )}
                  >
                    {prompt.topic || "Buyer intent"}
                  </span>

                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[9.5px] font-semibold text-[#71717a]",
                      checked ? "bg-white/70" : "bg-[#f4f4f5]",
                    )}
                  >
                    {prompt.type || "tracking"}
                  </span>
                </span>

                <span
                  className={cn(
                    "block text-[13px] font-semibold leading-5",
                    checked ? "text-emerald-950" : "text-[#18181b]",
                    locked && "text-[#71717a]",
                  )}
                >
                  {prompt.text}
                </span>
              </button>

              <span className="flex items-center gap-2">
                <span
                  className={cn(
                    "hidden rounded-lg px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] sm:inline-flex",
                    checked && "border border-emerald-200 bg-white text-emerald-700",
                    locked && "border border-[#e4e4e7] bg-white text-[#a1a1aa]",
                    !checked && !locked && "border border-[#e4e4e7] bg-[#fafafa] text-[#a1a1aa]",
                  )}
                >
                  {checked ? "Selected" : locked ? "Limit" : "Add"}
                </span>

                {isCustom && (
                  <button
                    type="button"
                    onClick={() => onRemovePrompt(index)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#e4e4e7] bg-white text-[#a1a1aa] transition hover:border-red-200 hover:text-red-600"
                    aria-label="Remove custom prompt"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </span>
            </div>
          )
        })}
      </div>
    </section>
  )
}
