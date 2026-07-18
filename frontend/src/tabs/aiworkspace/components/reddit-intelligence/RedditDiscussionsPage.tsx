import { Radio } from "lucide-react"
import type { ReactNode } from "react"
import type { RedditPost } from "@/lib/redditIntelligenceApi"
import { RedditPostCard } from "./RedditPostCard"

export function RedditDiscussionsPage({ posts }: { posts: RedditPost[] }) {
  const relevantPosts = posts.filter((post) => String(post.relevance_bucket ?? post.raw_json?.relevance_bucket ?? "relevant") !== "maybe").slice(0, 30)
  const maybePosts = posts.filter((post) => String(post.relevance_bucket ?? post.raw_json?.relevance_bucket ?? "") === "maybe").slice(0, 20)
  const hasPosts = relevantPosts.length > 0 || maybePosts.length > 0

  return (
    <section className="space-y-5">
      <div className="rounded-2xl border border-zinc-200 bg-white p-5">
        <h2 className="text-[15px] font-bold tracking-tight text-zinc-950">Discovered discussions</h2>
        <p className="mt-1 text-[12.5px] text-zinc-500">Only posts passing the brand/category relevance filter are shown here. Generic keyword noise is rejected before saving.</p>
      </div>

      {hasPosts ? (
        <>
          <Bucket title="Relevant discussions" count={relevantPosts.length} description="Strong brand, competitor, category, or buyer-context match.">
            {relevantPosts.map((post) => <RedditPostCard key={post.id} post={post} />)}
          </Bucket>
          {maybePosts.length > 0 && (
            <Bucket title="Maybe useful" count={maybePosts.length} description="Weaker but still potentially useful category signals. Review before acting.">
              {maybePosts.map((post) => <RedditPostCard key={post.id} post={post} />)}
            </Bucket>
          )}
        </>
      ) : (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center">
          <Radio size={24} className="mx-auto text-zinc-400" />
          <p className="mt-3 text-[14px] font-bold text-zinc-950">No Reddit scan yet</p>
          <p className="mt-1 text-[12.5px] text-zinc-500">Run a Standard scan to discover fresh Reddit discussions.</p>
        </div>
      )}
    </section>
  )
}

function Bucket({
  title,
  count,
  description,
  children,
}: {
  title: string
  count: number
  description: string
  children: ReactNode
}) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3">
        <div>
          <h3 className="text-[13px] font-bold text-zinc-950">{title}</h3>
          <p className="mt-1 text-[11.5px] font-medium text-zinc-500">{description}</p>
        </div>
        <span className="rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-[11px] font-black text-zinc-700">{count}</span>
      </div>
      {children}
    </div>
  )
}
