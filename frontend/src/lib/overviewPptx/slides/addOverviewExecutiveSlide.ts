import type PptxGenJS from "pptxgenjs"
import type { OverviewPptxModel } from "../overviewPptxTypes"
import { addOverviewBackground, addOverviewCard, addOverviewFooter, addOverviewHeader, addOverviewMetric, metricValue } from "../overviewPptxHelpers"
import { OVERVIEW_PPTX as T } from "../overviewPptxTheme"

export function addOverviewExecutiveSlide(pptx: PptxGenJS, model: OverviewPptxModel) {
  const slide = pptx.addSlide()
  addOverviewBackground(slide)
  addOverviewHeader(slide, model.brandName, "Executive brief", `${model.periodLabel}${model.comparisonLabel ? ` · compared with ${model.comparisonLabel.toLowerCase()}` : ""}`)

  model.metrics.slice(0, 5).forEach((metric, index) => {
    const delta = metric.delta === null ? "No comparison" : `${metric.delta > 0 ? "+" : ""}${metric.delta.toFixed(1)} pts`
    addOverviewMetric(slide, 0.65 + index * 2.48, 1.76, 2.25, metric.label, metricValue(metric), delta, index === 1 ? T.colors.mint : T.colors.sky)
  })

  addOverviewCard(slide, 0.65, 3.08, 7.55, 1.05, T.colors.softBlue)
  slide.addText("EXECUTIVE READOUT", { x: 0.9, y: 3.3, w: 2.4, h: 0.16, fontFace: T.font, fontSize: 7.5, bold: true, color: T.colors.blue, margin: 0 })
  slide.addText(model.executiveHeadline, { x: 0.9, y: 3.56, w: 6.95, h: 0.38, fontFace: T.font, fontSize: 15, bold: true, color: T.colors.ink, margin: 0, fit: "shrink" })

  addOverviewCard(slide, 8.48, 3.08, 4.2, 3.55)
  slide.addText("LEADERSHIP PRIORITIES", { x: 8.75, y: 3.34, w: 2.9, h: 0.18, fontFace: T.font, fontSize: 8, bold: true, color: T.colors.blue, margin: 0 })
  model.executivePoints.slice(0, 5).forEach((point, index) => {
    slide.addShape("ellipse", { x: 8.76, y: 3.79 + index * 0.51, w: 0.22, h: 0.22, fill: { color: index === 0 ? T.colors.navy : T.colors.softBlue }, line: { color: index === 0 ? T.colors.navy : T.colors.softBlue } })
    slide.addText(String(index + 1), { x: 8.81, y: 3.84 + index * 0.51, w: 0.12, h: 0.1, fontFace: T.font, fontSize: 6, bold: true, color: index === 0 ? T.colors.white : T.colors.blue, align: "center", margin: 0 })
    slide.addText(point, { x: 9.12, y: 3.76 + index * 0.51, w: 3.18, h: 0.34, fontFace: T.font, fontSize: 8.8, color: T.colors.text, margin: 0, fit: "shrink" })
  })

  addOverviewCard(slide, 0.65, 4.38, 7.55, 2.25)
  slide.addText("SENTIMENT MIX", { x: 0.9, y: 4.64, w: 2.4, h: 0.16, fontFace: T.font, fontSize: 8, bold: true, color: T.colors.blue, margin: 0 })
  const total = Math.max(1, model.sentiment.scoredResponses)
  const mix = [
    { name: "Positive", value: model.sentiment.positive, color: T.colors.green },
    { name: "Neutral", value: model.sentiment.neutral, color: T.colors.sky },
    { name: "Negative", value: model.sentiment.negative, color: T.colors.amber },
  ]
  let x = 0.92
  mix.forEach(item => {
    const width = 6.95 * item.value / total
    if (width > 0) slide.addShape("rect", { x, y: 5.12, w: width, h: 0.28, fill: { color: item.color }, line: { color: item.color } })
    x += width
  })
  mix.forEach((item, index) => {
    slide.addShape("ellipse", { x: 0.94 + index * 2.15, y: 5.77, w: 0.1, h: 0.1, fill: { color: item.color }, line: { color: item.color } })
    slide.addText(`${item.name}  ${item.value}`, { x: 1.1 + index * 2.15, y: 5.7, w: 1.6, h: 0.2, fontFace: T.font, fontSize: 9, bold: true, color: T.colors.text, margin: 0 })
  })
  addOverviewFooter(slide, model.brandName, model.periodLabel)
}
