import type PptxGenJS from "pptxgenjs"
import type { ReportViewModel } from "../../../utils/reportMapper"
import type { ExportReportData } from "../../reportExportData"
import { addBackground, addCard, addEyebrow, addFooter, addSectionCard } from "../pptxHelpers"
import { bodyText, PPTX, slideTitle } from "../pptxTheme"

export function addRecommendationSlide(pptx: PptxGenJS, report: ReportViewModel, data: ExportReportData) {
  const slide = pptx.addSlide()
  addBackground(slide)
  addEyebrow(slide, "Next best moves", 0.65, 0.58)
  slide.addText("Recommendations", { ...slideTitle, x: 0.65, y: 0.88, w: 6, h: 0.42 })
  slide.addText(report.recommendations.opportunityTheme || report.recommendations.content || "Recommended actions for the next reporting cycle.", {
    ...bodyText,
    x: 0.67,
    y: 1.43,
    w: 11.4,
    h: 0.45,
    fontSize: 11.5,
  })

  addSectionCard(slide, "Priority Actions", report.recommendations.priority, 0.65, 2.16, 3.95, 2.15, "risk")
  addSectionCard(slide, "Quick Wins", report.recommendations.quickWins, 4.85, 2.16, 3.95, 2.15, "good")
  addSectionCard(slide, "Source Actions", report.recommendations.sourceActions, 9.05, 2.16, 3.6, 2.15)

  addCard(slide, 0.65, 4.65, 12, 1.52, "F8FAF9")
  slide.addText("Content Sequence", {
    x: 0.9,
    y: 4.9,
    w: 2.2,
    h: 0.2,
    fontFace: PPTX.font,
    fontSize: 12,
    bold: true,
    color: PPTX.colors.ink,
    margin: 0,
  })
  report.recommendations.contentSequence.slice(0, 3).forEach((item, index) => {
    slide.addText(item.suggested_title || item.title || "Content asset", {
      x: 0.9 + index * 3.9,
      y: 5.32,
      w: 3.35,
      h: 0.26,
      fontFace: PPTX.font,
      fontSize: 9.5,
      bold: true,
      color: PPTX.colors.ink,
      margin: 0,
      fit: "shrink",
    })
    slide.addText(item.priority_reason || item.body || item.content_type || "", {
      ...bodyText,
      x: 0.9 + index * 3.9,
      y: 5.68,
      w: 3.35,
      h: 0.28,
      fontSize: 8.5,
    })
  })

  addFooter(slide, data.period)
}
