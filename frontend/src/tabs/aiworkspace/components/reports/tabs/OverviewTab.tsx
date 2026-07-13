import type { ElementType } from "react"
import {
  CheckCircle2,
  AlertTriangle,
  Target,
  ShieldCheck,
  ArrowUpRight,
  ArrowDownRight,
  Trophy,
  AlertCircle,
  Zap,
  Sparkles,
  Smile,
  PlayCircle,
  ListChecks,
  TrendingDown as DecIcon,
  TrendingUp as IncIcon,
} from "lucide-react"

import type { ReportViewModel } from "../utils/reportMapper"
import { ExecutiveSummary } from "../components/ExecutiveSummary"
import { TimelineCard } from "../components/TimelineCard"

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ")
}

const UI = {
  section: "border border-[#e4e4e7] bg-white",
  card: "border border-[#e4e4e7] bg-white",
  text: "text-[#18181b]",
  muted: "text-[#52525b]",
  soft: "text-[#a1a1aa]",
  dark: "bg-[#09090b] text-white",
}

function semanticSurface(tone?: "good" | "risk" | "neutral") {
  if (tone === "good") return "border-emerald-200 bg-emerald-50/80"
  if (tone === "risk") return "border-red-200 bg-red-50/80"
  return "border-[#e4e4e7] bg-white"
}

function semanticText(tone?: "good" | "risk" | "neutral") {
  if (tone === "good") return "text-emerald-900"
  if (tone === "risk") return "text-red-900"
  return "text-[#18181b]"
}

function Delta({
  val,
  unit = "",
  intent = "positiveUp",
}: {
  val: number
  unit?: string
  intent?: "positiveUp" | "risk"
}) {
  const up = val >= 0
  const Icon = up ? ArrowUpRight : ArrowDownRight
  const good = intent === "risk" ? val < 0 : val >= 0

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full border px-1.5 py-0.5 text-[10px] font-semibold tabular-nums",
        good
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-red-200 bg-red-50 text-red-700",
      )}
    >
      <Icon size={10} strokeWidth={2.4} />
      {val > 0 ? "+" : ""}
      {val}
      {unit}
    </span>
  )
}

function SectionHeader({
  icon: Icon,
  title,
  badge,
}: {
  icon: ElementType
  title: string
  badge?: string | number
}) {
  return (
    <div className="mb-3 flex items-center justify-between border-b border-[#e4e4e7] pb-3">
      <div className="flex items-center gap-2.5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#09090b] shadow-sm">
          <Icon size={13} className="text-white" strokeWidth={2.15} />
        </div>

        <h3 className="text-[13px] font-semibold tracking-[-0.01em] text-[#18181b]">
          {title}
        </h3>
      </div>

      {badge !== undefined && (
        <span className="rounded-full border border-[#e4e4e7] bg-white px-2 py-0.5 text-[10.5px] font-semibold tabular-nums text-[#52525b]">
          {badge}
        </span>
      )}
    </div>
  )
}

function MetricCard({
  label,
  value,
  icon: Icon,
  delta,
  unit,
  tone = "neutral",
}: {
  label: string
  value: string | number
  icon: ElementType
  delta?: number
  unit?: string
  tone?: "good" | "risk" | "neutral"
}) {
  return (
    <div className={cn("rounded-xl border px-4 py-3 shadow-[0_1px_2px_rgba(9,9,11,0.04)]", semanticSurface(tone))}>
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <Icon
            size={13}
            className={cn(
              "shrink-0",
              tone === "good" && "text-emerald-700",
              tone === "risk" && "text-red-700",
              tone === "neutral" && "text-[#a1a1aa]",
            )}
            strokeWidth={2.1}
          />

          <span className="truncate text-[10px] font-semibold uppercase tracking-[0.1em] text-[#71717a]">
            {label}
          </span>
        </div>

        {delta !== undefined && <Delta val={delta} unit={unit} />}
      </div>

      <span
        className={cn(
          "block text-[23px] font-semibold leading-none tracking-[-0.035em] tabular-nums",
          semanticText(tone),
        )}
      >
        {value}
      </span>
    </div>
  )
}

const EXEC_CARDS = [
  {
    key: "wins" as const,
    title: "Key Wins",
    icon: CheckCircle2,
    tone: "good" as const,
    iconClass: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  {
    key: "risks" as const,
    title: "Key Risks",
    icon: AlertTriangle,
    tone: "risk" as const,
    iconClass: "border-red-200 bg-red-50 text-red-700",
  },
  {
    key: "focus" as const,
    title: "Next Best Move",
    icon: Target,
    tone: "neutral" as const,
    iconClass: "border-[#e4e4e7] bg-white text-[#09090b]",
  },
]

type StatItem = {
  label: string
  value: string | number
  icon: ElementType
  delta?: number
  unit?: string
  tone?: "good" | "risk" | "neutral"
}

export function OverviewTab({ report }: { report: ReportViewModel }) {
  const m = report.overallMovement

  const statRail: StatItem[] = m
    ? [
      {
        label: "Sentiment",
        value: m.sentiment_score,
        delta: m.sentiment_delta,
        unit: "pts",
        icon: Smile,
      },
      {
        label: "Total Runs",
        value: m.total_runs,
        icon: PlayCircle,
      },
      ...(report.promptSummary
        ? [
          {
            label: "Prompts Tracked",
            value: report.promptSummary.total_prompts_tracked,
            icon: ListChecks,
          },
          {
            label: "Declining",
            value: report.promptSummary.declined_prompts_count,
            icon: DecIcon,
            tone: (report.promptSummary.declined_prompts_count > 0 ? "risk" : "neutral") as "risk" | "neutral",
          },
          {
            label: "Improving",
            value: report.promptSummary.improved_prompts_count,
            icon: IncIcon,
            tone: (report.promptSummary.improved_prompts_count > 0 ? "good" : "neutral") as "good" | "neutral",
          },
        ]
        : []),
    ]
    : []

  return (
    <div className="flex flex-col gap-3">
      {/* STAT RAIL */}
      {statRail.length > 0 && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {statRail.map((s) => (
            <MetricCard
              key={s.label}
              label={s.label}
              value={s.value}
              icon={s.icon}
              delta={s.delta}
              unit={s.unit}
              tone={s.tone}
            />
          ))}
        </div>
      )}

      {/* EXECUTIVE SUMMARY */}
      <ExecutiveSummary summary={report.summary} timeline={report.executive.timeline} />

      {/* LEADERBOARD */}
      {report.leaderboard.length > 0 && (
        <section className={cn("rounded-2xl p-4 shadow-[0_1px_3px_rgba(9,9,11,0.05)]", UI.section)}>
          <SectionHeader icon={Trophy} title="Share of Voice Leaderboard" />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {report.leaderboard.map((entry) => {
              const isOwn = entry.type === "own_brand"
              const pct = Math.min(100, entry.mention_rate)
              const up = entry.delta >= 0

              return (
                <div
                  key={entry.name}
                  className={cn(
                    "relative overflow-hidden rounded-xl border p-3.5 transition-all",
                    isOwn
                      ? "border-emerald-200 bg-emerald-50/70 shadow-[0_8px_22px_rgba(9,9,11,0.07)]"
                      : "border-[#e4e4e7] bg-white shadow-[0_1px_2px_rgba(9,9,11,0.04)] hover:border-[#d4d4d8]",
                  )}
                >
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        className={cn(
                          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10.5px] font-semibold tabular-nums",
                          isOwn
                            ? "bg-emerald-700 text-white"
                            : "bg-[#f4f4f5] text-[#52525b]",
                        )}
                      >
                        {entry.rank}
                      </span>

                      <p className="truncate text-[13px] font-semibold text-[#18181b]">
                        {entry.name}
                      </p>
                    </div>

                    <span
                      className={cn(
                        "inline-flex shrink-0 items-center gap-0.5 rounded-full border px-1.5 py-0.5 text-[10px] font-semibold tabular-nums",
                        up
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-red-200 bg-red-50 text-red-700",
                      )}
                    >
                      {up ? (
                        <ArrowUpRight size={10} strokeWidth={2.4} />
                      ) : (
                        <ArrowDownRight size={10} strokeWidth={2.4} />
                      )}
                      {entry.delta > 0 ? "+" : ""}
                      {entry.delta}%
                    </span>
                  </div>

                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-[27px] font-semibold leading-none tracking-[-0.04em] tabular-nums text-[#18181b]">
                          {entry.mention_rate}
                        </span>

                        <span className="text-[12px] font-medium text-[#a1a1aa]">
                          %
                        </span>
                      </div>

                      <p className="mt-1 text-[10.5px] font-medium uppercase tracking-[0.08em] text-[#71717a]">
                        Mention rate
                      </p>
                    </div>

                    {isOwn && (
                      <span className="rounded-full border border-emerald-200 bg-white px-2 py-1 text-[9.5px] font-semibold uppercase tracking-[0.08em] text-emerald-800">
                        You
                      </span>
                    )}
                  </div>

                  <div className="mt-3 h-[5px] w-full overflow-hidden rounded-full bg-[#e4e4e7]">
                    <div
                      className={cn(
                        "h-full rounded-full",
                        isOwn ? "bg-emerald-600" : "bg-[#a1a1aa]",
                      )}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* WINS / RISKS / FOCUS */}
      <section className={cn("rounded-2xl p-4 shadow-[0_1px_3px_rgba(9,9,11,0.05)]", UI.section)}>
        <SectionHeader icon={Sparkles} title="Executive Signals" />

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {EXEC_CARDS.map(({ key, title, icon: Icon, tone, iconClass }) => {
            const list = report.executive[key]
            if (!list || list.length === 0) return null

            return (
              <div
                key={key}
                className={cn("rounded-xl border p-3.5 shadow-[0_1px_2px_rgba(9,9,11,0.035)]", semanticSurface(tone))}
              >
                <div className="mb-3 flex items-center gap-2">
                  <div
                    className={cn(
                      "flex h-6 w-6 items-center justify-center rounded-lg border",
                      iconClass,
                    )}
                  >
                    <Icon size={12} strokeWidth={2.1} />
                  </div>

                  <h4 className="text-[12.5px] font-semibold text-[#18181b]">
                    {title}
                  </h4>

                  <span className="ml-auto text-[10.5px] font-semibold tabular-nums text-[#a1a1aa]">
                    {list.length}
                  </span>
                </div>

                <TimelineCard items={list} tone={tone} />
              </div>
            )
          })}
        </div>
      </section>

      {/* RISK & FOCUS SIGNALS */}
      {(report.topRisks.length > 0 || report.topFocus.length > 0) && (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {report.topRisks.length > 0 && (
            <section className={cn("rounded-2xl p-4 shadow-[0_1px_3px_rgba(9,9,11,0.05)]", UI.section)}>
              <SectionHeader
                icon={AlertCircle}
                title="Risk Signals"
                badge={report.topRisks.length}
              />

              <div className="flex flex-col gap-2.5">
                {report.topRisks.map((r, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-red-200/70 bg-red-50/70 p-3.5"
                  >
                    <div className="mb-1.5 flex items-start justify-between gap-3">
                      <span className="text-[12.5px] font-semibold text-red-950">
                        {r.label}
                      </span>

                      {r.delta !== undefined && (
                        <Delta val={r.delta} unit="%" intent="risk" />
                      )}
                    </div>

                    <p className="text-[12px] font-medium leading-[1.55] text-red-900/75">
                      {r.supporting_detail}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {report.topFocus.length > 0 && (
            <section className={cn("rounded-2xl p-4 shadow-[0_1px_3px_rgba(9,9,11,0.05)]", UI.section)}>
              <SectionHeader
                icon={Zap}
                title="Priority Focus"
                badge={report.topFocus.length}
              />

              <div className="flex flex-col gap-2.5">
                {report.topFocus.map((f, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-[#e4e4e7] bg-white p-3.5"
                  >
                    <p className="text-[12.5px] font-semibold text-[#18181b]">
                      {f.title}
                    </p>

                    <p className="mt-1 text-[12px] font-medium leading-[1.55] text-[#52525b]">
                      {f.reason}
                    </p>

                    {f.expected_impact && (
                      <div className="mt-2.5 flex items-center gap-1.5 rounded-lg border border-[#e4e4e7] bg-[#f4f4f5] px-2 py-1.5">
                        <Target size={10} className="text-[#09090b]" strokeWidth={2.1} />

                        <span className="text-[11px] font-semibold text-[#18181b]">
                          {f.expected_impact}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* CONFIDENCE NOTE */}
      {report.confidence && (
        <div className="flex items-start gap-2.5 rounded-2xl border border-[#e4e4e7] bg-[#fafafa] px-4 py-3 shadow-[0_1px_2px_rgba(9,9,11,0.04)]">
          <ShieldCheck
            size={14}
            className="mt-0.5 shrink-0 text-[#a1a1aa]"
            strokeWidth={2.1}
          />

          <p className="text-[12px] font-medium leading-[1.6] text-[#52525b]">
            {report.confidence}
          </p>
        </div>
      )}
    </div>
  )
}
