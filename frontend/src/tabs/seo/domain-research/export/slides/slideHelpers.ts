import type { DomainResearchData } from "../../hooks/useDomainResearch"
import { DOMAIN_EXPORT_THEME as THEME, formatCompactNum, formatMoneyValue, formatPct } from "../types"

export const PAGE_W = 13.333
export const MARGIN_X = 0.8
export const CONTENT_W = PAGE_W - MARGIN_X * 2

export function addSlideHeader(slide: any, kicker: string, title: string, subtitle?: string) {
  slide.background = { color: THEME.colors.slideBg }
  slide.addText(kicker.toUpperCase(), {
    x: MARGIN_X, y: 0.48, w: CONTENT_W, h: 0.22,
    fontFace: THEME.font, fontSize: 9, bold: true, color: THEME.colors.accent,
    charSpacing: 1.5, margin: 0,
  })
  slide.addText(title, {
    x: MARGIN_X, y: 0.75, w: CONTENT_W, h: 0.42,
    fontFace: THEME.font, fontSize: 20, bold: true, color: THEME.colors.textPrimary,
    margin: 0, fit: "shrink",
  })
  if (subtitle) {
    slide.addText(subtitle, {
      x: MARGIN_X, y: 1.2, w: CONTENT_W, h: 0.28,
      fontFace: THEME.font, fontSize: 10, color: THEME.colors.textSecondary,
      margin: 0, fit: "shrink",
    })
  }
  return 1.62
}

export function addCard(slide: any, x: number, y: number, w: number, h: number, fill = THEME.colors.cardBg) {
  slide.addShape("roundRect", {
    x, y, w, h, rectRadius: 0.08,
    fill: { color: fill }, line: { color: THEME.colors.cardBorder, width: 1 },
  })
}

export function addInsight(slide: any, x: number, y: number, w: number, text: string, fill = THEME.colors.blueBg, color = "1E3A8A") {
  addCard(slide, x, y, w, 0.65, fill)
  slide.addText(text, {
    x: x + 0.2, y: y + 0.12, w: w - 0.4, h: 0.4,
    fontFace: THEME.font, fontSize: 10, color, margin: 0,
    valign: "mid", fit: "shrink",
  })
}

export function addChartEmptyState(slide: any, x: number, y: number, w: number, h: number, label: string) {
  slide.addText(label, {
    x, y: y + h / 2 - 0.15, w, h: 0.3,
    fontFace: THEME.font, fontSize: 11, color: THEME.colors.textMuted,
    align: "center", margin: 0,
  })
}

export function addTrendLegend(slide: any, items: Array<{ label: string; color: string }>, x: number, y: number) {
  let cursor = x
  for (const item of items) {
    slide.addShape("ellipse", { x: cursor, y: y + 0.03, w: 0.1, h: 0.1, fill: { color: item.color }, line: { type: "none" } })
    slide.addText(item.label, { x: cursor + 0.16, y, w: 1.25, h: 0.16, fontFace: THEME.font, fontSize: 8.5, color: THEME.colors.textSecondary, margin: 0 })
    cursor += 1.45
  }
}

export function historyLabel(date: string) {
  const value = new Date(date)
  return value.toLocaleString("en-US", { month: "short", year: "2-digit" })
}

export function getTop10Coverage(data: DomainResearchData) {
  const total = data.overview.summary.organic.keywords
  const dist = data.overview.rankingDistribution
  return total > 0 ? (dist.top3 + dist.positions4To10) / total : null
}

export { THEME, formatCompactNum, formatMoneyValue, formatPct }
