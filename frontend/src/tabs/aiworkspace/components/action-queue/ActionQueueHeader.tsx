import { ArrowLeft, ListChecks, RefreshCw, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/Button"

interface ActionQueueHeaderProps {
  brandName: string
  onBack: () => void
  onRefresh: () => void
  onGenerate: () => void
  isRefreshing: boolean
  isGenerating: boolean
}

export function ActionQueueHeader({
  brandName,
  onBack,
  onRefresh,
  onGenerate,
  isRefreshing,
  isGenerating,
}: ActionQueueHeaderProps) {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-7 shadow-[0_1px_3px_rgba(15,23,42,0.03)]">
      <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-emerald-100/60 blur-3xl" />
      <div className="relative flex flex-wrap items-start justify-between gap-5">
        <div>
          <button
            type="button"
            onClick={onBack}
            className="mb-4 inline-flex items-center gap-2 text-[13px] font-semibold text-zinc-500 transition hover:text-zinc-950"
          >
            <ArrowLeft size={15} />
            AI Workspace
          </button>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-700">
            <ListChecks size={13} />
            Action Queue
          </div>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-zinc-950">
            Next best actions for {brandName}
          </h1>
          <p className="mt-2 max-w-2xl text-[13px] leading-6 text-zinc-500">
            Converts prompt gaps, source gaps, weak models, and sentiment issues into a prioritized execution queue.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onRefresh} isLoading={isRefreshing}>
            <RefreshCw size={15} />
            Refresh
          </Button>
          <Button onClick={onGenerate} isLoading={isGenerating}>
            <Sparkles size={15} />
            Generate queue
          </Button>
        </div>
      </div>
    </section>
  )
}
