import { ArrowRight, CheckCircle2 } from "lucide-react"
import { Link } from "react-router-dom"
import { ResourceCard, ResourceShell, SectionTitle } from "./ResourceShared"

const steps = [
  ["Track prompts", "Run commercial-intent prompts across AI engines and store the model answers."],
  ["Measure presence", "Calculate visibility, position, sentiment, and whether your brand was mentioned."],
  ["Inspect evidence", "Find the domains and pages models cite or implicitly trust in answers."],
  ["Prioritize fixes", "Turn source, content, and competitor gaps into actions your team can ship."],
]

const principles = [
  "Answer the buyer query directly in the first section.",
  "Use comparison tables when competitors are shaping the answer.",
  "Reference trusted third-party sources, not only your own website.",
  "Add proof points that AI models can summarize clearly.",
  "Refresh pages when sentiment or positioning becomes stale.",
]

export function GeoGuidePage() {
  return (
    <ResourceShell
      eyebrow="GEO Guide"
      title={<>A clear guide to AI visibility and GEO.</>}
      description="Understand how generative engines choose brands, sources, and recommendations, then use PromptPulse to improve the answers buyers see."
    >
      <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <ResourceCard className="p-6">
          <SectionTitle eyebrow="Definition" title="What is GEO?" description="GEO means improving how generative answer engines understand, cite, and recommend your brand." />
          <div className="rounded-[22px] border border-zinc-200 bg-zinc-50 p-5">
            <p className="text-[15px] font-medium leading-8 text-zinc-600">
              Traditional SEO asks: “Can buyers find us in search results?” GEO asks: “When an AI assistant answers the buyer, are we mentioned correctly, compared fairly, and supported by trusted sources?”
            </p>
          </div>
          <Link to="/signup" className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-black px-5 text-[13px] font-black text-white">
            Track your first prompts <ArrowRight size={14} />
          </Link>
        </ResourceCard>

        <ResourceCard className="p-6">
          <SectionTitle eyebrow="Workflow" title="How PromptPulse approaches GEO" description="A simple loop: track answers, understand evidence, fix what is missing, and report movement." />
          <div className="space-y-3">
            {steps.map(([title, body], index) => (
              <div key={title} className="grid grid-cols-[42px_1fr] gap-4 rounded-2xl border border-zinc-200 bg-white p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-black text-[13px] font-black text-white">{index + 1}</div>
                <div>
                  <p className="text-[15px] font-black text-zinc-950">{title}</p>
                  <p className="mt-1 text-[13px] font-medium leading-6 text-zinc-500">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </ResourceCard>
      </div>

      <ResourceCard className="mt-5 p-6">
        <SectionTitle eyebrow="Playbook" title="What good GEO content includes" description="Use this checklist when creating category pages, comparison pages, alternatives pages, or GEO article briefs." />
        <div className="grid gap-3 md:grid-cols-2">
          {principles.map((item) => (
            <div key={item} className="flex items-start gap-3 rounded-2xl border border-zinc-200 bg-white p-4">
              <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-600" />
              <p className="text-[14px] font-bold leading-6 text-zinc-700">{item}</p>
            </div>
          ))}
        </div>
      </ResourceCard>
    </ResourceShell>
  )
}
