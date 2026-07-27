import type PptxGenJS from "pptxgenjs"
import type { EnterpriseReportModel } from "../../enterprise/enterpriseReportModel"
import { addBackground, addCard, addEyebrow, addFooter, addBullets } from "../pptxHelpers"
import { bodyText, PPTX, slideTitle } from "../pptxTheme"

export function addMethodologySlide(pptx: PptxGenJS, model: EnterpriseReportModel) {
  const slide = pptx.addSlide()
  addBackground(slide)
  addEyebrow(slide, "How to read this report", 0.65, 0.58)
  slide.addText("Methodology and coverage", { ...slideTitle, x: 0.65, y: 0.88, w: 7.5, h: 0.42 })
  slide.addText(model.methodology, {
    ...bodyText,
    x: 0.67,
    y: 1.48,
    w: 7.2,
    h: 0.85,
    fontSize: 12,
    color: PPTX.colors.ink,
  })

  addCard(slide, 8.2, 0.82, 4.45, 4.7, PPTX.colors.white)
  slide.addText("Report standards", {
    x: 8.55,
    y: 1.16,
    w: 3.75,
    h: 0.3,
    fontFace: PPTX.font,
    fontSize: 16,
    bold: true,
    color: PPTX.colors.ink,
    margin: 0,
  })
  addBullets(
    slide,
    [
      "Scores reflect the selected reporting period.",
      "Position and mention metrics depend on successful runs.",
      "Source influence is based on observed citations and references.",
      "Recommendations are prioritized by the available evidence.",
      "Missing data is shown as unavailable rather than estimated.",
    ],
    8.58,
    1.85,
    3.45,
    5,
  )

  slide.addText(`Generated ${new Date(model.generatedAt).toLocaleDateString()}`, {
    ...bodyText,
    x: 0.67,
    y: 5.85,
    w: 4,
    h: 0.25,
    fontSize: 9,
  })
  addFooter(slide, model.data.period)
}
