import type PptxGenJS from "pptxgenjs"
import type { OverviewPptxModel } from "../overviewPptxTypes"
import { addOverviewBackground, addOverviewCard, addOverviewFooter, addOverviewHeader, addOverviewTable } from "../overviewPptxHelpers"
import { OVERVIEW_PPTX as T } from "../overviewPptxTheme"

export function addOverviewPerformanceSlides(pptx: PptxGenJS, model: OverviewPptxModel) {
  const slide = pptx.addSlide()
  addOverviewBackground(slide)
  addOverviewHeader(slide, "Performance", "Visibility trend and engine performance", "Where visibility is moving and which AI engines are strengthening or weakening the brand.")

  addOverviewCard(slide, 0.65, 1.76, 7.65, 4.85)
  if (model.trend.length > 1) {
    slide.addChart(pptx.ChartType.line, [{
      name: "Visibility",
      labels: model.trend.map(point => point.date.slice(5)),
      values: model.trend.map(point => point.visibility),
    }], {
      x: 0.93, y: 2.14, w: 7.08, h: 3.9,
      showLegend: false,
      showTitle: false,
      showValue: false,
      catAxisLabelFontFace: T.font,
      catAxisLabelFontSize: 8,
      valAxisLabelFontFace: T.font,
      valAxisLabelFontSize: 8,
      valAxisMinVal: 0,
      valAxisMaxVal: 100,
      valGridLine: { color: T.colors.border },
      chartColors: [T.colors.blue],
      lineSize: 2.5,
    })
  } else {
    slide.addText("More than one measured day is needed to show a trend.", { x: 1.35, y: 3.7, w: 5.8, h: 0.3, fontFace: T.font, fontSize: 12, color: T.colors.muted, align: "center", margin: 0 })
  }

  addOverviewCard(slide, 8.55, 1.76, 4.15, 4.85)
  slide.addText("ENGINE SCORECARD", { x: 8.82, y: 2.02, w: 2.7, h: 0.16, fontFace: T.font, fontSize: 8, bold: true, color: T.colors.blue, margin: 0 })
  const rows = [
    ["ENGINE", "VIS.", "POSITION"],
    ...model.engines.slice(0, 7).map(row => [row.engine, `${row.visibility.toFixed(1)}%`, row.position === null ? "—" : `#${row.position.toFixed(1)}`]),
  ]
  addOverviewTable(slide, rows, 8.82, 2.4, 3.6, 3.15, [1.6, 0.95, 1.05])
  const weakest = [...model.engines].sort((a, b) => a.visibility - b.visibility)[0]
  if (weakest) {
    slide.addShape("roundRect", { x: 8.82, y: 5.76, w: 3.6, h: 0.56, fill: { color: T.colors.softAmber }, line: { color: "FED7AA" } })
    slide.addText(`${weakest.engine} is the largest engine gap at ${weakest.visibility.toFixed(1)}%.`, { x: 9.02, y: 5.94, w: 3.2, h: 0.18, fontFace: T.font, fontSize: 8.3, bold: true, color: T.colors.amber, margin: 0, fit: "shrink" })
  }
  addOverviewFooter(slide, model.brandName, model.periodLabel)
}
