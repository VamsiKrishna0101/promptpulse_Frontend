import { Bot, RefreshCw } from "lucide-react"
import { timeAgo } from "@/tabs/overview/overview"
import type { SeoAudit } from "@/hooks/useSeoAudit"

export function SeoHero({
  audit,
  costs,
  isRunning,
  canRun,
  onRunFull,
}: {
  audit: SeoAudit | null
  costs: { quick_scan: number; full_audit_max: number }
  isRunning: boolean
  canRun: boolean
  onRunFull: () => void
}) {
  return (
    <section className="relative overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_2px_24px_-8px_rgba(15,23,42,0.08),0_1px_2px_rgba(15,23,42,0.04)]">
      {/* Subtle top shine */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />
      {/* Soft gradient accent */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_70%_-20%,rgba(99,102,241,0.06),transparent)]" />

      <div className="relative flex flex-col gap-5 px-6 py-6 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10.5px] font-black uppercase tracking-[0.12em] text-slate-500">
            <Bot size={11} /> SEO Intelligence
          </span>
          <h1 className="mt-3 text-[23px] font-black tracking-[-0.05em] text-slate-900">
            SEO that helps Google and AI recommend you.
          </h1>
          <p className="mt-1.5 max-w-[720px] text-[13px] font-medium leading-6 text-slate-500">
            Keyword intent, page coverage, AI visibility, local SEO, content gaps, and technical crawl health — one workflow.
          </p>
        </div>

        <div className="relative flex flex-wrap items-center gap-2.5 xl:flex-shrink-0">
          {audit ? (
            <>
              <span className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-[11px] font-semibold text-slate-500">
                Last audit {timeAgo(audit.created_at)} · {costs.full_audit_max} credits
              </span>
              <button
                onClick={onRunFull}
                disabled={isRunning || !canRun}
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-slate-900 px-5 text-[12.5px] font-black text-white shadow-[0_8px_24px_-8px_rgba(15,23,42,0.45)] transition hover:bg-slate-800 hover:shadow-[0_12px_28px_-8px_rgba(15,23,42,0.55)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw size={13} className={isRunning ? "animate-spin" : ""} />
                {isRunning ? "Running…" : `Run full audit · ${costs.full_audit_max} credits`}
              </button>
            </>
          ) : (
            <div className="flex flex-wrap gap-2">
              <span className="rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-[11px] font-black text-blue-600">
                Quick scan · {costs.quick_scan} credit
              </span>
              <span className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-[11px] font-black text-slate-600">
                Full audit · {costs.full_audit_max} credits
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
