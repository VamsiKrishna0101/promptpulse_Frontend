import type PptxGenJS from "pptxgenjs"
import type { DomainResearchData } from "../../hooks/useDomainResearch"
import { addCard, addInsight, addSlideHeader, CONTENT_W, MARGIN_X, THEME, formatCompactNum } from "./slideHelpers"

export function addRankingChartSlide(pptx: PptxGenJS, data: DomainResearchData) {
  const slide = pptx.addSlide()
  const bodyY = addSlideHeader(slide, "Ranking health", "Most ranking keywords still sit outside page one", "The position mix shows where content improvements can create the fastest visibility gains.")
  const dist = data.overview.rankingDistribution
  const labels = ["Top 3", "4-10", "11-20", "21-50", "51-100"]
  const values = [dist.top3, dist.positions4To10, dist.positions11To20, dist.positions21To50, dist.positions51To100]
  const colors = [THEME.colors.emerald, THEME.colors.blue, "0D9488", THEME.colors.accent, "E11D48"]

  addCard(slide, MARGIN_X, bodyY, 7.35, 4.7)
  slide.addText("KEYWORDS BY GOOGLE POSITION", { x: MARGIN_X + 0.25, y: bodyY + 0.22, w: 3.6, h: 0.18, fontFace: THEME.font, fontSize: 8.5, bold: true, color: THEME.colors.accent, charSpacing: 1, margin: 0 })
  slide.addChart(pptx.ChartType.bar, values.map((value, index) => ({ name: labels[index], labels: ["Current ranking distribution"], values: [value] })), {
    x: MARGIN_X + 0.32, y: bodyY + 0.62, w: 6.75, h: 3.5,
    catAxisLabelFontFace: THEME.font, catAxisLabelFontSize: 9,
    valAxisLabelFontFace: THEME.font, valAxisLabelFontSize: 8,
    valGridLine: { color: THEME.colors.cardBorder },
    chartColors: colors, showLegend: true, legendFontFace: THEME.font, legendFontSize: 8,
    showTitle: false, showValue: true, dataLabelPosition: "outEnd",
    valAxisMinVal: 0,
  })
  slide.addText("SERP position bands", { x: MARGIN_X + 0.3, y: bodyY + 4.28, w: 2, h: 0.18, fontFace: THEME.font, fontSize: 8.5, color: THEME.colors.textMuted, margin: 0 })

  const total = values.reduce((sum, value) => sum + value, 0)
  const pageOne = dist.top3 + dist.positions4To10
  const opportunity = Math.max(total - pageOne, 0)
  const rightX = MARGIN_X + 7.7
  const rightW = CONTENT_W - 7.7
  addCard(slide, rightX, bodyY, rightW, 2.1, THEME.colors.blueBg)
  slide.addText("PAGE ONE COVERAGE", { x: rightX + 0.25, y: bodyY + 0.24, w: rightW - 0.5, h: 0.18, fontFace: THEME.font, fontSize: 8.5, bold: true, color: THEME.colors.blue, charSpacing: 1, margin: 0 })
  slide.addText(total ? `${((pageOne / total) * 100).toFixed(1)}%` : "-", { x: rightX + 0.25, y: bodyY + 0.62, w: rightW - 0.5, h: 0.52, fontFace: THEME.font, fontSize: 26, bold: true, color: THEME.colors.textPrimary, margin: 0 })
  slide.addText(`${formatCompactNum(pageOne)} of ${formatCompactNum(total)} ranking keywords`, { x: rightX + 0.25, y: bodyY + 1.25, w: rightW - 0.5, h: 0.25, fontFace: THEME.font, fontSize: 9.5, color: THEME.colors.textSecondary, margin: 0, fit: "shrink" })
  addInsight(slide, rightX, bodyY + 2.42, rightW, `${formatCompactNum(opportunity)} keywords are outside page one and represent the largest near-term optimization pool.`, THEME.colors.accentBg, "92400E")
  addInsight(slide, rightX, bodyY + 3.22, rightW, `Visibility gained: +${formatCompactNum(data.overview.changes.new + data.overview.changes.improved)} keywords. At risk: -${formatCompactNum(data.overview.changes.declined + data.overview.changes.lost)} keywords.`, THEME.colors.emeraldBg, "065F46")
}
