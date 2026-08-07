import type PptxGenJS from "pptxgenjs"
import type { DomainResearchData } from "../../hooks/useDomainResearch"
import { addCard, addChartEmptyState, addInsight, addSlideHeader, addTrendLegend, CONTENT_W, MARGIN_X, historyLabel, THEME, formatCompactNum, formatMoneyValue } from "./slideHelpers"

export function addPerformanceSlide(pptx: PptxGenJS, data: DomainResearchData) {
  const slide = pptx.addSlide()
  const bodyY = addSlideHeader(slide, "Organic performance", "Traffic and keyword visibility are moving together", `Monthly history for ${data.overview.target.domain}`)
  const history = [...data.overview.history].sort((a, b) => a.date.localeCompare(b.date))
  const chartW = 7.4
  addCard(slide, MARGIN_X, bodyY, chartW, 4.75)
  slide.addText("ORGANIC TRAFFIC TREND", { x: MARGIN_X + 0.25, y: bodyY + 0.22, w: 3, h: 0.18, fontFace: THEME.font, fontSize: 8.5, bold: true, color: THEME.colors.accent, charSpacing: 1, margin: 0 })
  if (history.length > 1) {
    slide.addChart(pptx.ChartType.line, [
      { name: "Organic traffic", labels: history.map(p => historyLabel(p.date)), values: history.map(p => p.organic.traffic) },
      { name: "Paid traffic", labels: history.map(p => historyLabel(p.date)), values: history.map(p => p.paid.traffic) },
    ], {
      x: MARGIN_X + 0.22, y: bodyY + 0.55, w: chartW - 0.44, h: 3.55,
      showLegend: false, showTitle: false, showValue: false,
      catAxisLabelFontFace: THEME.font, catAxisLabelFontSize: 8,
      valAxisLabelFontFace: THEME.font, valAxisLabelFontSize: 8,
      valGridLine: { color: THEME.colors.cardBorder },
      chartColors: [THEME.colors.blue, THEME.colors.accent], lineSize: 2.5,
    })
    addTrendLegend(slide, [{ label: "Organic traffic", color: THEME.colors.blue }, { label: "Paid traffic", color: THEME.colors.accent }], MARGIN_X + 0.3, bodyY + 4.28)
  } else {
    addChartEmptyState(slide, MARGIN_X + 0.3, bodyY + 0.6, chartW - 0.6, 3.5, "At least two history points are needed to show a trend.")
  }

  const summary = data.overview.summary.organic
  const rightX = MARGIN_X + chartW + 0.35
  const rightW = CONTENT_W - chartW - 0.35
  addCard(slide, rightX, bodyY, rightW, 2.25, THEME.colors.purpleBg)
  slide.addText("CURRENT SEARCH FOOTPRINT", { x: rightX + 0.25, y: bodyY + 0.22, w: rightW - 0.5, h: 0.18, fontFace: THEME.font, fontSize: 8.5, bold: true, color: THEME.colors.purple, charSpacing: 1, margin: 0 })
  slide.addText(formatCompactNum(summary.traffic), { x: rightX + 0.25, y: bodyY + 0.62, w: rightW - 0.5, h: 0.5, fontFace: THEME.font, fontSize: 25, bold: true, color: THEME.colors.textPrimary, margin: 0 })
  slide.addText("estimated organic visits / month", { x: rightX + 0.25, y: bodyY + 1.15, w: rightW - 0.5, h: 0.2, fontFace: THEME.font, fontSize: 9.5, color: THEME.colors.textSecondary, margin: 0 })
  slide.addText(`${formatCompactNum(summary.keywords)} ranking keywords  ·  ${formatMoneyValue(summary.trafficValueUsd)} traffic value`, { x: rightX + 0.25, y: bodyY + 1.62, w: rightW - 0.5, h: 0.35, fontFace: THEME.font, fontSize: 10, color: THEME.colors.textSecondary, margin: 0, fit: "shrink" })

  const last = history.at(-1)
  const first = history[0]
  const change = last && first && first.organic.traffic ? ((last.organic.traffic - first.organic.traffic) / first.organic.traffic) * 100 : null
  addInsight(slide, rightX, bodyY + 2.5, rightW, change == null ? "Trend insight will appear when the report has multiple history points." : `Organic traffic ${change >= 0 ? "grew" : "declined"} ${Math.abs(change).toFixed(1)}% across the selected history.`, change != null && change >= 0 ? THEME.colors.emeraldBg : "FFF1F2", change != null && change >= 0 ? "065F46" : "9F1239")
}
