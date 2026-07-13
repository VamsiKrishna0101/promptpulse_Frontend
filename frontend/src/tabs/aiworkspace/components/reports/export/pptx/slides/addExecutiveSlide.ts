import type PptxGenJS from "pptxgenjs"
import type { ReportViewModel } from "../../../utils/reportMapper"
import type { ExportReportData } from "../../reportExportData"
import { addBackground, addBullets, addEyebrow, addFooter, addSectionCard } from "../pptxHelpers"
import { bodyText, PPTX, slideTitle } from "../pptxTheme"

export function addExecutiveSlide(pptx: PptxGenJS, report: ReportViewModel, data: ExportReportData) {
  const slide = pptx.addSlide()
  addBackground(slide)
  addEyebrow(slide, "What changed", 0.65, 0.58)
  slide.addText("Executive Summary", { ...slideTitle, x: 0.65, y: 0.88, w: 6, h: 0.42 })
  slide.addText(report.summary, {
    ...bodyText,
    x: 0.67,
    y: 1.48,
    w: 7.2,
    h: 0.72,
    fontSize: 12,
    color: PPTX.colors.ink,
  })

  if (report.executive.timeline.length > 0) {
    addBullets(slide, report.executive.timeline, 0.72, 2.45, 6.95, 5)
  }

  addSectionCard(slide, "Key Wins", report.executive.wins, 8.15, 0.72, 4.45, 1.72, "good")
  addSectionCard(slide, "Key Risks", report.executive.risks, 8.15, 2.72, 4.45, 1.72, "risk")
  addSectionCard(slide, "Recommended Focus", report.executive.focus, 8.15, 4.72, 4.45, 1.72)
  addFooter(slide, data.period)
}
