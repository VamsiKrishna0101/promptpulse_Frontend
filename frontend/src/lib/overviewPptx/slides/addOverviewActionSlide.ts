import type PptxGenJS from "pptxgenjs"
import type { OverviewPptxModel } from "../overviewPptxTypes"
import { addOverviewBackground, addOverviewCard, addOverviewFooter, addOverviewHeader } from "../overviewPptxHelpers"
import { OVERVIEW_PPTX as T } from "../overviewPptxTheme"

const horizon = { NOW: "0–30 DAYS", NEXT: "31–60 DAYS", LATER: "61–90 DAYS" } as const

export function addOverviewActionSlide(pptx: PptxGenJS, model: OverviewPptxModel) {
  const slide = pptx.addSlide()
  addOverviewBackground(slide)
  addOverviewHeader(slide, "Activation roadmap", "Prioritized 30/60/90-day action plan", "Concrete work orders connected to measured prompts, engines, competitors, and source evidence.")

  model.actions.slice(0, 6).forEach((item, index) => {
    const x = 0.65 + (index % 2) * 6.1
    const y = 1.72 + Math.floor(index / 2) * 1.72
    addOverviewCard(slide, x, y, 5.82, 1.45, item.priority === "HIGH" ? T.colors.white : "FBFDFF")
    slide.addShape("roundRect", { x: x + 0.2, y: y + 0.18, w: 0.75, h: 0.22, fill: { color: item.priority === "HIGH" ? T.colors.navy : T.colors.softBlue }, line: { color: item.priority === "HIGH" ? T.colors.navy : T.colors.softBlue } })
    slide.addText(item.priority, { x: x + 0.2, y: y + 0.25, w: 0.75, h: 0.09, fontFace: T.font, fontSize: 6.4, bold: true, color: item.priority === "HIGH" ? T.colors.white : T.colors.blue, align: "center", margin: 0 })
    slide.addText(horizon[item.horizon], { x: x + 1.08, y: y + 0.24, w: 1.1, h: 0.12, fontFace: T.font, fontSize: 7, bold: true, color: T.colors.blue, margin: 0 })
    slide.addText(item.title, { x: x + 0.2, y: y + 0.52, w: 5.38, h: 0.24, fontFace: T.font, fontSize: 11, bold: true, color: T.colors.ink, margin: 0, fit: "shrink" })
    slide.addText(item.action, { x: x + 0.2, y: y + 0.84, w: 3.65, h: 0.4, fontFace: T.font, fontSize: 8.3, color: T.colors.text, margin: 0, fit: "shrink" })
    slide.addText(item.evidence, { x: x + 4.03, y: y + 0.84, w: 1.5, h: 0.4, fontFace: T.font, fontSize: 7.3, color: T.colors.muted, margin: 0, fit: "shrink" })
  })
  addOverviewFooter(slide, model.brandName, model.periodLabel)
}
