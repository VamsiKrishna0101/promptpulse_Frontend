import { ExternalLink } from "lucide-react"
import type { AiCitedRedditThread } from "@/lib/redditIntelligenceApi"

export function RedditCitedThreadCard({ thread }: { thread: AiCitedRedditThread }) {
  return (
    <a
      href={thread.url}
      target="_blank"
      rel="noreferrer"
      className="block rounded-xl border border-zinc-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-orange-200 hover:bg-orange-50/30"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="line-clamp-1 text-[13px] font-semibold text-zinc-950">{thread.title ?? thread.domain}</p>
          <p className="mt-1 line-clamp-2 text-[12px] leading-5 text-zinc-500">{thread.chat.prompt.text}</p>
        </div>
        <ExternalLink size={14} className="shrink-0 text-zinc-400" />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[10.5px] font-semibold">
        <span className="rounded-full bg-zinc-50 px-2 py-1 text-zinc-600 ring-1 ring-zinc-200">{thread.chat.ai_model}</span>
        {thread.subreddit && <span className="rounded-full bg-orange-50 px-2 py-1 text-orange-700 ring-1 ring-orange-100">r/{thread.subreddit}</span>}
        <span className={thread.chat.brand_mentioned ? "text-emerald-700" : "text-zinc-400"}>
          {thread.chat.brand_mentioned ? "Brand mentioned" : "Brand missing"}
        </span>
      </div>
    </a>
  )
}