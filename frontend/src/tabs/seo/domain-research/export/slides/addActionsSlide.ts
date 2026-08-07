import type PptxGenJS from "pptxgenjs"
import type { DomainResearchData } from "../../hooks/useDomainResearch"
import { addCard, addSlideHeader, CONTENT_W, MARGIN_X, THEME, formatCompactNum } from "./slideHelpers"

export function addActionsSlide(pptx: PptxGenJS, data: DomainResearchData) {
  const slide = pptx.addSlide()
  const bodyY = addSlideHeader(slide, "Recommended actions", "Turn the search footprint into the next SEO work queue", "Priorities are ordered by visibility upside and the evidence in this snapshot.")
  const dist = data.overview.rankingDistribution
  const actions = [
    { n: "01", title: "Move page-two keywords onto page one", detail: `Start with ${formatCompactNum(dist.positions11To20)} keywords ranking in positions 11-20. Refresh existing pages before creating net-new content.`, color: THEME.colors.blueBg, accent: THEME.colors.blue },
    { n: "02", title: "Protect the highest-traffic pages", detail: `Audit the top ${Math.min(8, data.topPages.pages.length)} pages for declining terms, internal links, and content freshness before competitors take the demand.`, color: THEME.colors.emeraldBg, accent: THEME.colors.emerald },
    { n: "03", title: "Build against competitor overlap", detail: `Use the shared keyword universe to find missing comparison, commercial, and supporting topic pages.`, color: THEME.colors.purpleBg, accent: THEME.colors.purple },
    { n: "04", title: "Measure movement after publishing", detail: "Re-run the same market snapshot after the next content cycle and compare ranking bands, traffic value, and at-risk keywords.", color: THEME.colors.accentBg, accent: THEME.colors.accent },
  ]
  const gap = 0.18
  const cardH = (5.0 - gap * 3) / 4
  actions.forEach((action, index) => {
    const y = bodyY + index * (cardH + gap)
    addCard(slide, MARGIN_X, y, CONTENT_W, cardH, action.color)
    slide.addShape("ellipse", { x: MARGIN_X + 0.25, y: y + cardH / 2 - 0.2, w: 0.4, h: 0.4, fill: { color: action.accent }, line: { type: "none" } })
    slide.addText(action.n, { x: MARGIN_X + 0.25, y: y + cardH / 2 - 0.2, w: 0.4, h: 0.4, fontFace: THEME.font, fontSize: 10, bold: true, color: THEME.colors.white, align: "center", valign: "middle", margin: 0 })
    slide.addText(action.title, { x: MARGIN_X + 0.85, y: y + 0.16, w: 4.2, h: 0.22, fontFace: THEME.font, fontSize: 12, bold: true, color: THEME.colors.textPrimary, margin: 0, fit: "shrink" })
    slide.addText(action.detail, { x: MARGIN_X + 5.1, y: y + 0.15, w: CONTENT_W - 5.35, h: cardH - 0.3, fontFace: THEME.font, fontSize: 10.5, color: THEME.colors.textSecondary, margin: 0, valign: "middle", fit: "shrink" })
  })
}
