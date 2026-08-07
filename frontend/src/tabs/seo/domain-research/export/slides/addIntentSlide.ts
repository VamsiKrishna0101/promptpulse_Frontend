import type PptxGenJS from "pptxgenjs"
import type { DomainResearchData } from "../../hooks/useDomainResearch"
import { addCard, addChartEmptyState, addInsight, addSlideHeader, CONTENT_W, MARGIN_X, THEME, formatCompactNum, formatMoneyValue } from "./slideHelpers"

export function addIntentSlide(pptx: PptxGenJS, data: DomainResearchData) {
  const slide = pptx.addSlide()
  const bodyY = addSlideHeader(slide, "Search intent", "The keyword portfolio needs both demand capture and conversion content", "Intent is derived from the tracked organic keyword set.")
  const counts = new Map<string, { count: number; volume: number }>()
  for (const keyword of data.organicKeywords.keywords) {
    const raw = (keyword.intent || "Informational").toLowerCase()
    const intent = raw.includes("comm") ? "Commercial" : raw.includes("trans") ? "Transactional" : raw.includes("nav") ? "Navigational" : "Informational"
    const current = counts.get(intent) || { count: 0, volume: 0 }
    current.count += 1
    current.volume += keyword.searchVolume || 0
    counts.set(intent, current)
  }
  const entries = [...counts.entries()].sort((a, b) => b[1].volume - a[1].volume)
  addCard(slide, MARGIN_X, bodyY, 6.4, 4.65)
  slide.addText("SEARCH DEMAND BY INTENT", { x: MARGIN_X + 0.25, y: bodyY + 0.22, w: 3.5, h: 0.18, fontFace: THEME.font, fontSize: 8.5, bold: true, color: THEME.colors.accent, charSpacing: 1, margin: 0 })
  if (entries.length) {
    slide.addChart(pptx.ChartType.doughnut, [{ name: "Search volume", labels: entries.map(([label]) => label), values: entries.map(([, value]) => value) }], {
      x: MARGIN_X + 0.6, y: bodyY + 0.65, w: 3.2, h: 3.35,
      showLegend: true, legendPos: "r", legendFontFace: THEME.font, legendFontSize: 9,
      chartColors: [THEME.colors.blue, THEME.colors.emerald, THEME.colors.accent, THEME.colors.purple],
      showTitle: false, holeSize: 62, showValue: false,
    })
    slide.addText(entries.map(([intent, value]) => `${intent}: ${value.count} keywords · ${formatCompactNum(value.volume)} monthly volume`).join("\n"), { x: MARGIN_X + 3.72, y: bodyY + 1.05, w: 2.25, h: 2.8, fontFace: THEME.font, fontSize: 10, color: THEME.colors.textSecondary, margin: 0, breakLine: false, fit: "shrink", valign: "middle" })
  } else {
    addChartEmptyState(slide, MARGIN_X + 0.4, bodyY + 0.7, 5.6, 3.4, "No keyword intent data was returned.")
  }

  const rightX = MARGIN_X + 6.75
  const rightW = CONTENT_W - 6.75
  addCard(slide, rightX, bodyY, rightW, 2.25, THEME.colors.purpleBg)
  slide.addText("COMMERCIAL VALUE", { x: rightX + 0.25, y: bodyY + 0.22, w: rightW - 0.5, h: 0.18, fontFace: THEME.font, fontSize: 8.5, bold: true, color: THEME.colors.purple, charSpacing: 1, margin: 0 })
  const commercial = entries.find(([label]) => label === "Commercial" || label === "Transactional")
  slide.addText(formatMoneyValue(commercial ? commercial[1].volume : null), { x: rightX + 0.25, y: bodyY + 0.62, w: rightW - 0.5, h: 0.5, fontFace: THEME.font, fontSize: 24, bold: true, color: THEME.colors.textPrimary, margin: 0 })
  slide.addText("monthly demand in commercial / transactional intent", { x: rightX + 0.25, y: bodyY + 1.18, w: rightW - 0.5, h: 0.25, fontFace: THEME.font, fontSize: 9.5, color: THEME.colors.textSecondary, margin: 0, fit: "shrink" })
  addInsight(slide, rightX, bodyY + 2.55, rightW, commercial ? "Prioritize landing pages, comparison content, and conversion-focused internal links around these terms." : "Add intent classification to the next keyword refresh to identify conversion opportunities.", THEME.colors.blueBg, "1E3A8A")
  addInsight(slide, rightX, bodyY + 3.35, rightW, `The tracked set contains ${formatCompactNum(data.organicKeywords.summary.returnedKeywords)} returned keywords for this domain snapshot.`, THEME.colors.emeraldBg, "065F46")
}
