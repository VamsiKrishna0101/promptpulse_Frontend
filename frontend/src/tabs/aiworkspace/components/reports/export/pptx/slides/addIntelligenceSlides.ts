import type PptxGenJS from "pptxgenjs"
import type { ReportViewModel } from "../../../utils/reportMapper"
import type { ExportReportData } from "../../reportExportData"
import { addBackground, addBullets, addCard, addEyebrow, addFooter, addSectionCard } from "../pptxHelpers"
import { bodyText, PPTX, slideTitle } from "../pptxTheme"

export function addModelPromptSlide(pptx: PptxGenJS, report: ReportViewModel, data: ExportReportData) {
  const slide = pptx.addSlide()
  addBackground(slide)
  addEyebrow(slide, "Model and prompt intelligence", 0.65, 0.58)
  slide.addText("Where AI Engines Moved", { ...slideTitle, x: 0.65, y: 0.88, w: 7, h: 0.42 })
  slide.addText(report.intelligence.modelSummary || report.intelligence.promptRecommendation, {
    ...bodyText,
    x: 0.67,
    y: 1.43,
    w: 11.4,
    h: 0.45,
    fontSize: 11.5,
  })

  addSectionCard(
    slide,
    "Model Readout",
    report.intelligence.models.map((model) => `${model.model}: ${model.summary || model.recommended_action}`),
    0.65,
    2.2,
    5.95,
    3.95,
  )
  addSectionCard(
    slide,
    "Prompt Movement",
    report.intelligence.prompts.map((prompt) => `${prompt.prompt}: ${prompt.summary}`),
    6.9,
    2.2,
    5.75,
    3.95,
    "risk",
  )
  addFooter(slide, data.period)
}

export function addCompetitorSourceSlide(pptx: PptxGenJS, report: ReportViewModel, data: ExportReportData) {
  const slide = pptx.addSlide()
  addBackground(slide)
  addEyebrow(slide, "Competitive and source signals", 0.65, 0.58)
  slide.addText("Threats, Citations, and Sources", { ...slideTitle, x: 0.65, y: 0.88, w: 7.5, h: 0.42 })

  addCard(slide, 0.65, 1.48, 5.95, 0.78)
  slide.addText(report.intelligence.competitorTakeaway || "Competitor movement analysis.", {
    ...bodyText,
    x: 0.9,
    y: 1.7,
    w: 5.45,
    h: 0.28,
    fontSize: 10,
    color: PPTX.colors.ink,
  })

  addCard(slide, 6.9, 1.48, 5.75, 0.78)
  slide.addText(report.intelligence.sourceSummary || report.intelligence.sourceInsight || "Source citation analysis.", {
    ...bodyText,
    x: 7.15,
    y: 1.7,
    w: 5.25,
    h: 0.28,
    fontSize: 10,
    color: PPTX.colors.ink,
  })

  addSectionCard(
    slide,
    "Competitor Threats",
    report.intelligence.competitors.map((item) => `${item.competitor}: ${item.summary || item.recommended_response}`),
    0.65,
    2.55,
    5.95,
    3.55,
    "risk",
  )
  addSectionCard(
    slide,
    "Top Cited Sources",
    report.intelligence.sources.map((source) => `${source.domain}: ${source.citations} citations (${source.delta >= 0 ? "+" : ""}${source.delta})`),
    6.9,
    2.55,
    5.75,
    3.55,
  )

  if (report.intelligence.sentiment.length > 0) {
    addBullets(slide, report.intelligence.sentiment, 0.75, 6.3, 11.3, 2)
  }

  addFooter(slide, data.period)
}
