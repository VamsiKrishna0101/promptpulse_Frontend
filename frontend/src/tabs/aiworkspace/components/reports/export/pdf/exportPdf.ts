import { jsPDF } from "jspdf"
import type { ReportViewModel } from "../../utils/reportMapper"
import { createExportData } from "../reportExportData"

const C = {
  ink: "#0b1720",
  muted: "#52616d",
  faint: "#8392a0",
  page: "#f7faf9",
  card: "#ffffff",
  line: "#d9e3df",
  dark: "#0b3340",
  dark2: "#174b5a",
  green: "#047857",
  greenBg: "#e9f8ef",
  red: "#b42318",
  redBg: "#fdecec",
  amber: "#a15c07",
  amberBg: "#fff7e6",
}

const PAGE = {
  w: 210,
  h: 297,
  x: 16,
  top: 32,
  bottom: 278,
}

type Tone = "neutral" | "good" | "risk" | "warn"

type PdfState = {
  y: number
  period: string
  title: string
}

function setFont(doc: jsPDF, style: "normal" | "bold", size: number, color = C.ink) {
  doc.setFont("helvetica", style)
  doc.setFontSize(size)
  doc.setTextColor(color)
}

function toneColor(tone: Tone) {
  if (tone === "good") return { fill: C.greenBg, border: "#9de8be", text: C.green }
  if (tone === "risk") return { fill: C.redBg, border: "#f5b5b5", text: C.red }
  if (tone === "warn") return { fill: C.amberBg, border: "#f5d38a", text: C.amber }
  return { fill: C.card, border: C.line, text: C.ink }
}

function drawPageChrome(doc: jsPDF, state: PdfState, heading?: string) {
  doc.setFillColor(C.page)
  doc.rect(0, 0, PAGE.w, PAGE.h, "F")
  doc.setFillColor("#e3f0ec")
  doc.circle(188, -4, 24, "F")

  setFont(doc, "bold", 6.8, C.faint)
  doc.text("PROMPTPULSE AI VISIBILITY REPORT", PAGE.x, 11)
  doc.text(state.period, PAGE.w - PAGE.x, 11, { align: "right" })

  if (heading) {
    setFont(doc, "bold", 17, C.ink)
    doc.text(heading, PAGE.x, 23, { maxWidth: 150 })
  }

  setFont(doc, "bold", 6.8, C.faint)
  doc.text("PromptPulse", PAGE.x, PAGE.h - 8)
  doc.text(String(doc.getNumberOfPages()), PAGE.w - PAGE.x, PAGE.h - 8, { align: "right" })
}

function newPage(doc: jsPDF, state: PdfState, heading?: string) {
  if (doc.getNumberOfPages() > 0) doc.addPage()
  drawPageChrome(doc, state, heading)
  state.y = PAGE.top
}

function ensure(doc: jsPDF, state: PdfState, height: number, heading?: string) {
  if (state.y + height <= PAGE.bottom) return
  newPage(doc, state, heading)
}

function lines(doc: jsPDF, value: string, width: number, size: number) {
  setFont(doc, "normal", size, C.muted)
  return doc.splitTextToSize(value || "Not available", width) as string[]
}

function label(doc: jsPDF, value: string, x: number, y: number, color = C.faint) {
  setFont(doc, "bold", 6.4, color)
  doc.text(value.toUpperCase(), x, y)
}

function metric(doc: jsPDF, x: number, y: number, w: number, labelText: string, value: string) {
  doc.setDrawColor(C.line)
  doc.setFillColor(C.card)
  doc.roundedRect(x, y, w, 20, 3, 3, "FD")
  label(doc, labelText, x + 4, y + 7)
  setFont(doc, "bold", 13, C.ink)
  doc.text(value, x + 4, y + 16, { maxWidth: w - 8 })
}

function addParagraph(doc: jsPDF, state: PdfState, text: string, heading?: string) {
  const wrapped = lines(doc, text, 170, 9.2)
  const height = wrapped.length * 4.5 + 12
  ensure(doc, state, height, heading)
  doc.setDrawColor(C.line)
  doc.setFillColor(C.card)
  doc.roundedRect(PAGE.x, state.y, 178, height, 3.5, 3.5, "FD")
  setFont(doc, "normal", 9.2, C.ink)
  doc.text(wrapped, PAGE.x + 6, state.y + 9)
  state.y += height + 6
}

function addSectionTitle(doc: jsPDF, state: PdfState, title: string, heading?: string) {
  ensure(doc, state, 13, heading)
  setFont(doc, "bold", 12.5, C.ink)
  doc.text(title, PAGE.x, state.y)
  doc.setDrawColor(C.line)
  doc.line(PAGE.x, state.y + 3.5, PAGE.w - PAGE.x, state.y + 3.5)
  state.y += 11
}

function addCard(
  doc: jsPDF,
  state: PdfState,
  title: string,
  body: string | undefined,
  details: string[] = [],
  tone: Tone = "neutral",
  heading?: string,
) {
  const width = 166
  const visibleDetails = details.filter(Boolean).slice(0, 7)
  const bodyLines = body ? lines(doc, body, width, 8.2).slice(0, 6) : []
  const detailLineGroups = visibleDetails.map((item) => lines(doc, item, width - 7, 7.4).slice(0, 2))
  const detailLineCount = detailLineGroups.reduce((sum, group) => sum + group.length, 0)
  const height = Math.max(
    34,
    18 + bodyLines.length * 4.2 + detailLineCount * 3.8 + visibleDetails.length * 2.2 + 8,
  )

  ensure(doc, state, height + 4, heading)
  const color = toneColor(tone)
  doc.setDrawColor(color.border)
  doc.setFillColor(color.fill)
  doc.roundedRect(PAGE.x, state.y, 178, height, 3.5, 3.5, "FD")

  setFont(doc, "bold", 10, color.text)
  doc.text(title, PAGE.x + 6, state.y + 9, { maxWidth: 150 })

  let y = state.y + 18
  if (bodyLines.length) {
    setFont(doc, "normal", 8.2, C.muted)
    doc.text(bodyLines, PAGE.x + 6, y)
    y += bodyLines.length * 4.2 + 4
  }

  if (visibleDetails.length) {
    visibleDetails.forEach((item) => {
      const itemLines = lines(doc, item, width - 7, 7.4).slice(0, 2)
      doc.setFillColor(color.text)
      doc.circle(PAGE.x + 7, y - 1.1, 0.75, "F")
      setFont(doc, "normal", 7.4, C.muted)
      doc.text(itemLines, PAGE.x + 11, y)
      y += itemLines.length * 3.8 + 2.2
    })
  }

  state.y += height + 6
}

function addTwoColumnCards(
  doc: jsPDF,
  state: PdfState,
  cards: Array<{ title: string; body?: string; details?: string[]; tone?: Tone }>,
  heading?: string,
) {
  const gap = 6
  const colW = 86
  let leftY = state.y
  let rightY = state.y

  cards.forEach((item, index) => {
    const x = index % 2 === 0 ? PAGE.x : PAGE.x + colW + gap
    const currentY = index % 2 === 0 ? leftY : rightY
    const titleLines = lines(doc, item.title, colW - 10, 8.8).slice(0, 2)
    const bodyLines = item.body ? lines(doc, item.body, colW - 12, 7.4).slice(0, 4) : []
    const detailItems = (item.details || []).filter(Boolean).slice(0, 3)
    const detailLines = detailItems
      .filter(Boolean)
      .flatMap((detail) => lines(doc, detail, colW - 17, 7).slice(0, 2))
    const h = Math.max(38, 11 + titleLines.length * 4.2 + bodyLines.length * 3.7 + detailLines.length * 3.4 + 8)

    if (currentY + h > PAGE.bottom) {
      state.y = Math.max(leftY, rightY)
      newPage(doc, state, heading)
      leftY = state.y
      rightY = state.y
    }

    const y = index % 2 === 0 ? leftY : rightY
    const color = toneColor(item.tone || "neutral")
    doc.setDrawColor(color.border)
    doc.setFillColor(color.fill)
    doc.roundedRect(x, y, colW, h, 3.2, 3.2, "FD")
    setFont(doc, "bold", 8.8, color.text)
    doc.text(titleLines, x + 5, y + 8)

    let cursor = y + 10 + titleLines.length * 4.2
    if (bodyLines.length) {
      setFont(doc, "normal", 7.4, C.muted)
      doc.text(bodyLines, x + 5, cursor)
      cursor += bodyLines.length * 3.7 + 3
    }

    detailItems.forEach((detail) => {
      const detailWrapped = lines(doc, detail, colW - 17, 7).slice(0, 2)
      doc.setFillColor(color.text)
      doc.circle(x + 6, cursor - 1.1, 0.65, "F")
      setFont(doc, "normal", 7, C.muted)
      doc.text(detailWrapped, x + 10, cursor)
      cursor += detailWrapped.length * 3.4 + 2
    })

    if (index % 2 === 0) leftY += h + 6
    else rightY += h + 6
  })

  state.y = Math.max(leftY, rightY)
}

function cover(doc: jsPDF, report: ReportViewModel, state: PdfState) {
  drawPageChrome(doc, state)
  const data = createExportData(report)

  doc.setFillColor(C.dark)
  doc.roundedRect(16, 24, 178, 64, 4, 4, "F")
  doc.setFillColor(C.dark2)
  doc.circle(179, 27, 26, "F")

  label(doc, "AI Visibility Report", 26, 40, "#d7e4e1")
  setFont(doc, "bold", 24, "#ffffff")
  doc.text(data.title, 26, 56, { maxWidth: 118 })
  setFont(doc, "normal", 9.5, "#d7e4e1")
  doc.text(data.headline || data.subtitle, 26, 73, { maxWidth: 125 })

  doc.setFillColor("#315c67")
  doc.setDrawColor("#6f8991")
  doc.roundedRect(151, 53, 30, 22, 3, 3, "FD")
  label(doc, "Period", 157, 61, "#d7e4e1")
  setFont(doc, "bold", 9, "#ffffff")
  doc.text(data.period, 157, 69, { maxWidth: 18 })

  data.metrics.slice(0, 4).forEach((item, index) => {
    metric(doc, 16 + index * 46, 121, 40, item.label, item.value)
  })

  state.y = 140
  addParagraph(doc, state, data.summary, "Executive Summary")

  addSectionTitle(doc, state, "Report Snapshot", "Executive Summary")
  addTwoColumnCards(
    doc,
    state,
    [
      { title: "Key Wins", details: report.executive.wins, tone: "good" },
      { title: "Key Risks", details: report.executive.risks, tone: "risk" },
      { title: "Recommended Focus", details: report.executive.focus },
      { title: "What Changed", details: report.executive.timeline },
    ],
    "Executive Summary",
  )
}

function visibility(doc: jsPDF, report: ReportViewModel, state: PdfState) {
  newPage(doc, state, "Visibility Score Breakdown")
  addParagraph(doc, state, report.visibility.explanation || "Visibility score analysis for this period.", "Visibility Score Breakdown")
  addTwoColumnCards(
    doc,
    state,
    report.visibility.components.map((component) => {
      const score = typeof component.score === "number" ? component.score : Number(component.score) || 0
      return {
        title: `${component.component}: ${component.score}`,
        body: component.raw_value || component.interpretation_signal,
        details: [component.interpretation_signal],
        tone: score >= 70 ? "good" : score >= 45 ? "warn" : "risk",
      }
    }),
    "Visibility Score Breakdown",
  )
}

function modelAnalysis(doc: jsPDF, report: ReportViewModel, state: PdfState) {
  newPage(doc, state, "AI Model Analysis")
  if (report.intelligence.modelSummary || report.intelligence.modelHeadline) {
    addParagraph(doc, state, report.intelligence.modelSummary || report.intelligence.modelHeadline, "AI Model Analysis")
  }
  report.intelligence.models.forEach((model) => {
    addCard(
      doc,
      state,
      `${model.model_label || model.model || "Model"} - ${model.status || "Readout"}`,
      model.summary,
      [
        model.mention_rate !== undefined ? `Mention rate: ${model.mention_rate}%` : "",
        model.mention_rate_delta !== undefined ? `Mention delta: ${model.mention_rate_delta >= 0 ? "+" : ""}${model.mention_rate_delta}` : "",
        model.average_position !== undefined ? `Average position: ${model.average_position}` : "",
        model.top_competitor ? `Top competitor: ${model.top_competitor.name} (${model.top_competitor.mention_rate}%)` : "",
        ...model.strengths.map((item) => `Strength: ${item}`),
        ...model.risks.map((item) => `Risk: ${item}`),
        model.recommended_action ? `Recommended action: ${model.recommended_action}` : "",
      ],
      model.status?.toLowerCase().includes("weak") ? "risk" : "neutral",
      "AI Model Analysis",
    )
  })
}

function promptAnalysis(doc: jsPDF, report: ReportViewModel, state: PdfState) {
  newPage(doc, state, "Prompt Movement Analysis")
  if (report.intelligence.promptRecommendation) {
    addParagraph(doc, state, report.intelligence.promptRecommendation, "Prompt Movement Analysis")
  }
  addTwoColumnCards(
    doc,
    state,
    report.intelligence.prompts.map((prompt) => ({
      title: prompt.prompt || "Prompt",
      body: prompt.summary,
      details: [
        prompt.intent ? `Intent: ${prompt.intent}` : "",
        prompt.current_mention_rate !== undefined ? `Current mention rate: ${prompt.current_mention_rate}%` : "",
        prompt.mention_rate_delta !== undefined ? `Mention delta: ${prompt.mention_rate_delta >= 0 ? "+" : ""}${prompt.mention_rate_delta}%` : "",
        prompt.position_delta !== undefined ? `Position change: ${prompt.position_delta >= 0 ? "+" : ""}${prompt.position_delta}` : "",
        prompt.top_competitor ? `Top competitor: ${prompt.top_competitor.name} (${prompt.top_competitor.mention_rate}%)` : "",
      ],
      tone: prompt.mention_rate_delta !== undefined && prompt.mention_rate_delta < 0 ? "risk" : "neutral",
    })),
    "Prompt Movement Analysis",
  )
}

function competitorAnalysis(doc: jsPDF, report: ReportViewModel, state: PdfState) {
  newPage(doc, state, "Competitor Intelligence")
  if (report.intelligence.competitorTakeaway) {
    addParagraph(doc, state, report.intelligence.competitorTakeaway, "Competitor Intelligence")
  }
  report.intelligence.competitors.forEach((competitor) => {
    addCard(
      doc,
      state,
      `${competitor.competitor || "Competitor"} - ${competitor.threat_level || "Threat"}`,
      competitor.summary,
      [
        competitor.current_mention_rate !== undefined ? `Mention rate: ${competitor.current_mention_rate}%` : "",
        competitor.mention_rate_delta !== undefined ? `Mention delta: ${competitor.mention_rate_delta >= 0 ? "+" : ""}${competitor.mention_rate_delta}` : "",
        competitor.current_average_position !== undefined ? `Average position: ${competitor.current_average_position}` : "",
        competitor.prompts_won_against_brand !== undefined ? `Prompts won against brand: ${competitor.prompts_won_against_brand}` : "",
        ...competitor.why_they_are_winning.map((item) => `Why they are winning: ${item}`),
        competitor.recommended_response ? `Recommended response: ${competitor.recommended_response}` : "",
      ],
      "risk",
      "Competitor Intelligence",
    )
  })
}

function sourcesAndSentiment(doc: jsPDF, report: ReportViewModel, state: PdfState) {
  newPage(doc, state, "Sources, Citations & Sentiment")
  if (report.intelligence.sourceSummary || report.intelligence.sourceInsight) {
    addParagraph(doc, state, report.intelligence.sourceSummary || report.intelligence.sourceInsight, "Sources, Citations & Sentiment")
  }
  addTwoColumnCards(
    doc,
    state,
    report.intelligence.sources.map((source) => ({
      title: source.domain,
      body: `${source.citations} citations, ${source.delta >= 0 ? "+" : ""}${source.delta} change, ${source.url_type || "source"}`,
      details: source.mentioned_competitors.slice(0, 3).map((item) => `Mentions competitor: ${item}`),
    })),
    "Sources, Citations & Sentiment",
  )

  ensure(doc, state, 70, "Sources, Citations & Sentiment")
  addSectionTitle(doc, state, "Sentiment & Positioning", "Sources, Citations & Sentiment")
  addCard(doc, state, "Sentiment Readout", report.intelligence.sentimentReadout, report.intelligence.sentiment, "good", "Sources, Citations & Sentiment")

  if (report.leaderboard.length > 0) {
    ensure(doc, state, 88, "Sources, Citations & Sentiment")
    addSectionTitle(doc, state, "Share of Voice Leaderboard", "Sources, Citations & Sentiment")
    addTwoColumnCards(
      doc,
      state,
      report.leaderboard.map((entry) => ({
        title: `#${entry.rank} ${entry.name}`,
        body: `${entry.mention_rate}% mention rate`,
        details: [`Type: ${entry.type}`, `Delta: ${entry.delta >= 0 ? "+" : ""}${entry.delta}`],
        tone: entry.type === "brand" || entry.type === "own_brand" ? "good" : "neutral",
      })),
      "Sources, Citations & Sentiment",
    )
  }
}

function recommendations(doc: jsPDF, report: ReportViewModel, state: PdfState) {
  newPage(doc, state, "Recommendations & Content Plan")
  if (report.recommendations.opportunityTheme || report.recommendations.content) {
    addParagraph(doc, state, report.recommendations.opportunityTheme || report.recommendations.content, "Recommendations & Content Plan")
  }
  addTwoColumnCards(
    doc,
    state,
    [
      { title: "Priority Actions", details: report.recommendations.priority, tone: "risk" },
      { title: "Quick Wins", details: report.recommendations.quickWins, tone: "good" },
      { title: "Source Actions", details: report.recommendations.sourceActions },
      { title: "Long-Term Strategy", details: report.recommendations.longTerm },
    ],
    "Recommendations & Content Plan",
  )

  if (report.recommendations.analytics) {
    addCard(doc, state, "Web Analytics Action", report.recommendations.analytics, [], "neutral", "Recommendations & Content Plan")
  }

  if (report.recommendations.contentSequence.length > 0) {
    addSectionTitle(doc, state, "Content Sequence", "Recommendations & Content Plan")
    addTwoColumnCards(
      doc,
      state,
      report.recommendations.contentSequence.map((item) => ({
        title: item.suggested_title || item.title || "Content asset",
        body: item.priority_reason || item.body || item.content_type || "",
        details: [item.theme ? `Theme: ${item.theme}` : "", item.content_type ? `Type: ${item.content_type.replace(/_/g, " ")}` : ""],
      })),
      "Recommendations & Content Plan",
    )
  }
}

export function exportReportPdf(report: ReportViewModel) {
  const data = createExportData(report)
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" })
  const state: PdfState = {
    y: PAGE.top,
    period: data.period,
    title: data.title,
  }

  cover(doc, report, state)
  visibility(doc, report, state)
  modelAnalysis(doc, report, state)
  promptAnalysis(doc, report, state)
  competitorAnalysis(doc, report, state)
  sourcesAndSentiment(doc, report, state)
  recommendations(doc, report, state)

  doc.setProperties({
    title: data.title,
    subject: data.subtitle,
    author: "PromptPulse",
    creator: "PromptPulse",
  })
  doc.save(`${data.fileName}.pdf`)
}
