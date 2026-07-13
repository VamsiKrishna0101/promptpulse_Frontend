import type { ReactNode } from "react"
import { useState } from "react"
import { Link } from "react-router-dom"
import {
  ArrowRight,
  BarChart3,
  Check,
  Download,
  FileText,
  Lightbulb,
  Search,
  Sparkles,
  Trophy,
} from "lucide-react"

const engines = [
  { name: "ChatGPT", domain: "chatgpt.com", value: "64%" },
  { name: "Gemini", domain: "gemini.google.com", value: "58%" },
  { name: "Perplexity", domain: "perplexity.ai", value: "51%" },
]

const proofRows = [
  { label: "Visibility", value: "64%", note: "Share across AI answers" },
  { label: "Position", value: "#4.3", note: "Average rank when mentioned" },
  { label: "Sentiment", value: "69", note: "Weighted response sentiment" },
]

const topSources = [
  { domain: "searchengineland.com", type: "Editorial", used: "38%" },
  { domain: "hubspot.com", type: "Editorial", used: "38%" },
  { domain: "g2.com", type: "Review", used: "38%" },
  { domain: "promptwatch.io", type: "Competitor", used: "36%" },
]

const featureCards = [
  {
    title: "Competitor benchmarking",
    desc: "See which brands AI recommends ahead of you and where they win.",
    icon: Trophy,
  },
  {
    title: "Source intelligence",
    desc: "Find the articles, reviews, domains, and communities shaping AI answers.",
    icon: Search,
  },
  {
    title: "Opportunity engine",
    desc: "Prioritize rank, source, sentiment, and content gaps by impact.",
    icon: Lightbulb,
  },
  {
    title: "GEO article briefs",
    desc: "Turn visibility evidence into article briefs for high-intent queries.",
    icon: FileText,
  },
]

function BrandBadge({
  domain,
  label,
  size = "md",
}: {
  domain: string
  label: string
  size?: "sm" | "md"
}) {
  const [failed, setFailed] = useState(false)
  const showMonogram = failed
  const dims = size === "sm" ? "h-[26px] w-[26px] rounded-[7px]" : "h-7 w-7 rounded-[8px]"
  const imgDims = size === "sm" ? "h-[18px] w-[18px]" : "h-5 w-5"

  return (
    <div
      className={`flex ${dims} shrink-0 items-center justify-center border border-zinc-950/[0.08] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.08)]`}
    >
      {showMonogram ? (
        <span className="text-[10.5px] font-bold text-zinc-800">{label.charAt(0).toUpperCase()}</span>
      ) : (
        <img
          src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`}
          alt=""
          className={imgDims}
          onError={() => setFailed(true)}
        />
      )}
    </div>
  )
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-950/10 bg-white px-3 py-[5px] text-[10.5px] font-semibold uppercase tracking-[0.12em] text-zinc-900 shadow-[0_1px_1px_rgba(16,24,40,0.04)]">
      <Sparkles size={11} strokeWidth={2.25} />
      {children}
    </span>
  )
}

function MetricStrip() {
  return (
    <div className="grid grid-cols-3 divide-x divide-zinc-950/[0.08] overflow-hidden rounded-2xl border border-zinc-950/[0.08] bg-white/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_1px_1px_rgba(16,24,40,0.03)]">
      {proofRows.map((item) => (
        <div key={item.label} className="p-3.5 sm:p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-400">{item.label}</p>
          <p className="mt-2 text-[24px] font-semibold tracking-[-0.03em] tabular-nums text-zinc-950 sm:text-[26px]">{item.value}</p>
          <p className="mt-0.5 truncate text-[11.5px] font-medium leading-4 text-zinc-500">{item.note}</p>
        </div>
      ))}
    </div>
  )
}

function EnginePanel() {
  return (
    <div className="rounded-2xl border border-zinc-950/[0.08] bg-white/80 p-4 shadow-[0_20px_60px_-48px_rgba(15,23,42,0.55)]">
      <div className="mb-3.5 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-400">Tracks across</p>
          <h3 className="mt-0.5 text-[15.5px] font-semibold tracking-[-0.02em] text-zinc-950">AI answer engines</h3>
        </div>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-b from-zinc-800 to-zinc-950 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_1px_2px_rgba(0,0,0,0.25)]">
          <BarChart3 size={14} strokeWidth={2.25} />
        </div>
      </div>
      <div className="space-y-1.5">
        {engines.map((engine) => (
          <div key={engine.name} className="flex items-center gap-2.5 rounded-xl border border-zinc-950/[0.06] bg-zinc-50/70 px-3 py-2.5 transition-colors hover:bg-zinc-50">
            <BrandBadge domain={engine.domain} label={engine.name} />
            <span className="min-w-0 flex-1 text-[13px] font-semibold text-zinc-900">{engine.name}</span>
            <span className="rounded-full border border-zinc-950/[0.08] bg-white px-2 py-0.5 text-[10.5px] font-bold tabular-nums text-zinc-800 shadow-[0_1px_1px_rgba(16,24,40,0.04)]">{engine.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function TopSourcesPanel() {
  return (
    <div className="rounded-2xl border border-zinc-950/[0.08] bg-white/80 p-4 shadow-[0_20px_60px_-48px_rgba(15,23,42,0.55)]">
      <div className="mb-3.5 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-400">Evidence</p>
          <h3 className="mt-0.5 text-[15.5px] font-semibold tracking-[-0.02em] text-zinc-950">Top sources</h3>
        </div>
        <Search size={15} strokeWidth={2.25} className="text-zinc-400" />
      </div>
      <div className="divide-y divide-zinc-950/[0.06] overflow-hidden rounded-xl border border-zinc-950/[0.08]">
        {topSources.map((source) => (
          <div key={source.domain} className="grid grid-cols-[1fr_auto] items-center gap-3 bg-white/60 px-3 py-2.5 transition-colors hover:bg-zinc-50/80">
            <div className="flex min-w-0 items-center gap-2.5">
              <BrandBadge domain={source.domain} label={source.domain} size="sm" />
              <div className="min-w-0">
                <p className="truncate text-[12.5px] font-semibold text-zinc-950">{source.domain}</p>
                <p className="text-[10.5px] font-medium text-zinc-400">{source.type}</p>
              </div>
            </div>
            <span className="rounded-full bg-gradient-to-b from-zinc-800 to-zinc-950 px-2 py-0.5 text-[10.5px] font-bold tabular-nums text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]">{source.used}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function FeatureGrid() {
  return (
    <div className="grid gap-2.5 sm:grid-cols-2">
      {featureCards.map((card) => {
        const Icon = card.icon
        return (
          <div
            key={card.title}
            className="group rounded-2xl border border-zinc-950/[0.08] bg-white/80 p-4 shadow-[0_16px_48px_-44px_rgba(15,23,42,0.5)] transition-all hover:-translate-y-0.5 hover:border-zinc-950/20 hover:shadow-[0_20px_48px_-36px_rgba(15,23,42,0.4)]"
          >
            <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-b from-zinc-800 to-zinc-950 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_1px_2px_rgba(0,0,0,0.25)] transition-transform group-hover:scale-105">
              <Icon size={14} strokeWidth={2.25} />
            </div>
            <h4 className="text-[13.5px] font-semibold tracking-[-0.01em] text-zinc-950">{card.title}</h4>
            <p className="mt-1.5 text-[12px] font-medium leading-5 text-zinc-500">{card.desc}</p>
          </div>
        )
      })}
    </div>
  )
}

function ExportPanel() {
  return (
    <div className="rounded-2xl border border-zinc-950/[0.08] bg-white/80 p-4 shadow-[0_20px_60px_-48px_rgba(15,23,42,0.5)]">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-400">Reports</p>
          <h3 className="mt-0.5 text-[15.5px] font-semibold tracking-[-0.02em] text-zinc-950">Shareable exports</h3>
        </div>
        <Download size={15} strokeWidth={2.25} className="text-zinc-400" />
      </div>
      <div className="mt-3.5 grid grid-cols-2 gap-2.5">
        {["PDF report", "CSV data"].map((item) => (
          <div key={item} className="rounded-xl border border-zinc-950/[0.06] bg-zinc-50/70 p-3">
            <p className="text-[13px] font-semibold text-zinc-950">{item}</p>
            <p className="mt-0.5 text-[10.5px] font-medium leading-4 text-zinc-500">For teams, clients, and founders</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export function FinalCTA() {
  return (
    <section className="relative mx-auto w-full max-w-7xl px-6 py-14">
      <div className="border-y border-zinc-950/[0.08] py-9">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <div>
            <SectionLabel>Built from what RefractOne already tracks</SectionLabel>
            <h2 className="mt-5 max-w-4xl text-[32px] font-semibold leading-[1.06] tracking-[-0.04em] text-zinc-950 sm:text-[42px] lg:text-[52px]">
              Turn AI visibility into actions your team can ship.
            </h2>
            <div className="mt-4 h-px w-14 bg-gradient-to-r from-zinc-950 to-zinc-950/0" />
            <p className="mt-4 max-w-3xl text-[14.5px] font-medium leading-7 text-zinc-500 sm:text-[15px]">
              Track your brand across ChatGPT, Gemini, and Perplexity. See competitor gaps, source influence,
              sentiment, opportunities, GEO article briefs, and clean exports in one workspace.
            </p>
            <div className="mt-6">
              <MetricStrip />
            </div>
            <div className="mt-6">
              <FeatureGrid />
            </div>
          </div>

          <div className="space-y-3">
            <EnginePanel />
            <TopSourcesPanel />
            <ExportPanel />
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-4 border-t border-zinc-950/[0.08] pt-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-[21px] font-semibold tracking-[-0.03em] text-zinc-950">
              Ready to see what AI says about your brand?
            </h3>
            <div className="mt-3 grid gap-1.5 text-[13px] font-medium text-zinc-600 sm:grid-cols-3">
              {["7-day trial", "Setup in minutes", "No fake dashboards"].map((item) => (
                <div key={item} className="flex items-center gap-1.5">
                  <Check size={14} strokeWidth={2.5} className="text-zinc-950" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2.5 sm:flex-row">
            <Link
              to="/signup"
              className="group inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-zinc-800 to-zinc-950 px-6 text-[13px] font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_1px_2px_rgba(15,23,42,0.3),0_12px_24px_-16px_rgba(15,23,42,0.5)] transition hover:from-zinc-700 hover:to-zinc-900"
            >
              Start Free Trial
              <ArrowRight size={15} className="transition group-hover:translate-x-0.5" />
            </Link>
            <Link
              to="/demo"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-zinc-950/[0.12] bg-white px-6 text-[13px] font-semibold text-zinc-700 shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition hover:border-zinc-950/25 hover:bg-zinc-50"
            >
              Book a Demo
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
