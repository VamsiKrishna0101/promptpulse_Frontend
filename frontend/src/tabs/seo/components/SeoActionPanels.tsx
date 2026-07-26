import { CheckCircle2, ExternalLink } from "lucide-react"
import type { SeoAudit, SeoIntelligence } from "@/hooks/useSeoAudit"
import { priorityClass } from "../lib/seoUi"

function PanelShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_1px_8px_-2px_rgba(15,23,42,0.06)]">
      <div className="border-b border-slate-50 bg-slate-50/50 px-5 py-4">
        <h2 className="text-[14px] font-black tracking-[-0.025em] text-slate-900">{title}</h2>
        <p className="mt-0.5 text-[12px] font-medium text-slate-500">{subtitle}</p>
      </div>
      <div className="grid gap-2.5 p-4">{children}</div>
    </section>
  )
}

function ItemBadge({ children, variant = "neutral" }: { children: React.ReactNode; variant?: "neutral" | "priority" }) {
  return (
    <span className={`rounded-lg border px-2 py-1 text-[10.5px] font-black ${variant === "priority" ? priorityClass(String(children)) : "border-slate-100 bg-slate-50 text-slate-500"}`}>
      {children}
    </span>
  )
}

export function SeoActionsPanel({ audit }: { audit: SeoAudit }) {
  return (
    <PanelShell
      title="Action plan"
      subtitle="Simple work orders your team or agency can execute."
    >
      {audit.actions.slice(0, 8).map(action => (
        <div key={action.id} className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
          <div className="flex flex-wrap items-center gap-1.5">
            <ItemBadge variant="priority">{action.priority}</ItemBadge>
            <ItemBadge>{action.difficulty} effort</ItemBadge>
          </div>
          <h3 className="mt-2 text-[13px] font-black text-slate-900">{action.title}</h3>
          <p className="mt-1 text-[12px] font-medium leading-5 text-slate-500">{action.description}</p>
          {action.page_url ? (
            <a
              href={action.page_url}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex max-w-full items-center gap-1.5 truncate rounded-lg border border-sky-100 bg-sky-50 px-2.5 py-1.5 text-[11px] font-bold text-sky-700 hover:bg-sky-100"
            >
              <ExternalLink size={12} className="flex-shrink-0" />
              <span className="truncate">Open affected page</span>
            </a>
          ) : (
            <span className="mt-3 inline-flex w-fit rounded-lg border border-amber-100 bg-amber-50 px-2.5 py-1.5 text-[11px] font-bold text-amber-700">
              No existing page — create one
            </span>
          )}
        </div>
      ))}
      {audit.actions.length === 0 && (
        <div className="py-8 text-center text-[13px] font-semibold text-slate-400">No actions generated.</div>
      )}
    </PanelShell>
  )
}

export function SeoContentPlanPanel({ intelligence }: { intelligence: SeoIntelligence | null }) {
  const opportunities = intelligence?.content_opportunities ?? []
  return (
    <PanelShell
      title="Content opportunities"
      subtitle="Pages to create or improve for high-intent SEO and AI-search queries."
    >
      {opportunities.slice(0, 8).map(item => (
        <div key={item.id} className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
          <div className="flex flex-wrap items-center gap-1.5">
            <ItemBadge variant="priority">{item.priority}</ItemBadge>
            <ItemBadge>{item.recommended_page_type}</ItemBadge>
          </div>
          <h3 className="mt-2 text-[13px] font-black text-slate-900">{item.title}</h3>
          <p className="mt-1 text-[12px] font-medium leading-5 text-slate-500">{item.description}</p>
          <p className="mt-2.5 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-[11px] font-bold text-slate-500">
            Target: {item.target_keyword}
          </p>
        </div>
      ))}
      {opportunities.length === 0 && (
        <div className="py-8 text-center text-[13px] font-semibold text-slate-400">
          No content gaps found from current prompts and crawled pages.
        </div>
      )}
    </PanelShell>
  )
}

export function SeoLocalChecklistPanel({ intelligence }: { intelligence: SeoIntelligence | null }) {
  const items = intelligence?.local_checklist ?? []
  return (
    <PanelShell
      title="Local SEO checklist"
      subtitle="Especially useful for hospitals, clinics, agencies, and city-based service businesses."
    >
      {items.map(item => (
        <div key={item.id} className="rounded-xl border border-slate-100 bg-white p-3.5">
          <div className="flex items-start gap-3">
            <span
              className={
                item.status === "PASS"
                  ? "mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-500"
                  : "mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-500"
              }
            >
              <CheckCircle2 size={13} />
            </span>
            <div>
              <p className="text-[12.5px] font-black text-slate-900">{item.label}</p>
              <p className="mt-0.5 text-[11.5px] font-medium leading-5 text-slate-500">{item.reason}</p>
            </div>
          </div>
        </div>
      ))}
      {items.length === 0 && (
        <div className="py-8 text-center text-[13px] font-semibold text-slate-400">No checklist items yet.</div>
      )}
    </PanelShell>
  )
}
