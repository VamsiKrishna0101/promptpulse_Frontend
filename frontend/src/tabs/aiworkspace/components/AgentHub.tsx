import { FileText, ListChecks, Target, ArrowRight } from "lucide-react"
import { useProjects } from "@/hooks/useProjects"
import { faviconUrl } from "@/lib/aiModels"

// One neutral badge treatment for every card — amber is reserved as the single
// accent color (status pill, hover glow, arrow) instead of a different tint per card.
const READY_TINT = "text-zinc-700 bg-zinc-100 ring-zinc-200"
const READY_GLOW = "group-hover:shadow-[0_20px_40px_-24px_rgba(217,119,6,0.28)] group-hover:ring-amber-200"
const AGENTS = [
  {
    id: "reports",
    title: "Reports",
    description: "Generate weekly, 14-day, or monthly AI visibility reports.",
    icon: FileText,
    logoDomain: null,
    status: "Ready",
    tint: READY_TINT,
    glow: READY_GLOW,
  },
  {
    id: "content",
    title: "Content Briefs",
    description: "Turn AI-answer gaps into evidence-backed briefs and publish-ready drafts.",
    icon: Target,
    logoDomain: null,
    status: "Ready",
    tint: READY_TINT,
    glow: READY_GLOW,
  },
  {
    id: "actionQueue",
    title: "Action Queue",
    description: "Prioritize prompt, source, model, and competitor fixes from fresh AI visibility data.",
    icon: ListChecks,
    logoDomain: null,
    status: "Ready",
    tint: READY_TINT,
    glow: READY_GLOW,
  },
  {
    id: "reddit",
    title: "Reddit Intelligence",
    description: "Discover buyer conversations, competitor mentions, and Reddit threads that can shape AI answers.",
    // Real Reddit mark, pulled the same way the platform strip does (Google favicon trick)
    icon: null,
    logoDomain: "reddit.com",
    status: "Ready",
    tint: READY_TINT,
    glow: READY_GLOW,
  },
]

const PLATFORMS = [
  { label: "ChatGPT", domain: "openai.com" },
  { label: "Gemini", domain: "gemini.google.com" },
  { label: "Perplexity", domain: "perplexity.ai" },
  { label: "Google AI", domain: "google.com" },
  { label: "Copilot", domain: "copilot.microsoft.com" },
]

export function AgentHub({
  onOpenReports,
  onOpenActionQueue,
  onOpenReddit,
  onOpenContentBriefs,
}: {
  onOpenReports: () => void
  onOpenActionQueue: () => void
  onOpenReddit: () => void
  onOpenContentBriefs: () => void
}) {
  const { selectedProject } = useProjects()

  return (
    <div className="flex flex-col gap-5">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white px-6 py-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(24,24,27,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(24,24,27,0.05) 1px, transparent 1px)",
            backgroundSize: "36px 36px",
            maskImage: "radial-gradient(ellipse 55% 90% at 0% 0%, black 15%, transparent 75%)",
            WebkitMaskImage: "radial-gradient(ellipse 55% 90% at 0% 0%, black 15%, transparent 75%)",
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-10 -top-16 h-28 w-28 rounded-full bg-amber-300/20 blur-[60px]"
        />

        <div className="relative flex flex-wrap items-center gap-x-3 gap-y-1">
          <div className="inline-flex shrink-0 items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-700">
              AI Workspace
            </span>
          </div>
          <h1 className="text-[19px] font-bold leading-tight tracking-tight text-zinc-950">
            Choose an agent
          </h1>
          <p className="text-[13px] leading-5 text-zinc-500">
            Reports, content briefs, and action queues are available now for{" "}
            <strong className="font-semibold text-zinc-900">
              {selectedProject?.brand_name ?? "your selected project"}
            </strong>
            .
          </p>
        </div>
      </section>

      {/* Cards */}
      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))" }}>
        {AGENTS.map((agent) => {
          const Icon = agent.icon
          const ready = agent.status === "Ready"
          const hasLogo = Boolean(agent.logoDomain)

          return (
            <button
              key={agent.id}
              type="button"
              onClick={() => {
                if (agent.id === "reports") onOpenReports()
                if (agent.id === "content") onOpenContentBriefs()
                if (agent.id === "actionQueue") onOpenActionQueue()
                if (agent.id === "reddit") onOpenReddit()
              }}
              disabled={!ready}
              className={`group relative flex min-h-[204px] flex-col rounded-2xl border p-6 text-left ring-1 ring-transparent transition-all duration-200 ${ready
                ? `border-zinc-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.06)] hover:-translate-y-[3px] hover:border-zinc-300 ${agent.glow}`
                : "cursor-not-allowed border-zinc-200/70 bg-zinc-50/70"
                }`}
            >
              <div className="mb-5 flex w-full items-start justify-between gap-4">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl ring-1 ring-inset ${agent.tint}`}
                >
                  {hasLogo ? (
                    <img
                      src={faviconUrl(agent.logoDomain as string, 64) ?? ""}
                      alt={agent.title}
                      className="h-6 w-6 object-contain"
                    />
                  ) : (
                    Icon && <Icon size={19} strokeWidth={2} />
                  )}
                </div>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${ready
                    ? "border border-amber-200 bg-amber-50 text-amber-700"
                    : "border border-zinc-200 bg-white text-zinc-400"
                    }`}
                >
                  {agent.status}
                </span>
              </div>

              <h2 className="mb-1.5 text-[16px] font-semibold tracking-tight text-zinc-950">
                {agent.title}
              </h2>
              <p className="line-clamp-3 min-h-[60px] text-[13px] leading-5 text-zinc-500">
                {agent.description}
              </p>

              {ready ? (
                <div className="mt-4 flex flex-1 items-end">
                  <div className="flex items-center">
                    {PLATFORMS.map((platform, index) => (
                      <div
                        key={platform.label}
                        title={platform.label}
                        className={`flex h-7 w-7 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-white p-1 shadow-sm ${index === 0 ? "" : "-ml-1.5"
                          }`}
                      >
                        <img
                          src={faviconUrl(platform.domain, 64) ?? ""}
                          alt={platform.label}
                          className="h-full w-full object-contain"
                        />
                      </div>
                    ))}
                    <span className="ml-2.5 text-[11px] font-medium text-zinc-400">
                      {PLATFORMS.length} platforms tracked
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex-1" />
              )}

              <div className="mt-5">
                {ready ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-900 px-3.5 py-2 text-[12.5px] font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition-all group-hover:gap-2.5 group-hover:bg-zinc-800">
                    Open workspace
                    <ArrowRight size={13} className="text-amber-400" />
                  </span>
                ) : (
                  <span className="inline-flex items-center text-[12.5px] font-medium text-zinc-400">
                    Coming soon
                  </span>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
