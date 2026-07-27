import { useState } from "react"
import { Link2, ArrowUpRight, Check, CheckCircle2, Clock3, ExternalLink, FileText, Loader2, Plus, Target } from "lucide-react"
import { Link } from "react-router-dom"
import type { OpportunityItem } from "@/hooks/useOpportunities"
import { actionabilityLabel, bucketLabel, confidenceLabel, impactMeta, outcomeMeta } from "./opportunityMeta"

function OutcomePill({ label, outcome }: { label: string; outcome: OpportunityItem["brand_outcome"] }) {
  const meta = outcomeMeta(outcome)
  return (
    <div className="rounded-xl border border-[#E3EAF1] bg-[#F8FAFC] px-3 py-2.5">
      <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#95A1B1]">{label}</p>
      <span className={`mt-1.5 inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold ${meta.cls}`}>
        {meta.label}
      </span>
    </div>
  )
}

export function OpportunityCard({
  item,
  onCreateAction,
}: {
  item: OpportunityItem
  onCreateAction: (item: OpportunityItem) => Promise<void>
}) {
  const [creating, setCreating] = useState(false)
  const [created, setCreated] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  async function createAction() {
    setCreating(true)
    setActionError(null)
    try {
      await onCreateAction(item)
      setCreated(true)
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Could not create action")
    } finally {
      setCreating(false)
    }
  }

  return (
    <article className="overflow-hidden rounded-[20px] border border-[#DDE5EE] bg-white shadow-[0_18px_52px_-42px_rgba(15,23,42,0.42)] transition hover:border-[#BFDDF3] hover:shadow-[0_24px_60px_-42px_rgba(14,116,144,0.30)]">
      <div className="border-b border-[#E9EFF5] px-5 py-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className={`rounded-full px-2.5 py-1 text-[9.5px] font-bold uppercase tracking-[0.08em] ${impactMeta(item.impact)}`}>
                {item.impact} impact
              </span>
              <span className="rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-[9.5px] font-bold text-sky-700">
                {item.buyer_intent.label}
              </span>
              <span className="rounded-full border border-[#DDE5EE] bg-white px-2.5 py-1 text-[9.5px] font-semibold text-[#68778A]">
                {item.buyer_intent.stage}
              </span>
            </div>
            <h2 className="mt-3 text-[17px] font-semibold leading-snug tracking-[-0.02em] text-[#071225]">{item.title}</h2>
            <p className="mt-1.5 text-[12px] leading-5 text-[#607084]">{item.business_reason}</p>
          </div>
          <div className="min-w-[64px] rounded-xl border border-[#DDE5EE] bg-[#F8FAFC] px-3 py-2 text-center">
            <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-[#98A4B3]">Impact</p>
            <p className="mt-0.5 text-[21px] font-semibold tracking-[-0.03em] text-[#071225]">{item.impact_score}</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <OutcomePill label="Your brand" outcome={item.brand_outcome} />
          <OutcomePill label={item.competitor_name} outcome={item.competitor_outcome} />
        </div>
        <p className="mt-2.5 text-[11px] font-medium text-[#728195]">{item.outcome_explanation}</p>
      </div>

      <div className="space-y-4 px-5 py-5">
        <div>
          <div className="flex items-center gap-2">
            <Target size={14} className="text-sky-600" />
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#7C8A9C]">Buyer question</p>
          </div>
          <p className="mt-2 text-[13px] font-semibold leading-5 text-[#1D2B3D]">{item.prompt_text}</p>
          <p className="mt-1 text-[11px] leading-5 text-[#728195]">{item.buyer_intent.reason}</p>
        </div>

        <div className="rounded-2xl border border-[#D9E8F3] bg-[linear-gradient(135deg,#f8fcff_0%,#eef8ff_100%)] p-4">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-[#071225] text-white">
              <FileText size={15} />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-sky-700">Recommended work</p>
                <span className="rounded-full bg-white px-2 py-0.5 text-[9.5px] font-bold text-[#526174] ring-1 ring-[#D9E8F3]">
                  {item.content_gap.action}
                </span>
              </div>
              <h3 className="mt-1.5 text-[14px] font-semibold leading-5 text-[#071225]">{item.content_gap.suggested_title}</h3>
              <p className="mt-1.5 text-[11.5px] leading-5 text-[#607084]">{item.next_step}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-[#E3EAF1] p-3">
            <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#95A1B1]">Target page</p>
            {item.target_page.url ? (
              <a href={item.target_page.url} target="_blank" rel="noreferrer" className="mt-2 flex items-start gap-2 text-[11.5px] font-semibold leading-4 text-sky-700 hover:underline">
                <ExternalLink size={12} className="mt-0.5 flex-none" />
                <span className="line-clamp-2">{item.target_page.label}</span>
              </a>
            ) : (
              <p className="mt-2 text-[11.5px] font-semibold text-[#243247]">{item.target_page.label}</p>
            )}
            <p className="mt-1.5 text-[10.5px] leading-4 text-[#7C8A9C]">{item.target_page.reason}</p>
          </div>

          <div className="rounded-xl border border-[#E3EAF1] p-3">
            <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#95A1B1]">Verification</p>
            <p className="mt-2 text-[11.5px] font-semibold leading-4 text-[#243247]">{item.verification.success_metric}</p>
            <p className="mt-1.5 inline-flex items-center gap-1.5 text-[10.5px] font-medium text-[#7C8A9C]">
              <Clock3 size={11} />
              Recheck after {item.verification.recheck_after_days} days
            </p>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between gap-3">
            <p className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#7C8A9C]">
              <Link2 size={12} />
              Supporting evidence
            </p>
            <span className="text-[10px] font-semibold text-[#95A1B1]">{item.clean_evidence_count}/{item.evidence_count} clean answers</span>
          </div>
          {item.top_sources.length ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {item.top_sources.map(source => {
                const content = (
                  <>
                    <span className="max-w-[170px] truncate">{source.domain}</span>
                    <span className="text-[#9AA7B7]">{source.citations ? `${source.citations} cited` : `${source.mentions} seen`}</span>
                  </>
                )
                return source.url ? (
                  <a key={source.domain} href={source.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-full border border-[#DDE5EE] bg-[#F8FAFC] px-2.5 py-1.5 text-[10px] font-semibold text-[#526174] transition hover:border-sky-300 hover:text-sky-700">
                    {content}
                    <ArrowUpRight size={10} />
                  </a>
                ) : (
                  <span key={source.domain} className="inline-flex items-center gap-1.5 rounded-full border border-[#DDE5EE] bg-[#F8FAFC] px-2.5 py-1.5 text-[10px] font-semibold text-[#526174]">
                    {content}
                  </span>
                )
              })}
            </div>
          ) : (
            <p className="mt-2 text-[11px] text-[#8A98AA]">No reliable source pattern is available yet. Review the raw answer before acting.</p>
          )}
        </div>

        <div className="flex flex-col gap-3 border-t border-[#E9EFF5] pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold text-[#728195]">
            <span>{bucketLabel(item.opportunity_bucket)}</span>
            <span className="h-1 w-1 rounded-full bg-[#CBD5E1]" />
            <span>{confidenceLabel(item.confidence)}</span>
            <span className="h-1 w-1 rounded-full bg-[#CBD5E1]" />
            <span>{actionabilityLabel(item.actionability)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Link to={`/prompts/${item.prompt_id}`} className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-[#DDE5EE] px-3 text-[11px] font-semibold text-[#526174] transition hover:border-sky-300 hover:text-sky-700">
              View evidence
              <ArrowUpRight size={12} />
            </Link>
            <button
              type="button"
              disabled={creating || created}
              onClick={() => void createAction()}
              className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-[#071225] px-3.5 text-[11px] font-semibold text-white transition hover:bg-[#102342] disabled:cursor-default disabled:bg-emerald-600"
            >
              {creating ? <Loader2 size={13} className="animate-spin" /> : created ? <Check size={13} /> : <Plus size={13} />}
              {creating ? "Creating..." : created ? "Added to action center" : "Create action"}
            </button>
          </div>
        </div>
        {actionError && <p className="rounded-lg bg-rose-50 px-3 py-2 text-[11px] font-medium text-rose-700">{actionError}</p>}
        {created && (
          <p className="inline-flex items-center gap-1.5 text-[10.5px] font-medium text-emerald-700">
            <CheckCircle2 size={12} />
            Baseline and verification target were saved with this action.
          </p>
        )}
      </div>
    </article>
  )
}

