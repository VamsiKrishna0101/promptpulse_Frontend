import { CardHeader, DashboardCard, ProductPageShell } from "./ProductShared"
import { Sparkles, ArrowUpRight } from "lucide-react"

export function SaraProductPage() {
  return (
    <ProductPageShell
      eyebrow="Sara Assistant"
      active="Overview"
      title={<>Ask your AI visibility data what changed and what to fix.</>}
      description="Sara is a project-aware assistant that reads your prompts, model answers, sources, competitors, and sentiment evidence before responding."
      metrics={[
        { label: "Context", value: "7d+", note: "Requires enough data", accent: "blue" },
        { label: "Evidence", value: "RAG", note: "Project-specific answers", accent: "green" },
        { label: "Output", value: "Actions", note: "What to fix next", accent: "orange" },
        { label: "Mode", value: "Live", note: "Streaming assistant UI", accent: "slate" },
      ]}
    >
      <div className="grid gap-5 xl:grid-cols-[0.75fr_1fr]">
        <DashboardCard>
          <CardHeader title="What Sara can answer" subtitle="Not generic chat. It reads your project evidence." />
          {[
            "Why did visibility drop this week?",
            "Which sources should we target next?",
            "Which competitors are gaining on us?",
            "What content should we refresh first?",
          ].map((question) => (
            <button
              key={question}
              className="group flex w-full items-center justify-between border-b border-zinc-100 px-5 py-4 text-left transition last:border-b-0 hover:bg-zinc-50"
            >
              <div>
                <p className="text-[14px] font-black text-zinc-900">{question}</p>
                <p className="mt-1 text-[12px] font-medium text-zinc-400">Answered from prompts, sources, competitors, and sentiment.</p>
              </div>
              <ArrowUpRight
                size={15}
                strokeWidth={2.5}
                className="ml-3 shrink-0 text-zinc-300 opacity-0 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-zinc-500 group-hover:opacity-100"
              />
            </button>
          ))}
        </DashboardCard>

        <div className="relative overflow-hidden rounded-2xl border border-zinc-900 bg-zinc-950 shadow-[0_35px_90px_-60px_rgba(0,0,0,0.9)]">
          {/* subtle top glow, no flat fill */}
          <div className="pointer-events-none absolute inset-x-0 -top-24 h-48 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.18),transparent_70%)]" />

          <div className="relative flex min-h-[62px] items-center justify-between border-b border-white/10 px-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/15 bg-white/[0.06] text-indigo-300">
                <Sparkles size={17} strokeWidth={2} />
              </div>
              <div>
                <p className="text-[15px] font-black text-white">Sara</p>
                <p className="text-[12px] font-medium text-zinc-500">Northstar / Overview</p>
              </div>
            </div>
            <span className="flex items-center gap-1.5 rounded-full border border-emerald-400/25 px-3 py-1 text-[11px] font-black text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Ready
            </span>
          </div>

          <div className="relative space-y-5 p-6">
            <div className="ml-auto max-w-[72%] rounded-3xl border border-indigo-400/20 bg-indigo-500/10 px-5 py-4 text-[14px] font-bold leading-6 text-indigo-50">
              Summarize why our visibility changed this week.
            </div>

            <div className="max-w-[84%] space-y-3">
              <div className="rounded-3xl border border-white/10 bg-white/[0.04] px-5 py-4 text-[14px] font-medium leading-7 text-zinc-200">
                Northstar visibility improved after Gemini and ChatGPT started citing your comparison page again. The biggest remaining gap is Reddit and G2 proof, where PromptWatch and Peec AI are still referenced more often.
              </div>
              <p className="pl-1 text-[11px] font-bold uppercase tracking-[0.1em] text-zinc-600">Suggested next steps</p>
            </div>

            <div className="grid gap-2 sm:grid-cols-3">
              {["Refresh G2 proof", "Target Reddit thread", "Update comparison page"].map((item) => (
                <button
                  key={item}
                  className="group rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-left text-[12px] font-bold text-zinc-300 transition hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
                >
                  {item}
                  <ArrowUpRight
                    size={12}
                    strokeWidth={2.5}
                    className="ml-1 inline-block -translate-y-px text-zinc-600 transition group-hover:text-indigo-300"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ProductPageShell>
  )
}