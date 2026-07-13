import type { ReportViewModel } from "../utils/reportMapper"

export type ExportSection = {
  title: string
  body?: string
  items?: string[]
}

export type ExportReportData = {
  fileName: string
  title: string
  subtitle: string
  period: string
  headline: string
  summary: string
  metrics: { label: string; value: string }[]
  sections: ExportSection[]
}

function cleanFilePart(value: string) {
  return value
    .trim()
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase()
}

function compactList(items: string[], max = 5) {
  return items.filter(Boolean).slice(0, max)
}

function linesFromObjects<T>(
  items: T[],
  mapper: (item: T) => string,
  max = 5,
) {
  return items.map(mapper).filter(Boolean).slice(0, max)
}

export function createExportData(report: ReportViewModel): ExportReportData {
  const brand = report.brandName || "Brand"
  const period = report.periodLabel || "Recent Period"
  const fileName = `${cleanFilePart(brand)}-ai-visibility-report-${cleanFilePart(period)}`

  const sections: ExportSection[] = [
    {
      title: "Executive Summary",
      body: report.summary,
      items: compactList(report.executive.timeline, 6),
    },
    {
      title: "Wins",
      items: compactList(report.executive.wins, 5),
    },
    {
      title: "Risks",
      items: compactList(report.executive.risks, 5),
    },
    {
      title: "Recommended Focus",
      items: compactList(report.executive.focus, 5),
    },
    {
      title: "Visibility Score",
      body: report.visibility.explanation,
      items: linesFromObjects(
        report.visibility.components,
        (component) => `${component.component}: ${component.score} (${component.raw_value || component.interpretation_signal})`,
        6,
      ),
    },
    {
      title: "Model Intelligence",
      body: report.intelligence.modelSummary || report.intelligence.modelHeadline,
      items: linesFromObjects(
        report.intelligence.models,
        (model) => `${model.model}: ${model.summary || model.recommended_action}`,
        5,
      ),
    },
    {
      title: "Prompt Movement",
      body: report.intelligence.promptRecommendation,
      items: linesFromObjects(
        report.intelligence.prompts,
        (prompt) => `${prompt.prompt}: ${prompt.summary}`,
        5,
      ),
    },
    {
      title: "Competitor Threats",
      body: report.intelligence.competitorTakeaway,
      items: linesFromObjects(
        report.intelligence.competitors,
        (competitor) => `${competitor.competitor}: ${competitor.summary || competitor.recommended_response}`,
        5,
      ),
    },
    {
      title: "Sources & Citations",
      body: report.intelligence.sourceSummary || report.intelligence.sourceInsight,
      items: linesFromObjects(
        report.intelligence.sources,
        (source) => `${source.domain}: ${source.citations} citations, delta ${source.delta >= 0 ? "+" : ""}${source.delta}`,
        6,
      ),
    },
    {
      title: "Recommendations",
      body: report.recommendations.opportunityTheme || report.recommendations.content,
      items: [
        ...compactList(report.recommendations.priority, 3),
        ...compactList(report.recommendations.quickWins, 3),
        ...compactList(report.recommendations.sourceActions, 3),
      ].slice(0, 7),
    },
    {
      title: "Content Sequence",
      body: report.recommendations.content,
      items: linesFromObjects(
        report.recommendations.contentSequence,
        (item) => `${item.suggested_title || item.title}: ${item.priority_reason || item.body || item.content_type || ""}`,
        6,
      ),
    },
  ].filter((section) => section.body || (section.items && section.items.length > 0))

  return {
    fileName,
    title: `${brand} Visibility Report`,
    subtitle: "AI visibility, source, prompt, competitor, and content recommendations",
    period,
    headline: report.headline,
    summary: report.summary,
    metrics: report.metrics.map((metric) => ({
      label: metric.label,
      value: metric.value,
    })),
    sections,
  }
}
