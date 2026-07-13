import { FileText, MessageSquareText, Search, Target, ArrowRight, Box } from "lucide-react"
import { useProjects } from "@/hooks/useProjects"

const AGENTS = [
  {
    id: "reports",
    title: "Reports",
    description: "Generate weekly, 14-day, or monthly AI visibility reports.",
    icon: FileText,
    status: "Ready",
  },
  {
    id: "content",
    title: "Content Briefs",
    description: "Turn AI-answer gaps into evidence-backed briefs and publish-ready drafts.",
    icon: Target,
    status: "Ready",
  },
  {
    id: "source",
    title: "Source Agent",
    description: "Find citations and third-party pages that influence AI answers.",
    icon: Search,
    status: "Soon",
  },
  {
    id: "sara",
    title: "Sara Agent",
    description: "Ask workspace questions and get strategic answers from project data.",
    icon: MessageSquareText,
    status: "Soon",
  },
]

const PLATFORMS = [
  { label: "ChatGPT", domain: "openai.com" },
  { label: "Gemini", domain: "gemini.google.com" },
  { label: "Perplexity", domain: "perplexity.ai" },
  { label: "Claude", domain: "claude.ai" },
  { label: "Grok", domain: "grok.com" },
]

export function AgentHub({
  onOpenReports,
  onOpenContentBriefs,
}: {
  onOpenReports: () => void
  onOpenContentBriefs: () => void
}) {
  const { selectedProject } = useProjects()

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <section className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-8 shadow-[0_1px_3px_rgba(15,23,42,0.03)]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-0"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(24,24,27,0.045) 1px, transparent 1px), linear-gradient(to bottom, rgba(24,24,27,0.045) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            maskImage: "radial-gradient(ellipse 70% 100% at 0% 0%, black 30%, transparent 85%)",
            WebkitMaskImage: "radial-gradient(ellipse 70% 100% at 0% 0%, black 30%, transparent 85%)",
          }}
        >
          <div className="absolute -left-10 -top-16 h-56 w-56 rounded-full bg-zinc-200/50 blur-3xl" />
        </div>

        <div className="relative">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1">
            <Box size={13} className="text-zinc-400" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
              AI Workspace
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950">Choose an agent</h1>
          <p className="mt-1.5 max-w-xl text-[13px] leading-6 text-zinc-500">
            Agents live here. Reports are available now for{" "}
            <strong className="font-semibold text-zinc-900">
              {selectedProject?.brand_name ?? "your selected project"}
            </strong>
            ; the other agents can plug into this same workspace later.
          </p>
        </div>
      </section>

      {/* Agent cards */}
      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
        {AGENTS.map((agent) => {
          const Icon = agent.icon
          const ready = agent.id === "reports" || agent.id === "content"

          return (
            <button
              key={agent.id}
              type="button"
              onClick={() => {
                if (agent.id === "reports") onOpenReports()
                if (agent.id === "content") onOpenContentBriefs()
              }}
              disabled={!ready}
              className={`group relative flex min-h-[190px] flex-col rounded-2xl border p-6 text-left transition-all duration-150 ${ready
                  ? "border-zinc-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.02)] hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-[0_16px_36px_-20px_rgba(15,23,42,0.25)]"
                  : "cursor-not-allowed border-dashed border-zinc-200 bg-zinc-50/60 opacity-70"
                }`}
            >
              <div className="mb-5 flex w-full items-start justify-between gap-4">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${ready
                      ? "bg-zinc-900 text-white shadow-[0_8px_16px_-8px_rgba(0,0,0,0.5)]"
                      : "bg-zinc-100 text-zinc-400"
                    }`}
                >
                  <Icon size={19} />
                </div>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${ready
                      ? "border border-emerald-100 bg-emerald-50 text-emerald-600"
                      : "border border-zinc-200 bg-zinc-100 text-zinc-500"
                    }`}
                >
                  {agent.status}
                </span>
              </div>

              <h2 className="mb-1.5 text-[15px] font-semibold text-zinc-950">{agent.title}</h2>
              <p className="text-[13px] leading-6 text-zinc-500">{agent.description}</p>

              {ready && (
                <div className="mt-3 flex flex-1 items-end">
                  <div className="flex items-center">
                    {PLATFORMS.map((platform, index) => (
                      <div
                        key={platform.label}
                        title={platform.label}
                        className={`flex h-6 w-6 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-white ${index === 0 ? "" : "-ml-1.5"
                          }`}
                      >
                        <img
                          src={`https://www.google.com/s2/favicons?domain=${platform.domain}&sz=64`}
                          alt={platform.label}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ))}
                    <span className="ml-2 text-[11px] font-medium text-zinc-400">5 platforms tracked</span>
                  </div>
                </div>
              )}
              {!ready && <div className="flex-1" />}

              <div
                className={`mt-5 flex items-center gap-1.5 text-[13px] font-semibold transition-all ${ready ? "text-zinc-950 group-hover:gap-2.5" : "text-zinc-400"
                  }`}
              >
                {ready ? "Open workspace" : "Coming soon"}
                {ready && <ArrowRight size={15} />}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
