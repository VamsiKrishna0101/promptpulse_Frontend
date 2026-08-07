import type PptxGenJS from "pptxgenjs"
import type { DomainResearchData } from "../../hooks/useDomainResearch"
import { addCard, addChartEmptyState, addSlideHeader, CONTENT_W, MARGIN_X, THEME, formatCompactNum } from "./slideHelpers"

export function addLandscapeSlide(pptx: PptxGenJS, data: DomainResearchData) {
  const slide = pptx.addSlide()
  const bodyY = addSlideHeader(slide, "Content landscape", "A small group of pages drives the largest share of organic value", `Top pages for ${data.overview.target.domain}`)
  const pages = [...data.topPages.pages].sort((a, b) => b.estimatedTraffic - a.estimatedTraffic).slice(0, 8)
  addCard(slide, MARGIN_X, bodyY, CONTENT_W, 4.8)
  slide.addText("TOP ORGANIC PAGES BY ESTIMATED TRAFFIC", { x: MARGIN_X + 0.25, y: bodyY + 0.22, w: 4.3, h: 0.18, fontFace: THEME.font, fontSize: 8.5, bold: true, color: THEME.colors.accent, charSpacing: 1, margin: 0 })
  if (pages.length) {
    slide.addChart(pptx.ChartType.bar, [{ name: "Estimated traffic", labels: pages.map(p => p.path || p.url.replace(/^https?:\/\//, "")), values: pages.map(p => p.estimatedTraffic) }], {
      x: MARGIN_X + 0.35, y: bodyY + 0.62, w: CONTENT_W - 0.7, h: 3.65,
      catAxisLabelFontFace: THEME.font, catAxisLabelFontSize: 8,
      valAxisLabelFontFace: THEME.font, valAxisLabelFontSize: 8,
      valGridLine: { color: THEME.colors.cardBorder }, chartColors: [THEME.colors.blue],
      showLegend: false, showTitle: false, showValue: true, dataLabelPosition: "outEnd",
    })
  } else {
    addChartEmptyState(slide, MARGIN_X + 0.5, bodyY + 0.7, CONTENT_W - 1, 3.4, "No top-page data was returned.")
  }
  slide.addText("Traffic concentration helps prioritize refreshes: protect the strongest pages first, then build supporting content around their highest-value topics.", { x: MARGIN_X + 0.35, y: bodyY + 4.28, w: CONTENT_W - 0.7, h: 0.25, fontFace: THEME.font, fontSize: 9.5, color: THEME.colors.textSecondary, margin: 0, fit: "shrink" })
}

export function addCompetitorChartSlide(pptx: PptxGenJS, data: DomainResearchData) {
  const slide = pptx.addSlide()
  const bodyY = addSlideHeader(slide, "Competitive landscape", "Competitors with shared keyword overlap show where the domain is losing demand", "Comparison uses the organic competitor snapshot for the selected market.")
  const competitors = [...data.competitors.competitors].sort((a, b) => b.sharedKeywords - a.sharedKeywords).slice(0, 8)
  addCard(slide, MARGIN_X, bodyY, 7.35, 4.8)
  slide.addText("SHARED KEYWORD UNIVERSE", { x: MARGIN_X + 0.25, y: bodyY + 0.22, w: 3.5, h: 0.18, fontFace: THEME.font, fontSize: 8.5, bold: true, color: THEME.colors.accent, charSpacing: 1, margin: 0 })
  if (competitors.length) {
    slide.addChart(pptx.ChartType.bar, [{ name: "Shared keywords", labels: competitors.map(c => c.domain), values: competitors.map(c => c.sharedKeywords) }], {
      x: MARGIN_X + 0.32, y: bodyY + 0.62, w: 6.75, h: 3.65,
      catAxisLabelFontFace: THEME.font, catAxisLabelFontSize: 8,
      valAxisLabelFontFace: THEME.font, valAxisLabelFontSize: 8,
      valGridLine: { color: THEME.colors.cardBorder }, chartColors: [THEME.colors.purple],
      showLegend: false, showTitle: false, showValue: true, dataLabelPosition: "outEnd",
    })
  } else {
    addChartEmptyState(slide, MARGIN_X + 0.5, bodyY + 0.7, 6.2, 3.4, "No competitor data was returned.")
  }
  const rightX = MARGIN_X + 7.7
  const rightW = CONTENT_W - 7.7
  addCard(slide, rightX, bodyY, rightW, 2.25, THEME.colors.accentBg)
  slide.addText("STRONGEST COMPETITOR", { x: rightX + 0.25, y: bodyY + 0.22, w: rightW - 0.5, h: 0.18, fontFace: THEME.font, fontSize: 8.5, bold: true, color: THEME.colors.accent, charSpacing: 1, margin: 0 })
  slide.addText(data.competitors.summary.strongestCompetitor || "-", { x: rightX + 0.25, y: bodyY + 0.68, w: rightW - 0.5, h: 0.42, fontFace: THEME.font, fontSize: 18, bold: true, color: THEME.colors.textPrimary, margin: 0, fit: "shrink" })
  slide.addText(`${formatCompactNum(data.competitors.summary.sharedKeywordUniverse)} shared keywords in the tracked market`, { x: rightX + 0.25, y: bodyY + 1.3, w: rightW - 0.5, h: 0.35, fontFace: THEME.font, fontSize: 9.5, color: THEME.colors.textSecondary, margin: 0, fit: "shrink" })
  addCard(slide, rightX, bodyY + 2.55, rightW, 2.25, THEME.colors.blueBg)
  slide.addText("HOW TO USE THIS", { x: rightX + 0.25, y: bodyY + 2.8, w: rightW - 0.5, h: 0.18, fontFace: THEME.font, fontSize: 8.5, bold: true, color: THEME.colors.blue, charSpacing: 1, margin: 0 })
  slide.addText("Compare the competitor pages ranking for the shared terms, identify content formats they own, and prioritize gaps where your domain already has topical authority.", { x: rightX + 0.25, y: bodyY + 3.25, w: rightW - 0.5, h: 1.1, fontFace: THEME.font, fontSize: 10.5, color: THEME.colors.textSecondary, margin: 0, lineSpacingMultiple: 1.2, fit: "shrink" })
}
