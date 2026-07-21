import { FileUp, Plus } from "lucide-react"
import { useRef, useState } from "react"
import type { FormEvent } from "react"
import { useToast } from "@/components/ui/Toast"
import type { SuggestedPrompt } from "../types"
import { parsePromptImport } from "../promptImport"

export function PromptImportPanel({
  customPromptText,
  customPromptTopic,
  topics,
  onCustomPromptTextChange,
  onCustomPromptTopicChange,
  onAddCustomPrompt,
  onImportPrompts,
}: {
  customPromptText: string
  customPromptTopic: string
  topics: string[]
  onCustomPromptTextChange: (value: string) => void
  onCustomPromptTopicChange: (value: string) => void
  onAddCustomPrompt: () => void
  onImportPrompts: (prompts: SuggestedPrompt[]) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isReading, setIsReading] = useState(false)
  const { toast } = useToast()

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onAddCustomPrompt()
  }

  async function readFile(file?: File) {
    if (!file) return
    setIsReading(true)
    try {
      const result = parsePromptImport(file.name, await file.text())
      if (!result.prompts.length) throw new Error("No valid prompts found. Use one prompt per TXT line or a CSV prompt/text column.")
      onImportPrompts(result.prompts)
      toast({
        title: `${result.prompts.length} prompts imported`,
        description: result.truncated
          ? "The first 500 rows were saved. Extra rows were skipped."
          : result.rejected
            ? `${result.rejected} empty, duplicate, or invalid rows were skipped.`
            : "All imported prompts will be saved in your prompt library.",
        type: "success",
      })
    } catch (error) {
      toast({
        title: "Import could not be completed",
        description: error instanceof Error ? error.message : "Please check the file and try again.",
        type: "warning",
      })
    } finally {
      setIsReading(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  return (
    <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_280px]">
      <form onSubmit={submit} className="rounded-xl border border-[#e4e4e7] bg-white p-3">
        <div className="grid gap-2 sm:grid-cols-[180px_1fr_auto] sm:items-end">
          <label className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#71717a]">
            Topic
            <input
              list="onboarding-prompt-topics"
              value={customPromptTopic}
              onChange={(event) => onCustomPromptTopicChange(event.target.value)}
              className="mt-2 h-10 w-full rounded-lg border border-[#e4e4e7] bg-[#fafafa] px-3 text-[12px] normal-case tracking-normal outline-none focus:border-[#09090b]"
            />
            <datalist id="onboarding-prompt-topics">
              {topics.map((topic) => <option key={topic} value={topic} />)}
            </datalist>
          </label>
          <label className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#71717a]">
            Add one prompt
            <input
              value={customPromptText}
              onChange={(event) => onCustomPromptTextChange(event.target.value)}
              placeholder="Which platform is best for my team?"
              className="mt-2 h-10 w-full rounded-lg border border-[#e4e4e7] bg-[#fafafa] px-3 text-[12px] normal-case tracking-normal outline-none focus:border-[#09090b]"
            />
          </label>
          <button disabled={customPromptText.trim().length < 8} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#09090b] px-4 text-[12px] font-semibold text-white disabled:opacity-40">
            <Plus size={14} /> Add
          </button>
        </div>
      </form>

      <div
        className="relative flex min-h-20 items-center gap-3 rounded-xl border border-dashed border-[#cbd5e1] bg-[#f8fafc] px-4 text-left transition hover:border-[#94a3b8] hover:bg-white data-[disabled=true]:opacity-60"
        data-disabled={isReading}
      >
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isReading}
          className="absolute inset-0 z-0 h-full w-full rounded-xl"
          aria-label="Upload file"
        />
        <span className="relative z-10 pointer-events-none grid h-9 w-9 place-items-center rounded-lg bg-white text-[#0f172a] shadow-sm"><FileUp size={16} /></span>
        <span className="relative z-10 pointer-events-none">
          <strong className="block text-[12px] text-[#18181b]">Bulk upload CSV or TXT</strong>
          <span className="mt-1 block text-[10.5px] leading-4 text-[#71717a]">
            CSV columns: prompt (required), topic (required), type.{' '}
            <button
              type="button"
              className="pointer-events-auto text-[#0f172a] underline hover:text-black"
              onClick={(e) => {
                e.stopPropagation()
                const content = "prompt,topic,type\nWhat are the best CRM tools?,Sales,buyer_question\nHow to improve SEO?,Marketing,customer_prompt\nWhat is your pricing?,Pricing, "
                const blob = new Blob([content], { type: 'text/csv' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = 'example_prompts.csv'
                document.body.appendChild(a)
                a.click()
                document.body.removeChild(a)
                URL.revokeObjectURL(url)
              }}
            >
              Download example CSV
            </button>
          </span>
        </span>
        <input ref={inputRef} type="file" accept=".csv,.txt,text/csv,text/plain" hidden onChange={(event) => void readFile(event.target.files?.[0])} />
      </div>
    </div>
  )
}
