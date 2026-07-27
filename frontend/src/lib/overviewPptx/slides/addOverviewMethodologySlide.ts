import type PptxGenJS from "pptxgenjs"
import type { OverviewPptxModel } from "../overviewPptxTypes"
import { addOverviewBackground, addOverviewCard, addOverviewFooter, addOverviewHeader, addOverviewMetric } from "../overviewPptxHelpers"
import { OVERVIEW_PPTX as T } from "../overviewPptxTheme"

export function addOverviewMethodologySlide(pptx: PptxGenJS, model: OverviewPptxModel) {
  const slide = pptx.addSlide()
  addOverviewBackground(slide)
  addOverviewHeader(slide, "Reliability", "Coverage and methodology", "The measured evidence behind this presentation and the rules used to prevent unsupported conclusions.")

  addOverviewMetric(slide, 0.65, 1.72, 2.25, "Prompts represented", String(model.coverage.representedPrompts), "Included response set")
  addOverviewMetric(slide, 3.05, 1.72, 2.25, "Responses", String(model.coverage.responses), "After active filters")
  addOverviewMetric(slide, 5.45, 1.72, 2.25, "Successful runs", String(model.coverage.successfulRuns), "Completed visibility runs", T.colors.mint)
  addOverviewMetric(slide, 7.85, 1.72, 2.25, "Failed checks", String(model.coverage.failedJobs), "Require review", model.coverage.failedJobs ? T.colors.amber : T.colors.sky)

  addOverviewCard(slide, 0.65, 3.08, 12.05, 3.48)
  slide.addText("HOW TO INTERPRET THIS REPORT", { x: 0.95, y: 3.38, w: 3.5, h: 0.16, fontFace: T.font, fontSize: 8, bold: true, color: T.colors.blue, margin: 0 })
  model.methodology.slice(0, 6).forEach((item, index) => {
    const column = index % 2
    const row = Math.floor(index / 2)
    const x = 0.98 + column * 5.85
    const y = 3.83 + row * 0.79
    slide.addShape("ellipse", { x, y: y + 0.05, w: 0.1, h: 0.1, fill: { color: index < 2 ? T.colors.blue : T.colors.sky }, line: { color: index < 2 ? T.colors.blue : T.colors.sky } })
    slide.addText(item, { x: x + 0.2, y, w: 5.35, h: 0.52, fontFace: T.font, fontSize: 8.7, color: T.colors.text, margin: 0, fit: "shrink" })
  })
  addOverviewFooter(slide, model.brandName, model.periodLabel)
}
