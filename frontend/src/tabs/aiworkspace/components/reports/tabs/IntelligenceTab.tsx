import type { ReportViewModel } from "../utils/reportMapper"
import { ModelCards } from "../components/ModelCards"
import { PromptTable } from "../components/PromptTable"
import { SourcesTable } from "../components/SourcesTable"
import { TimelineCard } from "../components/TimelineCard"
import { Cpu, TerminalSquare, Link, Crosshair, HeartPulse, Sparkles, MessageSquareQuote } from "lucide-react"
import { ComparisonBarChart, InsightPanel, LegendDot, StackedSegmentBar, toneForScore } from "../components/ReportVisuals"
import { formatModelName } from "@/lib/aiModels"

function SectionHeader({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description?: string }) {
  return (
    <div className="mb-3 flex items-start gap-2.5">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-zinc-950 text-white">
        <Icon size={14} strokeWidth={2.1} />
      </div>
      <div>
        <h3 className="text-[13px] font-semibold text-zinc-950">{title}</h3>
        {description && <p className="mt-1 line-clamp-2 text-[12px] font-medium leading-5 text-zinc-500">{description}</p>}
      </div>
    </div>
  )
}

export function IntelligenceTab({ report }: { report: ReportViewModel }) {
  const modelBars = report.intelligence.models.slice(0, 6).map((model) => ({
    label: model.model_label || formatModelName(model.model),
    value: model.mention_rate ?? 0,
    tone: toneForScore(model.mention_rate ?? null),
  }))
  const modelMetricsNeedRefresh =
    (report.overallMovement?.total_runs ?? 0) > 0 &&
    report.intelligence.models.length > 0 &&
    report.intelligence.models.every((model) => !model.runs)
  const sourceBars = report.intelligence.sources.slice(0, 6).map((source) => ({
    label: source.domain,
    value: source.citations,
    tone: source.mentioned_competitors.length ? ("watch" as const) : ("neutral" as const),
  }))
  const promptBars = report.intelligence.prompts.slice(0, 6).map((prompt) => ({
    label: prompt.prompt.length > 28 ? prompt.prompt.slice(0, 28) + "…" : prompt.prompt,
    value: prompt.current_mention_rate ?? prompt.priority_score ?? prompt.volume_score ?? 0,
    tone: toneForScore(prompt.current_mention_rate ?? prompt.priority_score ?? null),
  }))

  const positiveShare = report.intelligence.positiveShare ?? 0
  const neutralShare = report.intelligence.neutralShare ?? 0
  const negativeShare = report.intelligence.negativeShare ?? 0
  const hasSentimentShares = positiveShare + neutralShare + negativeShare > 0

  return (
    <div className="flex flex-col gap-3">
      <div className="grid gap-3 xl:grid-cols-3">
        <InsightPanel icon={Cpu} eyebrow="Model coverage" title="Mention rate by model">
          {modelMetricsNeedRefresh && (
            <div className="mb-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11.5px] font-semibold leading-5 text-amber-800">
              This saved report has old model aggregation. Regenerate to populate model-level coverage.
            </div>
          )}
          <ComparisonBarChart items={modelBars} height={180} />
        </InsightPanel>

        <InsightPanel icon={MessageSquareQuote} eyebrow="Prompt movement" title="Highest-priority prompts">
          <ComparisonBarChart items={promptBars} height={180} />
        </InsightPanel>

        <InsightPanel icon={Link} eyebrow="Citation graph" title="Top source influence">
          <ComparisonBarChart items={sourceBars} valueSuffix="" height={180} />
        </InsightPanel>
      </div>

      <section className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3.5 shadow-[0_1px_3px_rgba(9,9,11,0.05)]">
        <SectionHeader icon={Cpu} title="AI models" description={report.intelligence.modelSummary} />
        <ModelCards models={report.intelligence.models} />
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3.5 shadow-[0_1px_3px_rgba(9,9,11,0.05)]">
        <SectionHeader icon={TerminalSquare} title="Prompt changes" description={report.intelligence.promptRecommendation} />
        <PromptTable prompts={report.intelligence.prompts} />
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3.5 shadow-[0_1px_3px_rgba(9,9,11,0.05)]">
        <SectionHeader icon={Link} title="Sources and citations" description={report.intelligence.sourceSummary} />
        {report.intelligence.sourceInsight && (
          <div className="mb-3 rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 shadow-[0_1px_2px_rgba(9,9,11,0.035)]">
            <p className="line-clamp-2 text-[12.5px] font-medium leading-5 text-zinc-600">{report.intelligence.sourceInsight}</p>
          </div>
        )}
        <SourcesTable sources={[...report.intelligence.sources]} />
      </section>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <section className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-3.5 shadow-[0_1px_3px_rgba(9,9,11,0.05)]">
          <div className="absolute inset-y-0 left-0 w-[3px] bg-zinc-900" />
          <div className="mb-3 flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-100 text-zinc-700">
              <Crosshair size={14} strokeWidth={2.1} />
            </div>
            <h3 className="text-[13.5px] font-semibold text-zinc-950">Competitor takeaway</h3>
          </div>
          <p className="text-[13px] font-medium leading-[1.6] text-zinc-600">{report.intelligence.competitorTakeaway}</p>
        </section>

        <section className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-3.5 shadow-[0_1px_3px_rgba(9,9,11,0.05)]">
          <div className="absolute inset-y-0 left-0 w-[3px] bg-zinc-400" />
          <div className="mb-3 flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-100 text-zinc-700">
              <HeartPulse size={14} strokeWidth={2.1} />
            </div>
            <h3 className="text-[13.5px] font-semibold text-zinc-950">Sentiment readout</h3>
          </div>
          <p className="text-[13px] font-medium leading-[1.6] text-zinc-600">{report.intelligence.sentimentReadout}</p>

          {hasSentimentShares && (
            <div className="mt-4">
              <StackedSegmentBar positive={positiveShare} neutral={neutralShare} negative={negativeShare} />
              <div className="mt-2.5 flex items-center gap-4">
                <LegendDot color="#10b981" label={`Positive ${positiveShare}%`} />
                <LegendDot color="#e4e4e7" label={`Neutral ${neutralShare}%`} />
                <LegendDot color="#ef4444" label={`Negative ${negativeShare}%`} />
              </div>
            </div>
          )}
        </section>
      </div>

      {report.intelligence.sentiment.length > 0 && (
        <section className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-3.5 shadow-[0_1px_3px_rgba(9,9,11,0.05)]">
          <div className="absolute inset-y-0 left-0 w-[3px] bg-amber-500" />
          <div className="mb-4 flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-950 text-white">
              <Sparkles size={14} strokeWidth={2.1} />
            </div>
            <h3 className="text-[13.5px] font-semibold text-zinc-950">Sentiment themes</h3>
          </div>
          <TimelineCard items={report.intelligence.sentiment} />
        </section>
      )}
    </div>
  )
}