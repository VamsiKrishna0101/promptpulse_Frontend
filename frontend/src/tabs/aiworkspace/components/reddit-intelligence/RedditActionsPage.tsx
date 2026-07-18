import { AlertTriangle, MessageSquare } from "lucide-react"
import type { RedditRun } from "@/lib/redditIntelligenceApi"
import { priorityClass, toneClass } from "./redditHelpers"

export function RedditActionsPage({ latestRun }: { latestRun: RedditRun | null | undefined }) {
  const themes = latestRun?.themes ?? []
  const actions = latestRun?.actions ?? []

  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <section className="rounded-2xl border border-zinc-200 bg-white p-5">
        <h2 className="flex items-center gap-2 text-[15px] font-bold tracking-tight text-zinc-950">
          <MessageSquare size={16} />
          Buyer-language themes
        </h2>
        <p className="mt-1 text-[12.5px] text-zinc-500">What people are actually saying, grouped into market signals.</p>
        <div className="mt-4 space-y-2.5">
          {themes.length ? themes.map((theme, index) => (
            <div key={`${theme.theme}-${index}`} className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[12.5px] font-semibold text-zinc-950">{String(theme.theme ?? "Theme")}</p>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${toneClass(String(theme.sentiment ?? "neutral"))}`}>
                  {String(theme.sentiment ?? "neutral")}
                </span>
              </div>
              <p className="mt-2 text-[12px] leading-5 text-zinc-500">{String(theme.summary ?? "")}</p>
              {theme.action && <p className="mt-3 text-[12px] font-semibold text-zinc-700">{String(theme.action)}</p>}
            </div>
          )) : <EmptyState text="No themes yet. Run a scan to generate themes." />}
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-5">
        <h2 className="flex items-center gap-2 text-[15px] font-bold tracking-tight text-zinc-950">
          <AlertTriangle size={16} />
          Recommended actions
        </h2>
        <p className="mt-1 text-[12.5px] text-zinc-500">Non-spammy ways to act on Reddit demand and objections.</p>
        <div className="mt-4 space-y-2.5">
          {actions.length ? actions.map((action, index) => (
            <div key={`${action.title}-${index}`} className="rounded-xl border border-zinc-200 bg-white p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[12.5px] font-semibold text-zinc-950">{String(action.title ?? "Action")}</p>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${priorityClass(String(action.priority ?? "MEDIUM"))}`}>
                  {String(action.priority ?? "MEDIUM")}
                </span>
              </div>
              <p className="mt-2 text-[12px] leading-5 text-zinc-500">{String(action.recommendation ?? "")}</p>
            </div>
          )) : <EmptyState text="No actions yet. Run a scan to create recommendations." />}
        </div>
      </section>
    </div>
  )
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-8 text-center text-[12px] font-medium text-zinc-500">
      {text}
    </div>
  )
}