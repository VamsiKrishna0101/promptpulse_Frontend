import { useState } from "react"
import { ArrowLeft, Radio } from "lucide-react"
import type { RedditIntelligenceResponse, RedditRun } from "@/lib/redditIntelligenceApi"
import { RedditActionsPage } from "./RedditActionsPage"
import { RedditCitationsPage } from "./RedditCitationsPage"
import { RedditDiscussionsPage } from "./RedditDiscussionsPage"
import { RedditOverviewPage } from "./RedditOverviewPage"
import { dateLabel, type RedditSection } from "./redditHelpers"

const sections: { id: RedditSection; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "discussions", label: "Discussions" },
  { id: "citations", label: "AI-cited threads" },
  { id: "actions", label: "Themes & actions" },
]

export function RedditRunDetailPage({
  run,
  baseData,
  onBack,
}: {
  run: RedditRun
  baseData: RedditIntelligenceResponse
  onBack: () => void
}) {
  const [activeSection, setActiveSection] = useState<RedditSection>("overview")
  const runPosts = run.posts?.length
    ? run.posts
    : baseData.posts.filter((post) => post.run_id === run.id)

  const detailData: RedditIntelligenceResponse = {
    ...baseData,
    latest_run: run,
    posts: runPosts.length ? runPosts : baseData.latest_run?.id === run.id ? baseData.posts : [],
  }

  return (
    <div className="space-y-5 pb-10">
      <section className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white px-6 py-5 shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(24,24,27,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(24,24,27,0.04) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            maskImage: "radial-gradient(ellipse 70% 100% at 0% 0%, black 30%, transparent 85%)",
            WebkitMaskImage: "radial-gradient(ellipse 70% 100% at 0% 0%, black 30%, transparent 85%)",
          }}
        />
        <div className="relative">
          <button
            type="button"
            onClick={onBack}
            className="mb-4 inline-flex h-8 items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 text-[12px] font-semibold text-zinc-700 transition hover:bg-zinc-50"
          >
            <ArrowLeft size={13} />
            Back to Reddit scans
          </button>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-orange-700">
                <Radio size={12} />
                Reddit scan detail
              </div>
              <h1 className="mt-2.5 text-[22px] font-bold tracking-tight text-zinc-950">{run.mode} Reddit Intelligence</h1>
              <p className="mt-1.5 max-w-2xl text-[13px] leading-6 text-zinc-500">
                Generated {dateLabel(run.completed_at ?? run.created_at)}. Review the posts, AI-cited threads, themes, and actions from this scan.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 rounded-2xl border border-zinc-200 bg-zinc-50/80 p-3">
              <Mini label="Posts" value={detailData.posts.length} />
              <Mini label="Keywords" value={run.keyword_count} />
              <Mini label="Credits" value={run.credits_spent} />
            </div>
          </div>
        </div>
      </section>

      <nav className="rounded-2xl border border-zinc-200 bg-white p-1.5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
        <div className="grid gap-1.5 md:grid-cols-4">
          {sections.map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() => setActiveSection(section.id)}
              className={[
                "h-10 rounded-xl px-3 text-[13px] font-semibold transition",
                activeSection === section.id
                  ? "bg-zinc-950 text-white"
                  : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-950",
              ].join(" ")}
            >
              {section.label}
            </button>
          ))}
        </div>
      </nav>

      {activeSection === "overview" && <RedditOverviewPage data={detailData} />}
      {activeSection === "discussions" && <RedditDiscussionsPage posts={detailData.posts} />}
      {activeSection === "citations" && <RedditCitationsPage citedThreads={detailData.cited_threads} />}
      {activeSection === "actions" && <RedditActionsPage latestRun={run} />}
    </div>
  )
}

function Mini({ label, value }: { label: string; value: number }) {
  return (
    <div className="min-w-[80px] rounded-xl border border-zinc-200 bg-white px-3 py-2 text-center">
      <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-zinc-400">{label}</p>
      <p className="mt-1 text-[16px] font-bold tracking-tight text-zinc-950">{value}</p>
    </div>
  )
}