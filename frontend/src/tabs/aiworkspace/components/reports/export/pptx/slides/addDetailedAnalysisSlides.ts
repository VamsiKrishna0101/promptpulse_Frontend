import type PptxGenJS from "pptxgenjs"
import type { ReportViewModel } from "../../../utils/reportMapper"
import type { ExportReportData } from "../../reportExportData"
import { addBackground, addCard, addEyebrow, addFooter } from "../pptxHelpers"
import { bodyText, PPTX, slideTitle } from "../pptxTheme"

function addTitle(slide: ReturnType<PptxGenJS["addSlide"]>, eyebrow: string, title: string, body: string) {
  addEyebrow(slide, eyebrow, 0.65, 0.5)
  slide.addText(title, { ...slideTitle, x: 0.65, y: 0.78, w: 6.8, h: 0.42 })
  if (body) {
    slide.addText(body, {
      ...bodyText,
      x: 0.67,
      y: 1.34,
      w: 11.4,
      h: 0.42,
      fontSize: 10.5,
    })
  }
}

function addDetailCard(
  slide: ReturnType<PptxGenJS["addSlide"]>,
  x: number,
  y: number,
  w: number,
  h: number,
  title: string,
  body: string,
  meta: string[],
  tone: "neutral" | "risk" | "good" = "neutral",
) {
  const fill = tone === "risk" ? PPTX.colors.redSoft : tone === "good" ? PPTX.colors.greenSoft : PPTX.colors.white
  const accent = tone === "risk" ? PPTX.colors.red : tone === "good" ? PPTX.colors.green : PPTX.colors.dark
  const compact = h < 1.45
  addCard(slide, x, y, w, h, fill)
  slide.addText(title, {
    x: x + 0.2,
    y: y + (compact ? 0.13 : 0.16),
    w: w - 0.4,
    h: 0.25,
    fontFace: PPTX.font,
    fontSize: compact ? 9.5 : 10.5,
    bold: true,
    color: accent,
    margin: 0,
    fit: "shrink",
  })
  slide.addText(body || "No narrative available.", {
    ...bodyText,
    x: x + 0.2,
    y: y + (compact ? 0.48 : 0.55),
    w: w - 0.4,
    h: compact ? 0.24 : 0.42,
    fontSize: compact ? 7.2 : 8,
  })
  const maxMeta = compact ? 1 : 3
  meta.filter(Boolean).slice(0, maxMeta).forEach((item, index) => {
    const top = compact ? y + h - 0.28 : y + 1.08 + index * 0.3
    slide.addShape("ellipse", {
      x: x + 0.22,
      y: top + 0.05,
      w: 0.06,
      h: 0.06,
      fill: { color: accent },
      line: { color: accent },
    })
    slide.addText(item, {
      ...bodyText,
      x: x + 0.34,
      y: top,
      w: w - 0.58,
      h: 0.18,
      fontSize: 7.2,
    })
  })
}

export function addModelDetailSlides(pptx: PptxGenJS, report: ReportViewModel, data: ExportReportData) {
  const slide = pptx.addSlide()
  addBackground(slide)
  addTitle(slide, "AI model analysis", "Model-Level Readout", report.intelligence.modelSummary || report.intelligence.modelHeadline)

  report.intelligence.models.slice(0, 4).forEach((model, index) => {
    const x = 0.65 + (index % 2) * 6.15
    const y = 2.05 + Math.floor(index / 2) * 2.28
    addDetailCard(
      slide,
      x,
      y,
      5.65,
      1.98,
      `${model.model} - ${model.status}`,
      model.summary,
      [
        model.mention_rate !== undefined ? `Mention rate: ${model.mention_rate}%` : "",
        model.average_position !== undefined ? `Average position: ${model.average_position}` : "",
        model.top_competitor ? `Top competitor: ${model.top_competitor.name}` : "",
        model.recommended_action ? `Action: ${model.recommended_action}` : "",
      ],
      model.status?.toLowerCase().includes("weak") ? "risk" : "neutral",
    )
  })

  addFooter(slide, data.period)
}

export function addPromptDetailSlides(pptx: PptxGenJS, report: ReportViewModel, data: ExportReportData) {
  const prompts = report.intelligence.prompts
  for (let start = 0; start < prompts.length; start += 4) {
    const slide = pptx.addSlide()
    addBackground(slide)
    addTitle(slide, "Prompt movement", start === 0 ? "Prompt-Level Movement" : "Prompt-Level Movement Continued", report.intelligence.promptRecommendation)

    prompts.slice(start, start + 4).forEach((prompt, index) => {
      const x = 0.65 + (index % 2) * 6.15
      const y = 2.05 + Math.floor(index / 2) * 2.28
      addDetailCard(
        slide,
        x,
        y,
        5.65,
        1.98,
        prompt.prompt,
        prompt.summary,
        [
          prompt.intent ? `Intent: ${prompt.intent}` : "",
          prompt.current_mention_rate !== undefined ? `Mention: ${prompt.current_mention_rate}%` : "",
          prompt.mention_rate_delta !== undefined ? `Mention delta: ${prompt.mention_rate_delta >= 0 ? "+" : ""}${prompt.mention_rate_delta}%` : "",
          prompt.top_competitor ? `Threat: ${prompt.top_competitor.name}` : "",
        ],
        prompt.mention_rate_delta !== undefined && prompt.mention_rate_delta < 0 ? "risk" : "neutral",
      )
    })

    addFooter(slide, data.period)
  }
}

export function addCompetitorDetailSlides(pptx: PptxGenJS, report: ReportViewModel, data: ExportReportData) {
  const competitors = report.intelligence.competitors
  for (let start = 0; start < competitors.length; start += 4) {
    const slide = pptx.addSlide()
    addBackground(slide)
    addTitle(slide, "Competitor intelligence", start === 0 ? "Competitor Threats" : "Competitor Threats Continued", report.intelligence.competitorTakeaway)

    competitors.slice(start, start + 4).forEach((competitor, index) => {
      const x = 0.65 + (index % 2) * 6.15
      const y = 2.05 + Math.floor(index / 2) * 2.28
      addDetailCard(
        slide,
        x,
        y,
        5.65,
        1.98,
        `${competitor.competitor} - ${competitor.threat_level}`,
        competitor.summary || competitor.recommended_response,
        [
          competitor.current_mention_rate !== undefined ? `Mention: ${competitor.current_mention_rate}%` : "",
          competitor.prompts_won_against_brand !== undefined ? `Prompts won: ${competitor.prompts_won_against_brand}` : "",
          competitor.why_they_are_winning[0] ? `Why: ${competitor.why_they_are_winning[0]}` : "",
          competitor.recommended_response ? `Response: ${competitor.recommended_response}` : "",
        ],
        "risk",
      )
    })

    addFooter(slide, data.period)
  }
}

export function addSourceSentimentSlide(pptx: PptxGenJS, report: ReportViewModel, data: ExportReportData) {
  const slide = pptx.addSlide()
  addBackground(slide)
  addTitle(slide, "Sources and citations", "Top Cited Sources", report.intelligence.sourceSummary || report.intelligence.sourceInsight)

  report.intelligence.sources.slice(0, 6).forEach((source, index) => {
    const x = 0.65 + (index % 2) * 6.15
    const y = 2.02 + Math.floor(index / 2) * 1.38
    addDetailCard(
      slide,
      x,
      y,
      5.65,
      1.2,
      source.domain,
      `${source.citations} citations, ${source.delta >= 0 ? "+" : ""}${source.delta} change, ${source.url_type || "source"}`,
      source.mentioned_competitors.slice(0, 1).map((item) => `Mentions ${item}`),
    )
  })

  addFooter(slide, data.period)

  const sentimentSlide = pptx.addSlide()
  addBackground(sentimentSlide)
  addTitle(sentimentSlide, "Sentiment and positioning", "Sentiment Readout & Leaderboard", report.intelligence.sentimentReadout)

  addDetailCard(
    sentimentSlide,
    0.65,
    2.1,
    5.85,
    2.15,
    "Sentiment Readout",
    report.intelligence.sentimentReadout,
    report.intelligence.sentiment,
    "good",
  )
  addDetailCard(
    sentimentSlide,
    6.8,
    2.1,
    5.75,
    2.15,
    "Leaderboard",
    report.leaderboard.slice(0, 4).map((entry) => `#${entry.rank} ${entry.name}`).join(", "),
    report.leaderboard.slice(0, 4).map((entry) => `${entry.mention_rate}% mention rate (${entry.delta >= 0 ? "+" : ""}${entry.delta})`),
  )

  addFooter(sentimentSlide, data.period)
}
