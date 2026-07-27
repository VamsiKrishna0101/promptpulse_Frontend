import type PptxGenJS from "pptxgenjs"
import type { OverviewPptxModel } from "../overviewPptxTypes"
import { addOverviewBackground, addOverviewCard, addOverviewFooter, addOverviewHeader, addOverviewTable } from "../overviewPptxHelpers"
import { OVERVIEW_PPTX as T } from "../overviewPptxTheme"

export function addOverviewCompetitionSlide(pptx: PptxGenJS, model: OverviewPptxModel) {
  const slide = pptx.addSlide()
  addOverviewBackground(slide)
  addOverviewHeader(slide, "Competitive intelligence", "Share of AI visibility", "How often each brand appears, where it ranks, and the distance from the closest measured competitor.")

  const own = model.brands.find(brand => brand.isOwnBrand)
  const competitor = model.brands.find(brand => !brand.isOwnBrand)
  if (own && competitor) {
    const gap = own.visibility - competitor.visibility
    addOverviewCard(slide, 0.65, 1.72, 4.15, 1.08, gap >= 0 ? T.colors.softMint : T.colors.softAmber)
    slide.addText(gap >= 0 ? "CURRENT LEAD" : "CURRENT DEFICIT", { x: 0.9, y: 1.96, w: 1.7, h: 0.14, fontFace: T.font, fontSize: 7.5, bold: true, color: gap >= 0 ? T.colors.green : T.colors.amber, margin: 0 })
    slide.addText(`${Math.abs(gap).toFixed(1)} pts`, { x: 0.9, y: 2.18, w: 1.4, h: 0.32, fontFace: T.font, fontSize: 21, bold: true, color: T.colors.ink, margin: 0 })
    slide.addText(`${model.brandName} vs ${competitor.brand}`, { x: 2.35, y: 2.2, w: 2.15, h: 0.24, fontFace: T.font, fontSize: 10, color: T.colors.text, margin: 0, fit: "shrink" })
  }

  addOverviewCard(slide, 0.65, 3.05, 7.35, 3.52)
  slide.addChart(pptx.ChartType.bar, [{
    name: "Visibility",
    labels: model.brands.slice(0, 8).map(row => row.brand),
    values: model.brands.slice(0, 8).map(row => row.visibility),
  }], {
    x: 0.9, y: 3.35, w: 6.85, h: 2.85,
    catAxisLabelFontFace: T.font,
    catAxisLabelFontSize: 8,
    valAxisLabelFontFace: T.font,
    valAxisLabelFontSize: 8,
    valAxisMinVal: 0,
    valAxisMaxVal: 100,
    valGridLine: { color: T.colors.border },
    chartColors: [T.colors.blue],
    showLegend: false,
    showTitle: false,
    showValue: true,
    dataLabelPosition: "outEnd",
  })

  addOverviewCard(slide, 8.25, 1.72, 4.45, 4.85)
  slide.addText("COMPETITIVE BENCHMARK", { x: 8.52, y: 2.02, w: 3.2, h: 0.16, fontFace: T.font, fontSize: 8, bold: true, color: T.colors.blue, margin: 0 })
  addOverviewTable(slide, [
    ["BRAND", "VIS.", "POS.", "SENT."],
    ...model.brands.slice(0, 8).map(row => [
      row.brand,
      `${row.visibility.toFixed(1)}%`,
      row.position === null ? "—" : `#${row.position.toFixed(1)}`,
      row.sentiment === null ? "—" : row.sentiment.toFixed(1),
    ]),
  ], 8.52, 2.4, 3.9, 3.55, [1.65, 0.8, 0.7, 0.75])
  addOverviewFooter(slide, model.brandName, model.periodLabel)
}
