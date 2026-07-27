import type PptxGenJS from "pptxgenjs"
import type { OverviewPptxModel } from "../overviewPptxTypes"
import { addOverviewBackground, addOverviewCard, addOverviewFooter, addOverviewHeader, addOverviewMetric, addOverviewTable } from "../overviewPptxHelpers"
import { OVERVIEW_PPTX as T } from "../overviewPptxTheme"

export function addOverviewSourcesSlide(pptx: PptxGenJS, model: OverviewPptxModel) {
  const slide = pptx.addSlide()
  addOverviewBackground(slide)
  addOverviewHeader(slide, "Authority intelligence", "Source influence and citation gaps", "The domains shaping AI answers, their source category, and whether structured evidence confirms the brand.")

  const confirmed = model.sources.filter(source => source.brandPresence === "CONFIRMED").length
  addOverviewMetric(slide, 0.65, 1.72, 2.35, "Source domains", String(model.sources.length), "Measured in this report")
  addOverviewMetric(slide, 3.15, 1.72, 2.35, "Brand confirmed", String(confirmed), "Structured source evidence", T.colors.mint)
  addOverviewMetric(slide, 5.65, 1.72, 2.35, "Presence gaps", String(model.sources.length - confirmed), "No confirmed brand presence", T.colors.amber)

  addOverviewCard(slide, 0.65, 3.02, 8.15, 3.55)
  slide.addText("HIGHEST-INFLUENCE DOMAINS", { x: 0.92, y: 3.28, w: 3.1, h: 0.16, fontFace: T.font, fontSize: 8, bold: true, color: T.colors.blue, margin: 0 })
  addOverviewTable(slide, [
    ["DOMAIN", "USED", "TYPE", "CITATIONS", "BRAND"],
    ...model.sources.slice(0, 7).map(row => [
      row.domain,
      `${row.usedPct.toFixed(1)}%`,
      row.sourceType,
      row.citations,
      row.brandPresence === "CONFIRMED" ? "CONFIRMED" : "GAP",
    ]),
  ], 0.92, 3.63, 7.6, 2.45, [2.45, 0.75, 1.3, 1.05, 1.35])

  addOverviewCard(slide, 9.05, 1.72, 3.65, 4.85)
  slide.addText("SOURCE MIX", { x: 9.32, y: 2.02, w: 2.4, h: 0.16, fontFace: T.font, fontSize: 8, bold: true, color: T.colors.blue, margin: 0 })
  model.sourceTypes.slice(0, 6).forEach((source, index) => {
    const y = 2.48 + index * 0.56
    slide.addText(source.sourceType, { x: 9.32, y, w: 1.7, h: 0.2, fontFace: T.font, fontSize: 9, bold: true, color: T.colors.text, margin: 0, fit: "shrink" })
    slide.addText(`${source.citations} citations`, { x: 11.12, y, w: 1.2, h: 0.2, fontFace: T.font, fontSize: 8, color: T.colors.muted, margin: 0, align: "right" })
    slide.addShape("rect", { x: 9.32, y: y + 0.28, w: 2.95, h: 0.1, fill: { color: T.colors.border }, line: { color: T.colors.border } })
    const max = Math.max(1, ...model.sourceTypes.map(item => item.citations))
    slide.addShape("rect", { x: 9.32, y: y + 0.28, w: 2.95 * source.citations / max, h: 0.1, fill: { color: T.colors.sky }, line: { color: T.colors.sky } })
  })
  const gap = model.sources.find(source => source.brandPresence === "NOT_CONFIRMED")
  if (gap) {
    slide.addShape("roundRect", { x: 9.32, y: 5.98, w: 2.95, h: 0.38, fill: { color: T.colors.softAmber }, line: { color: "FED7AA" } })
    slide.addText(`Next move: establish presence on ${gap.domain}`, { x: 9.48, y: 6.1, w: 2.62, h: 0.14, fontFace: T.font, fontSize: 7.5, bold: true, color: T.colors.amber, margin: 0, fit: "shrink" })
  }
  addOverviewFooter(slide, model.brandName, model.periodLabel)
}
