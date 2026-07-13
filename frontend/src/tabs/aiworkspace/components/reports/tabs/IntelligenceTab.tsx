import type { ReportViewModel } from "../utils/reportMapper"
import { ModelCards } from "../components/ModelCards"
import { PromptTable } from "../components/PromptTable"
import { SourcesTable } from "../components/SourcesTable"
import { TimelineCard } from "../components/TimelineCard"
import {
  Cpu,
  TerminalSquare,
  Link,
  Crosshair,
  HeartPulse,
  Sparkles,
} from "lucide-react"

function SectionHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType
  title: string
  description?: string
}) {
  return (
    <div className="mb-3 flex items-start gap-2.5">
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#09090b] text-white shadow-sm">
        <Icon size={12.5} strokeWidth={2.1} />
      </div>

      <div>
        <h3 className="text-[13px] font-semibold text-[#18181b]">
          {title}
        </h3>

        {description && (
          <p className="mt-1 line-clamp-2 text-[12px] font-medium leading-5 text-[#52525b]">
            {description}
          </p>
        )}
      </div>
    </div>
  )
}

export function IntelligenceTab({ report }: { report: ReportViewModel }) {
  return (
    <div className="flex flex-col gap-3">
      {/* AI Models */}
      <section className="rounded-2xl border border-[#e4e4e7] bg-[#fafafa] p-3.5 shadow-[0_1px_3px_rgba(9,9,11,0.05)]">
        <SectionHeader
          icon={Cpu}
          title="AI Models"
          description={report.intelligence.modelSummary}
        />

        <ModelCards models={report.intelligence.models} />
      </section>

      {/* Prompt Changes */}
      <section className="rounded-2xl border border-[#e4e4e7] bg-[#fafafa] p-3.5 shadow-[0_1px_3px_rgba(9,9,11,0.05)]">
        <SectionHeader
          icon={TerminalSquare}
          title="Prompt Changes"
          description={report.intelligence.promptRecommendation}
        />

        <PromptTable prompts={report.intelligence.prompts} />
      </section>

      {/* Sources & Citations */}
      <section className="rounded-2xl border border-[#e4e4e7] bg-[#fafafa] p-3.5 shadow-[0_1px_3px_rgba(9,9,11,0.05)]">
        <SectionHeader
          icon={Link}
          title="Sources & Citations"
          description={report.intelligence.sourceSummary}
        />

        {report.intelligence.sourceInsight && (
          <div className="mb-3 rounded-xl border border-[#e4e4e7] bg-white px-3.5 py-2.5 shadow-[0_1px_2px_rgba(9,9,11,0.035)]">
            <p className="line-clamp-2 text-[12.5px] font-medium leading-5 text-[#52525b]">
              {report.intelligence.sourceInsight}
            </p>
          </div>
        )}

        <SourcesTable sources={[...report.intelligence.sources]} />
      </section>

      {/* Takeaway & Sentiment Grid */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <section className="relative overflow-hidden rounded-2xl border border-[#e4e4e7] bg-white p-3.5 shadow-[0_1px_3px_rgba(9,9,11,0.05)]">
          <div className="absolute inset-y-0 left-0 w-[3px] bg-[#09090b]" />

          <div className="mb-3 flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#e4e4e7] bg-white text-[#09090b]">
              <Crosshair size={14} strokeWidth={2.1} />
            </div>

            <h3 className="text-[13.5px] font-semibold text-[#18181b]">
              Competitor Takeaway
            </h3>
          </div>

          <p className="text-[13px] font-medium leading-[1.6] text-[#52525b]">
            {report.intelligence.competitorTakeaway}
          </p>
        </section>

        <section className="relative overflow-hidden rounded-2xl border border-[#e4e4e7] bg-white p-3.5 shadow-[0_1px_3px_rgba(9,9,11,0.05)]">
          <div className="absolute inset-y-0 left-0 w-[3px] bg-[#71717a]" />

          <div className="mb-3 flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#e4e4e7] bg-white text-[#09090b]">
              <HeartPulse size={14} strokeWidth={2.1} />
            </div>

            <h3 className="text-[13.5px] font-semibold text-[#18181b]">
              Sentiment Readout
            </h3>
          </div>

          <p className="text-[13px] font-medium leading-[1.6] text-[#52525b]">
            {report.intelligence.sentimentReadout}
          </p>
        </section>
      </div>

      {/* Sentiment Themes */}
      {report.intelligence.sentiment.length > 0 && (
        <section className="relative overflow-hidden rounded-2xl border border-[#e4e4e7] bg-white p-3.5 shadow-[0_1px_3px_rgba(9,9,11,0.05)]">
          <div className="absolute inset-y-0 left-0 w-[3px] bg-[#09090b]" />

          <div className="mb-4 flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#09090b] text-white">
              <Sparkles size={14} strokeWidth={2.1} />
            </div>

            <h3 className="text-[13.5px] font-semibold text-[#18181b]">
              Sentiment Themes
            </h3>
          </div>

          <TimelineCard items={report.intelligence.sentiment} />
        </section>
      )}
    </div>
  )
}
