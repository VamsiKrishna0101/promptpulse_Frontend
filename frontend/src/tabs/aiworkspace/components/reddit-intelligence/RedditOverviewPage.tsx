import { AlertTriangle, MessageSquare, Radio, Sparkles } from "lucide-react"
import type { RedditIntelligenceResponse } from "@/lib/redditIntelligenceApi"
import { RedditStatCard } from "./RedditStatCard"
import { priorityClass, toneClass } from "./redditHelpers"

export function RedditOverviewPage({ data }: { data: RedditIntelligenceResponse | null }) {
  const latest = data?.latest_run
  const latestSummary = latest?.summary as Record<string, any> | null | undefined
  const themes = latest?.themes ?? []
  const actions = latest?.actions ?? []
  const topSubreddits = Array.isArray(latestSummary?.top_subreddits) ? (latestSummary.top_subreddits as string[]) : []
  const relevance = latestSummary?.relevance && typeof latestSummary.relevance === "object" ? latestSummary.relevance as Record<string, any> : null

  return (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <RedditStatCard label="AI-cited Reddit" value={data?.cited_threads.length ?? 0} detail="Reddit URLs already influencing tracked AI answers." />
        <RedditStatCard label="Discovered posts" value={data?.posts.length ?? 0} detail="Stored Reddit discussions from Bright Data scans." />
        <RedditStatCard label="Rejected noise" value={Number(relevance?.rejected_posts ?? 0)} detail="Generic keyword matches filtered before saving." />
        <RedditStatCard label="Actions" value={actions.length} detail="Recommended non-spammy actions from the latest scan." />
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-700 ring-1 ring-inset ring-orange-100">
              <Radio size={17} />
            </span>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-orange-700">Latest takeaway</p>
              <h2 className="mt-1 text-[17px] font-bold tracking-tight text-zinc-950">
                {latestSummary?.headline ?? "No fresh Reddit scan yet"}
              </h2>
            </div>
          </div>
          <p className="mt-4 text-[13.5px] leading-6 text-zinc-600">
            {latestSummary?.takeaway ?? "Run a Standard scan to discover fresh buyer conversations and turn them into themes, risks, and actions."}
          </p>
          {topSubreddits.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {topSubreddits.map((subreddit) => (
                <span key={subreddit} className="rounded-full bg-orange-50 px-3 py-1 text-[11px] font-semibold text-orange-700">
                  r/{subreddit}
                </span>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-zinc-950 p-5 text-white">
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-white/50">
            <Sparkles size={13} />
            Run status
          </p>
          <p className="mt-3 text-[22px] font-bold tracking-tight">{latest?.status ?? "READY"}</p>
          <p className="mt-2 text-[12.5px] leading-6 text-white/65">
            {latest
              ? `${latest.mode} scan used ${latest.credits_spent} credit(s) and requested up to ${latest.post_limit} posts.`
              : "Set brand preferences, then run Standard or Deep when you want fresh Reddit data."}
          </p>
          <div className="mt-5 grid grid-cols-2 gap-2">
            <Mini label="Keywords" value={latest?.keyword_count ?? 0} />
            <Mini label="Posts" value={data?.posts.length ?? 0} />
            <Mini label="Relevant" value={Number(relevance?.relevant_posts ?? 0)} />
            <Mini label="Maybe" value={Number(relevance?.maybe_posts ?? 0)} />
          </div>
        </section>
      </div>

      {relevance && Array.isArray(relevance.rejected_examples) && relevance.rejected_examples.length > 0 && (
        <section className="rounded-2xl border border-zinc-200 bg-white p-5">
          <h2 className="text-[14px] font-bold text-zinc-950">Filtered out before saving</h2>
          <p className="mt-1 text-[12.5px] text-zinc-500">
            These examples explain why generic Reddit matches did not become saved intelligence.
          </p>
          <div className="mt-4 grid gap-2 md:grid-cols-2">
            {relevance.rejected_examples.slice(0, 4).map((item: Record<string, any>, index: number) => (
              <div key={`${String(item.title ?? "rejected")}-${index}`} className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
                <p className="line-clamp-1 text-[12px] font-bold text-zinc-950">{String(item.title ?? "Rejected post")}</p>
                <p className="mt-1 text-[11.5px] font-medium text-zinc-500">{String(item.reason ?? "Low relevance")}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="grid gap-5 xl:grid-cols-2">
        <section className="rounded-2xl border border-zinc-200 bg-white p-5">
          <h2 className="flex items-center gap-2 text-[14px] font-bold text-zinc-950">
            <MessageSquare size={15} />
            Themes to watch
          </h2>
          <div className="mt-4 space-y-2.5">
            {themes.length ? themes.slice(0, 4).map((theme, index) => (
              <div key={`${theme.theme}-${index}`} className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[12.5px] font-semibold text-zinc-950">{String(theme.theme ?? "Theme")}</p>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${toneClass(String(theme.sentiment ?? "neutral"))}`}>{String(theme.sentiment ?? "neutral")}</span>
                </div>
                <p className="mt-2 text-[12px] leading-5 text-zinc-500">{String(theme.summary ?? "")}</p>
              </div>
            )) : <EmptyState text="No themes yet. Run a scan to generate buyer-language themes." />}
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-5">
          <h2 className="flex items-center gap-2 text-[14px] font-bold text-zinc-950">
            <AlertTriangle size={15} />
            Priority actions
          </h2>
          <div className="mt-4 space-y-2.5">
            {actions.length ? actions.slice(0, 4).map((action, index) => (
              <div key={`${action.title}-${index}`} className="rounded-xl border border-zinc-200 bg-white p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[12.5px] font-semibold text-zinc-950">{String(action.title ?? "Action")}</p>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${priorityClass(String(action.priority ?? "MEDIUM"))}`}>{String(action.priority ?? "MEDIUM")}</span>
                </div>
                <p className="mt-2 text-[12px] leading-5 text-zinc-500">{String(action.recommendation ?? "")}</p>
              </div>
            )) : <EmptyState text="No actions yet. Run a scan to create Reddit-specific recommendations." />}
          </div>
        </section>
      </div>
    </div>
  )
}

function Mini({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-white/45">{label}</p>
      <p className="mt-1 text-lg font-bold">{value}</p>
    </div>
  )
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-6 text-center text-[12px] font-medium text-zinc-500">
      {text}
    </div>
  )
}
