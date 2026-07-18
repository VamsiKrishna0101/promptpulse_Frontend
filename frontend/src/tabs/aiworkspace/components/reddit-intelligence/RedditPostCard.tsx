import { ExternalLink } from "lucide-react"
import type { RedditPost } from "@/lib/redditIntelligenceApi"
import { compactNumber, toneClass } from "./redditHelpers"

export function RedditPostCard({ post }: { post: RedditPost }) {
  const relevanceScore = Number(post.relevance_score ?? post.raw_json?.relevance_score ?? post.importance_score ?? 0)
  const relevanceBucket = String(post.relevance_bucket ?? post.raw_json?.relevance_bucket ?? "relevant")
  const relevanceReasons = Array.isArray(post.relevance_reasons)
    ? post.relevance_reasons
    : Array.isArray(post.raw_json?.relevance_reasons)
      ? post.raw_json.relevance_reasons.map(String)
      : []

  return (
    <article className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-[0_10px_28px_-24px_rgba(16,24,40,0.4)]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            {post.subreddit && (
              <span className="rounded-full bg-orange-50 px-2 py-1 text-[10.5px] font-semibold text-orange-700">
                r/{post.subreddit}
              </span>
            )}
            {post.sentiment && (
              <span className={`rounded-full px-2 py-1 text-[10.5px] font-semibold ring-1 ${toneClass(post.sentiment)}`}>
                {post.sentiment}
              </span>
            )}
            {post.intent && (
              <span className="rounded-full bg-blue-50 px-2 py-1 text-[10.5px] font-semibold text-blue-700">
                {post.intent}
              </span>
            )}
            <span className={["rounded-full px-2 py-1 text-[10.5px] font-semibold ring-1", relevanceBucket === "maybe" ? "bg-amber-50 text-amber-700 ring-amber-100" : "bg-emerald-50 text-emerald-700 ring-emerald-100"].join(" ")}>
              {relevanceBucket === "maybe" ? "Maybe useful" : "Relevant"}
            </span>
          </div>
          <h3 className="mt-2 text-[13.5px] font-semibold leading-snug text-zinc-950">{post.title}</h3>
          {post.description && <p className="mt-1 line-clamp-2 text-[12px] leading-5 text-zinc-500">{post.description}</p>}
          {relevanceReasons.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {relevanceReasons.slice(0, 3).map((reason) => (
                <span key={reason} className="rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[10px] font-semibold text-zinc-500">
                  {reason}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="w-16 shrink-0 rounded-xl bg-zinc-50 p-2 text-center">
          <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-zinc-400">Match</p>
          <p className="mt-1 text-[20px] font-bold text-zinc-950">{relevanceScore}</p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] font-medium text-zinc-500">
        <span>{compactNumber(post.num_comments)} comments</span>
        <span>{compactNumber(post.num_upvotes)} upvotes</span>
        {post.keyword && <span className="truncate">keyword: {post.keyword}</span>}
        <a href={post.url} target="_blank" rel="noreferrer" className="ml-auto inline-flex items-center gap-1 text-orange-700 hover:text-orange-800">
          Open
          <ExternalLink size={12} />
        </a>
      </div>
    </article>
  )
}
