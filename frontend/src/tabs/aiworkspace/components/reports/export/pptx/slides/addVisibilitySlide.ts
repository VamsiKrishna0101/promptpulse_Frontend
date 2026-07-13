import type PptxGenJS from "pptxgenjs"
import type { ReportViewModel } from "../../../utils/reportMapper"
import type { ExportReportData } from "../../reportExportData"
import { addBackground, addCard, addEyebrow, addFooter } from "../pptxHelpers"
import { bodyText, PPTX, slideTitle } from "../pptxTheme"

function scoreTone(score: number) {
  if (score >= 70) return { fill: PPTX.colors.greenSoft, color: PPTX.colors.green, label: "Strong" }
  if (score >= 45) return { fill: PPTX.colors.amberSoft, color: PPTX.colors.amber, label: "Needs attention" }
  return { fill: PPTX.colors.redSoft, color: PPTX.colors.red, label: "Weak" }
}

export function addVisibilitySlide(pptx: PptxGenJS, report: ReportViewModel, data: ExportReportData) {
  const slide = pptx.addSlide()
  addBackground(slide)
  addEyebrow(slide, "Score drivers", 0.65, 0.58)
  slide.addText("Visibility Score", { ...slideTitle, x: 0.65, y: 0.88, w: 5.5, h: 0.42 })
  slide.addText(report.visibility.explanation || "Visibility score analysis for this reporting period.", {
    ...bodyText,
    x: 0.67,
    y: 1.43,
    w: 11.5,
    h: 0.48,
    fontSize: 11.5,
  })

  report.visibility.components.slice(0, 6).forEach((component, index) => {
    const x = 0.65 + (index % 3) * 4.08
    const y = 2.2 + Math.floor(index / 3) * 1.72
    const numericScore = typeof component.score === "number" ? component.score : Number(component.score) || 0
    const tone = scoreTone(numericScore)
    addCard(slide, x, y, 3.75, 1.38, tone.fill)
    slide.addText(component.component, {
      x: x + 0.2,
      y: y + 0.18,
      w: 2.15,
      h: 0.22,
      fontFace: PPTX.font,
      fontSize: 10,
      bold: true,
      color: PPTX.colors.ink,
      margin: 0,
      fit: "shrink",
    })
    slide.addText(tone.label, {
      x: x + 2.55,
      y: y + 0.18,
      w: 0.82,
      h: 0.16,
      fontFace: PPTX.font,
      fontSize: 7,
      bold: true,
      color: tone.color,
      align: "right",
      margin: 0,
      fit: "shrink",
    })
    slide.addText(String(component.score), {
      x: x + 0.2,
      y: y + 0.5,
      w: 0.9,
      h: 0.32,
      fontFace: PPTX.font,
      fontSize: 20,
      bold: true,
      color: tone.color,
      margin: 0,
    })
    slide.addText(component.raw_value || component.interpretation_signal, {
      ...bodyText,
      x: x + 1.02,
      y: y + 0.55,
      w: 2.45,
      h: 0.24,
      fontSize: 8.5,
      color: PPTX.colors.ink,
    })
    slide.addText(component.interpretation_signal, {
      ...bodyText,
      x: x + 0.2,
      y: y + 0.96,
      w: 3.25,
      h: 0.26,
      fontSize: 8.5,
    })
  })

  addFooter(slide, data.period)
}
