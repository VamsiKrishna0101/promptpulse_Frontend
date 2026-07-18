import { MessageSquare } from "lucide-react"
import type { AiCitedRedditThread } from "@/lib/redditIntelligenceApi"
import { RedditCitedThreadCard } from "./RedditCitedThreadCard"

export function RedditCitationsPage({ citedThreads }: { citedThreads: AiCitedRedditThread[] }) {
  return (
    <section className="space-y-3">
      <div className="rounded-2xl border border-zinc-200 bg-white p-5">
        <h2 className="text-[15px] font-bold tracking-tight text-zinc-950">AI-cited Reddit threads</h2>
        <p className="mt-1 text-[12.5px] text-zinc-500">These are Reddit URLs already appearing as sources inside tracked AI answers.</p>
      </div>
      {citedThreads.length ? (
        <div className="grid gap-3 xl:grid-cols-2">
          {citedThreads.map((thread) => <RedditCitedThreadCard key={thread.id} thread={thread} />)}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center">
          <MessageSquare size={24} className="mx-auto text-zinc-400" />
          <p className="mt-3 text-[14px] font-bold text-zinc-950">No Reddit citations yet</p>
          <p className="mt-1 text-[12.5px] text-zinc-500">When AI engines cite Reddit threads, they will show up here automatically.</p>
        </div>
      )}
    </section>
  )
}