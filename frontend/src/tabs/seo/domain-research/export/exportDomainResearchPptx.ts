import PptxGenJS from "pptxgenjs"
import type { DomainResearchData } from "../hooks/useDomainResearch"
import {
  DOMAIN_EXPORT_THEME as THEME,
  formatCompactNum,
  formatMoneyValue,
  formatPct,
  sanitizeDomainFilename,
} from "./types"
import { addActionsSlide } from "./slides/addActionsSlide"
import { addCompetitorChartSlide, addLandscapeSlide } from "./slides/addLandscapeSlides"
import { addIntentSlide } from "./slides/addIntentSlide"
import { addPerformanceSlide } from "./slides/addPerformanceSlide"
import { addRankingChartSlide } from "./slides/addRankingChartSlide"

const PAGE_W = 13.333
const MARGIN_X = 0.8
const CONTENT_W = PAGE_W - MARGIN_X * 2

function addKickerTitle(slide: any, kicker: string, title: string): number {
  slide.addText(kicker.toUpperCase(), {
    x: MARGIN_X,
    y: 0.55,
    w: 10.5,
    h: 0.25,
    fontFace: THEME.font,
    fontSize: 9,
    bold: true,
    color: THEME.colors.accent,
    charSpacing: 1.5,
    margin: 0,
  })

  slide.addText(title, {
    x: MARGIN_X,
    y: 0.82,
    w: CONTENT_W,
    h: 0.55,
    fontFace: THEME.font,
    fontSize: 20,
    bold: true,
    color: THEME.colors.textPrimary,
    margin: 0,
    fit: "shrink",
  })

  return 1.48
}

function addFooter(slide: any, brandName: string, pageNum: number, totalPages: number) {
  slide.addText(brandName.toUpperCase(), {
    x: MARGIN_X,
    y: 7.16,
    w: 5,
    h: 0.25,
    fontFace: THEME.font,
    fontSize: 8,
    bold: true,
    color: THEME.colors.textMuted,
    charSpacing: 1,
    margin: 0,
  })
  slide.addText(`${pageNum} / ${totalPages}`, {
    x: PAGE_W - MARGIN_X - 1.2,
    y: 7.16,
    w: 1.2,
    h: 0.25,
    fontFace: THEME.font,
    fontSize: 8,
    color: THEME.colors.textMuted,
    align: "right",
    margin: 0,
  })
}

// ---------------------------------------------------------------------------
// 1. Cover Slide
// ---------------------------------------------------------------------------

function renderCover(pptx: any, brandName: string, data: DomainResearchData) {
  const { overview } = data
  const target = overview.target
  const summary = overview.summary.organic

  const cover = pptx.addSlide()
  cover.background = { color: THEME.colors.darkBg }

  cover.addText(`${brandName.toUpperCase()} · DOMAIN INTELLIGENCE & SEO AUDIT`, {
    x: MARGIN_X,
    y: 0.85,
    w: 11.0,
    h: 0.3,
    fontFace: THEME.font,
    fontSize: 9.5,
    bold: true,
    color: THEME.colors.accent,
    charSpacing: 2,
    margin: 0,
  })

  const title = `Search Performance Overview: ${target.domain}`
  cover.addText(title, {
    x: MARGIN_X,
    y: 1.3,
    w: CONTENT_W,
    h: 1.2,
    fontFace: THEME.font,
    fontSize: 28,
    bold: true,
    color: THEME.colors.white,
    margin: 0,
    fit: "shrink",
  })

  const subtitle = `Market: ${target.locationName} (${target.countryIsoCode.toUpperCase()})  |  Language: ${target.languageName}  |  History: ${overview.availableHistoryMonths} Months`
  cover.addText(subtitle, {
    x: MARGIN_X,
    y: 2.65,
    w: CONTENT_W,
    h: 0.5,
    fontFace: THEME.font,
    fontSize: 12,
    color: "CBD5E1",
    margin: 0,
  })

  // 4 KPI Cards
  const kpis = [
    {
      label: "ORGANIC TRAFFIC",
      value: `${formatCompactNum(summary.traffic)}/mo`,
      color: "34D399",
      sub: "Estimated monthly visits",
    },
    {
      label: "ORGANIC KEYWORDS",
      value: formatCompactNum(summary.keywords),
      color: "38BDF8",
      sub: `${formatCompactNum(overview.rankingDistribution.top3)} in Top 3 positions`,
    },
    {
      label: "TRAFFIC VALUE",
      value: formatMoneyValue(summary.trafficValueUsd),
      color: "FBBF24",
      sub: "Estimated monthly ad equivalent",
    },
    {
      label: "TOP 10 COVERAGE",
      value: formatPct(summary.keywords ? (overview.rankingDistribution.top3 + overview.rankingDistribution.positions4To10) / summary.keywords : null),
      color: "C084FC",
      sub: "Keywords ranking on Page 1",
    },
  ]

  const kpiW = (CONTENT_W - 0.23 * 3) / 4
  kpis.forEach((kpi, idx) => {
    const kX = MARGIN_X + idx * (kpiW + 0.23)
    cover.addShape("roundRect", {
      x: kX,
      y: 3.8,
      w: kpiW,
      h: 1.9,
      rectRadius: 0.1,
      fill: { color: THEME.colors.darkCard },
      line: { color: THEME.colors.darkCardBorder, width: 1 },
    })

    cover.addText(kpi.label, {
      x: kX + 0.2,
      y: 4.0,
      w: kpiW - 0.4,
      h: 0.25,
      fontFace: THEME.font,
      fontSize: 8.5,
      bold: true,
      color: "94A3B8",
      charSpacing: 1,
      margin: 0,
    })

    cover.addText(kpi.value, {
      x: kX + 0.2,
      y: 4.3,
      w: kpiW - 0.4,
      h: 0.75,
      fontFace: THEME.font,
      fontSize: 24,
      bold: true,
      color: kpi.color,
      margin: 0,
      fit: "shrink",
    })

    cover.addText(kpi.sub, {
      x: kX + 0.2,
      y: 5.15,
      w: kpiW - 0.4,
      h: 0.35,
      fontFace: THEME.font,
      fontSize: 9.5,
      color: "64748B",
      margin: 0,
    })
  })

  cover.addShape("line", {
    x: MARGIN_X,
    y: 6.25,
    w: CONTENT_W,
    h: 0,
    line: { color: THEME.colors.darkCardBorder, width: 0.75 },
  })

  cover.addText(
    `Domain: ${target.domain}  |  Generated: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}  |  PromptPulse Search & GEO Suite`,
    {
      x: MARGIN_X,
      y: 6.45,
      w: CONTENT_W,
      h: 0.4,
      fontFace: THEME.font,
      fontSize: 9.5,
      color: "64748B",
      margin: 0,
    },
  )
}

// ---------------------------------------------------------------------------
// 2. Ranking Distribution Slide
// ---------------------------------------------------------------------------

function renderRankingDistribution(pptx: any, data: DomainResearchData) {
  const { overview } = data
  const dist = overview.rankingDistribution

  const slide = pptx.addSlide()
  slide.background = { color: THEME.colors.slideBg }
  const bodyStartY = addKickerTitle(slide, "Ranking Health", `Google Position Distribution: ${overview.target.domain}`)

  const positions = [
    { label: "Top 3 Positions", count: dist.top3, pct: 0, color: "059669" },
    { label: "Positions 4–10", count: dist.positions4To10, pct: 0, color: "2563EB" },
    { label: "Positions 11–20", count: dist.positions11To20, pct: 0, color: "0D9488" },
    { label: "Positions 21–50", count: dist.positions21To50, pct: 0, color: "D97706" },
    { label: "Positions 51–100", count: dist.positions51To100, pct: 0, color: "E11D48" },
  ]

  const cardW = (CONTENT_W - 0.2 * 4) / 5
  positions.forEach((pos, idx) => {
    const pX = MARGIN_X + idx * (cardW + 0.2)
    slide.addShape("roundRect", {
      x: pX,
      y: bodyStartY + 0.2,
      w: cardW,
      h: 2.0,
      rectRadius: 0.08,
      fill: { color: THEME.colors.cardBg },
      line: { color: THEME.colors.cardBorder, width: 1 },
    })

    slide.addText(pos.label, {
      x: pX + 0.15,
      y: bodyStartY + 0.4,
      w: cardW - 0.3,
      h: 0.25,
      fontFace: THEME.font,
      fontSize: 9.5,
      bold: true,
      color: THEME.colors.textSecondary,
      margin: 0,
    })

    slide.addText(formatCompactNum(pos.count), {
      x: pX + 0.15,
      y: bodyStartY + 0.75,
      w: cardW - 0.3,
      h: 0.6,
      fontFace: THEME.font,
      fontSize: 22,
      bold: true,
      color: pos.color,
      margin: 0,
    })

    slide.addText("keywords ranking", {
      x: pX + 0.15,
      y: bodyStartY + 1.45,
      w: cardW - 0.3,
      h: 0.25,
      fontFace: THEME.font,
      fontSize: 9,
      color: THEME.colors.textMuted,
      margin: 0,
    })
  })

  // Movement summary cards below
  const movY = bodyStartY + 2.5
  const movW = (CONTENT_W - 0.3) / 2

  // Gained
  slide.addShape("roundRect", {
    x: MARGIN_X,
    y: movY,
    w: movW,
    h: 1.6,
    rectRadius: 0.08,
    fill: { color: THEME.colors.emeraldBg },
    line: { color: "A7F3D0", width: 1 },
  })
  slide.addText("↗ VISIBILITY GAINED (NEW & IMPROVED)", {
    x: MARGIN_X + 0.25,
    y: movY + 0.2,
    w: movW - 0.5,
    h: 0.25,
    fontFace: THEME.font,
    fontSize: 9,
    bold: true,
    color: "065F46",
    margin: 0,
  })
  slide.addText(`+${formatCompactNum(overview.changes.new + overview.changes.improved)}`, {
    x: MARGIN_X + 0.25,
    y: movY + 0.55,
    w: movW - 0.5,
    h: 0.5,
    fontFace: THEME.font,
    fontSize: 20,
    bold: true,
    color: "047857",
    margin: 0,
  })
  slide.addText("Keywords advancing to higher SERP tiers this period", {
    x: MARGIN_X + 0.25,
    y: movY + 1.1,
    w: movW - 0.5,
    h: 0.3,
    fontFace: THEME.font,
    fontSize: 9.5,
    color: "065F46",
    margin: 0,
  })

  // At Risk
  const rightX = MARGIN_X + movW + 0.3
  slide.addShape("roundRect", {
    x: rightX,
    y: movY,
    w: movW,
    h: 1.6,
    rectRadius: 0.08,
    fill: { color: "FFF1F2" },
    line: { color: "FECDD3", width: 1 },
  })
  slide.addText("↘ VISIBILITY AT RISK (DECLINED & LOST)", {
    x: rightX + 0.25,
    y: movY + 0.2,
    w: movW - 0.5,
    h: 0.25,
    fontFace: THEME.font,
    fontSize: 9,
    bold: true,
    color: "9F1239",
    margin: 0,
  })
  slide.addText(`-${formatCompactNum(Math.abs(overview.changes.declined + overview.changes.lost))}`, {
    x: rightX + 0.25,
    y: movY + 0.55,
    w: movW - 0.5,
    h: 0.5,
    fontFace: THEME.font,
    fontSize: 20,
    bold: true,
    color: "E11D48",
    margin: 0,
  })
  slide.addText("Keywords dropping positions or falling off top 100", {
    x: rightX + 0.25,
    y: movY + 1.1,
    w: movW - 0.5,
    h: 0.3,
    fontFace: THEME.font,
    fontSize: 9.5,
    color: "9F1239",
    margin: 0,
  })
}

// ---------------------------------------------------------------------------
// 3. Top Organic Keywords Slide
// ---------------------------------------------------------------------------

function renderTopKeywords(pptx: any, data: DomainResearchData) {
  const slide = pptx.addSlide()
  slide.background = { color: THEME.colors.slideBg }
  const bodyStartY = addKickerTitle(slide, "Search Footprint", `Top Performing Organic Keywords: ${data.overview.target.domain}`)

  const keywords = (data.organicKeywords?.keywords || []).slice(0, 9)

  const head = [
    [
      { text: "Keyword Phrase", options: { bold: true, fill: THEME.colors.darkBg, color: "FFFFFF", fontSize: 9.5 } },
      { text: "Position", options: { bold: true, fill: THEME.colors.darkBg, color: "FFFFFF", fontSize: 9.5, align: "center" } },
      { text: "Search Volume", options: { bold: true, fill: THEME.colors.darkBg, color: "FFFFFF", fontSize: 9.5, align: "center" } },
      { text: "KD %", options: { bold: true, fill: THEME.colors.darkBg, color: "FFFFFF", fontSize: 9.5, align: "center" } },
      { text: "CPC", options: { bold: true, fill: THEME.colors.darkBg, color: "FFFFFF", fontSize: 9.5, align: "center" } },
      { text: "Traffic %", options: { bold: true, fill: THEME.colors.darkBg, color: "FFFFFF", fontSize: 9.5, align: "center" } },
    ],
  ]

  const body = keywords.map((k, i) => [
    { text: k.keyword, options: { fontSize: 9.5, fill: i % 2 === 0 ? "FFFFFF" : THEME.colors.cardBg, bold: true } },
    { text: k.position == null ? "—" : `#${k.position}`, options: { fontSize: 9.5, align: "center", bold: true, color: (k.position ?? 999) <= 3 ? THEME.colors.emerald : THEME.colors.blue, fill: i % 2 === 0 ? "FFFFFF" : THEME.colors.cardBg } },
    { text: formatCompactNum(k.searchVolume), options: { fontSize: 9.5, align: "center", fill: i % 2 === 0 ? "FFFFFF" : THEME.colors.cardBg } },
    { text: `${Math.round(k.difficulty ?? 0)}%`, options: { fontSize: 9.5, align: "center", fill: i % 2 === 0 ? "FFFFFF" : THEME.colors.cardBg } },
    { text: `$${Number(k.cpcUsd ?? 0).toFixed(2)}`, options: { fontSize: 9.5, align: "center", fill: i % 2 === 0 ? "FFFFFF" : THEME.colors.cardBg } },
    { text: formatPct(data.organicKeywords.summary.estimatedTraffic ? (k.traffic / data.organicKeywords.summary.estimatedTraffic) : null), options: { fontSize: 9.5, align: "center", bold: true, fill: i % 2 === 0 ? "FFFFFF" : THEME.colors.cardBg } },
  ])

  slide.addTable([...head, ...body], {
    x: MARGIN_X,
    y: bodyStartY + 0.1,
    w: CONTENT_W,
    colW: [CONTENT_W * 0.44, CONTENT_W * 0.11, CONTENT_W * 0.13, CONTENT_W * 0.11, CONTENT_W * 0.11, CONTENT_W * 0.10],
    rowH: 0.43,
    border: { color: THEME.colors.cardBorder, pt: 0.75 },
    fontFace: THEME.font,
  })
}

// ---------------------------------------------------------------------------
// 4. Top Organic Pages & Competitors Slide
// ---------------------------------------------------------------------------

function renderPagesAndCompetitors(pptx: any, data: DomainResearchData) {
  const slide = pptx.addSlide()
  slide.background = { color: THEME.colors.slideBg }
  const bodyStartY = addKickerTitle(slide, "Content & Competitive Landscape", `Top Pages & Organic Competitors: ${data.overview.target.domain}`)

  const gap = 0.35
  const colW = (CONTENT_W - gap) / 2

  // Left: Top Pages
  slide.addText("TOP ORGANIC TRAFFIC PAGES", {
    x: MARGIN_X,
    y: bodyStartY,
    w: colW,
    h: 0.25,
    fontFace: THEME.font,
    fontSize: 9,
    bold: true,
    color: THEME.colors.accent,
    charSpacing: 1,
    margin: 0,
  })

  const pages = (data.topPages?.pages || []).slice(0, 6)
  const pHead = [
    [
      { text: "Page URL", options: { bold: true, fill: THEME.colors.darkBg, color: "FFFFFF", fontSize: 9 } },
      { text: "Traffic", options: { bold: true, fill: THEME.colors.darkBg, color: "FFFFFF", fontSize: 9, align: "center" } },
      { text: "Keywords", options: { bold: true, fill: THEME.colors.darkBg, color: "FFFFFF", fontSize: 9, align: "center" } },
    ],
  ]
  const pBody = pages.map((p, i) => [
    { text: p.url.replace(/^https?:\/\//, ""), options: { fontSize: 8.5, fill: i % 2 === 0 ? "FFFFFF" : THEME.colors.cardBg } },
    { text: formatCompactNum(p.estimatedTraffic), options: { fontSize: 9, align: "center", bold: true, fill: i % 2 === 0 ? "FFFFFF" : THEME.colors.cardBg } },
    { text: formatCompactNum(p.rankingKeywords), options: { fontSize: 9, align: "center", fill: i % 2 === 0 ? "FFFFFF" : THEME.colors.cardBg } },
  ])

  slide.addTable([...pHead, ...pBody], {
    x: MARGIN_X,
    y: bodyStartY + 0.35,
    w: colW,
    colW: [colW * 0.65, colW * 0.18, colW * 0.17],
    rowH: 0.44,
    border: { color: THEME.colors.cardBorder, pt: 0.75 },
    fontFace: THEME.font,
  })

  // Right: Competitors
  const rightX = MARGIN_X + colW + gap
  slide.addText("TOP ORGANIC SEARCH COMPETITORS", {
    x: rightX,
    y: bodyStartY,
    w: colW,
    h: 0.25,
    fontFace: THEME.font,
    fontSize: 9,
    bold: true,
    color: THEME.colors.accent,
    charSpacing: 1,
    margin: 0,
  })

  const comps = (data.competitors?.competitors || []).slice(0, 6)
  const cHead = [
    [
      { text: "Competitor Domain", options: { bold: true, fill: THEME.colors.darkBg, color: "FFFFFF", fontSize: 9 } },
      { text: "Common KWs", options: { bold: true, fill: THEME.colors.darkBg, color: "FFFFFF", fontSize: 9, align: "center" } },
      { text: "Traffic", options: { bold: true, fill: THEME.colors.darkBg, color: "FFFFFF", fontSize: 9, align: "center" } },
    ],
  ]
  const cBody = comps.map((c, i) => [
    { text: c.domain, options: { fontSize: 9, bold: true, fill: i % 2 === 0 ? "FFFFFF" : THEME.colors.cardBg } },
    { text: formatCompactNum(c.sharedKeywords), options: { fontSize: 9, align: "center", fill: i % 2 === 0 ? "FFFFFF" : THEME.colors.cardBg } },
    { text: formatCompactNum(c.estimatedTraffic), options: { fontSize: 9, align: "center", bold: true, fill: i % 2 === 0 ? "FFFFFF" : THEME.colors.cardBg } },
  ])

  slide.addTable([...cHead, ...cBody], {
    x: rightX,
    y: bodyStartY + 0.35,
    w: colW,
    colW: [colW * 0.55, colW * 0.23, colW * 0.22],
    rowH: 0.44,
    border: { color: THEME.colors.cardBorder, pt: 0.75 },
    fontFace: THEME.font,
  })
}

// ---------------------------------------------------------------------------
// Main Export Function
// ---------------------------------------------------------------------------

export async function exportDomainResearchPptx(brandName: string, data: DomainResearchData) {
  const pptx = new (PptxGenJS as any)()
  pptx.layout = "LAYOUT_WIDE"
  pptx.author = brandName
  pptx.company = brandName
  pptx.title = `Domain Intelligence: ${data.overview.target.domain}`
  pptx.subject = `SEO & Search Performance Deck for ${data.overview.target.domain}`

  renderCover(pptx, brandName, data)
  addPerformanceSlide(pptx, data)
  renderRankingDistribution(pptx, data)
  addRankingChartSlide(pptx, data)
  addIntentSlide(pptx, data)
  renderTopKeywords(pptx, data)
  addLandscapeSlide(pptx, data)
  addCompetitorChartSlide(pptx, data)
  renderPagesAndCompetitors(pptx, data)
  addActionsSlide(pptx, data)

  const total = pptx.slides.length
  pptx.slides.forEach((s: any, i: number) => {
    if (i === 0) return
    addFooter(s, brandName, i + 1, total)
  })

  const filename = `${sanitizeDomainFilename(data.overview.target.domain)}-domain-intelligence.pptx`
  const blob = (await pptx.write({ outputType: "blob" })) as Blob
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
