import type PptxGenJS from "pptxgenjs"
import type { OverviewPptxModel } from "../overviewPptxTypes"
import { OVERVIEW_PPTX as T } from "../overviewPptxTheme"

export function addOverviewCoverSlide(pptx: PptxGenJS, model: OverviewPptxModel, logoDataUrl: string | null) {
  const slide = pptx.addSlide()
  slide.background = { color: T.colors.navy }
  slide.addShape("arc", { x: 9.3, y: -2.1, w: 6.2, h: 6.2, fill: { color: T.colors.navySoft }, line: { color: T.colors.navySoft } })
  slide.addShape("arc", { x: 10.4, y: 5.5, w: 3.9, h: 3.9, fill: { color: "153B68" }, line: { color: "153B68" } })

  slide.addShape("roundRect", { x: 0.72, y: 0.65, w: 0.76, h: 0.76, fill: { color: T.colors.white }, line: { color: T.colors.white } })
  if (logoDataUrl) {
    slide.addImage({ data: logoDataUrl, x: 0.87, y: 0.8, w: 0.46, h: 0.46, transparency: 0 })
  } else {
    slide.addText(model.brandName.slice(0, 1).toUpperCase(), { x: 0.88, y: 0.82, w: 0.43, h: 0.38, fontFace: T.font, fontSize: 23, bold: true, color: T.colors.navy, align: "center", margin: 0 })
  }

  slide.addText("AI VISIBILITY INTELLIGENCE REPORT", { x: 0.72, y: 1.78, w: 5.8, h: 0.2, fontFace: T.font, fontSize: 9, bold: true, color: "A8D8F5", charSpacing: 1.6, margin: 0 })
  slide.addText(`${model.brandName} visibility report`, { x: 0.72, y: 2.18, w: 8.3, h: 0.72, fontFace: T.font, fontSize: 32, bold: true, color: T.colors.white, margin: 0, fit: "shrink" })
  slide.addText("Executive performance, buyer prompts, competitive position, source influence, and an evidence-led action plan.", { x: 0.74, y: 3.12, w: 7.15, h: 0.62, fontFace: T.font, fontSize: 13, color: "C6D7E9", margin: 0, fit: "shrink" })

  slide.addShape("roundRect", { x: 0.72, y: 4.18, w: 3.1, h: 0.72, fill: { color: "102844" }, line: { color: "102844" } })
  slide.addText("REPORTING PERIOD", { x: 0.94, y: 4.35, w: 2.5, h: 0.14, fontFace: T.font, fontSize: 7.5, bold: true, color: "8EBBE2", margin: 0 })
  slide.addText(model.periodLabel, { x: 0.94, y: 4.57, w: 2.55, h: 0.22, fontFace: T.font, fontSize: 13, bold: true, color: T.colors.white, margin: 0, fit: "shrink" })

  const visibility = model.metrics.find(metric => metric.label === "Brand visibility")?.value ?? 0
  slide.addText("CURRENT VISIBILITY", { x: 0.72, y: 6.2, w: 2.5, h: 0.16, fontFace: T.font, fontSize: 8, bold: true, color: T.colors.sky, margin: 0 })
  slide.addText(`${visibility.toFixed(1)}%`, { x: 0.72, y: 6.45, w: 2.6, h: 0.44, fontFace: T.font, fontSize: 27, bold: true, color: T.colors.white, margin: 0 })
  slide.addText(`Prepared for ${model.brandName}`, { x: 8.2, y: 6.52, w: 3.9, h: 0.2, fontFace: T.font, fontSize: 9, color: "9CB6D0", align: "right", margin: 0 })
  slide.addText("Powered by PromptPulse", { x: 8.2, y: 6.82, w: 3.9, h: 0.18, fontFace: T.font, fontSize: 7.5, color: "9CB6D0", align: "right", margin: 0 })
}
