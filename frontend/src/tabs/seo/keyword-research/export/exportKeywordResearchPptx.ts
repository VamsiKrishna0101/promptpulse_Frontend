import PptxGenJS from "pptxgenjs"
import type { KeywordResearchPayload } from "../api/keywordResearchApi"
import {
  EXPORT_THEME as THEME,
  formatVolume,
  formatCpc,
  formatDifficulty,
  formatCompetition,
  formatIntent,
  sanitizeFileName,
} from "./types"

const PAGE_W = 13.333
const MARGIN_X = 0.8
const CONTENT_W = PAGE_W - MARGIN_X * 2 // 11.733

// ---------------------------------------------------------------------------
// Chrome helpers
// ---------------------------------------------------------------------------

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

function renderCover(pptx: any, brandName: string, result: KeywordResearchPayload) {
  const cover = pptx.addSlide()
  cover.background = { color: THEME.colors.darkBg }

  cover.addText(`${brandName.toUpperCase()} · KEYWORD RESEARCH & SEARCH INTELLIGENCE`, {
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

  const title = `Search Demand & Opportunity: "${result.query}"`
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

  const subtitle = `Market: ${result.database.toUpperCase()} Database  |  Match Type: ${result.matchType.toUpperCase()}  |  ${result.summary.returnedKeywords} Keyword Opportunities Identified`
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
      label: "TOTAL SEARCH DEMAND",
      value: `${formatVolume(result.summary.totalSearchVolume)}/mo`,
      color: "34D399",
      sub: "Combined monthly volume",
    },
    {
      label: "AVERAGE DIFFICULTY",
      value: formatDifficulty(result.summary.averageDifficulty),
      color: "38BDF8",
      sub: "Ranking competition",
    },
    {
      label: "AVERAGE CPC",
      value: formatCpc(result.summary.averageCpc),
      color: "FBBF24",
      sub: "Commercial click value",
    },
    {
      label: "KEYWORD IDEAS",
      value: String(result.summary.returnedKeywords),
      color: "C084FC",
      sub: "Target opportunities",
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
    `Intelligence Source: Google Search & Semrush Dataset  |  Generated: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}  |  PromptPulse Search & GEO Suite`,
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
// 2. Strategic Opportunity & Quick Wins Slide
// ---------------------------------------------------------------------------

function renderQuickWins(pptx: any, result: KeywordResearchPayload) {
  const slide = pptx.addSlide()
  slide.background = { color: THEME.colors.slideBg }
  const bodyStartY = addKickerTitle(slide, "Opportunity Intelligence", "Search Intent & Quick-Win Ranking Targets")

  const gap = 0.35
  const leftW = 6.2
  const rightW = CONTENT_W - leftW - gap
  const rightX = MARGIN_X + leftW + gap

  // Left: Quick Wins (High Volume, Low KD <= 35)
  const quickWins = result.keywords
    .filter((k) => (k.keywordDifficulty ?? 100) <= 35 && (k.searchVolume ?? 0) > 0)
    .sort((a, b) => (b.searchVolume ?? 0) - (a.searchVolume ?? 0))
    .slice(0, 5)

  slide.addText("TOP QUICK-WIN OPPORTUNITIES (LOW DIFFICULTY < 35%)", {
    x: MARGIN_X,
    y: bodyStartY,
    w: leftW,
    h: 0.25,
    fontFace: THEME.font,
    fontSize: 9,
    bold: true,
    color: THEME.colors.accent,
    charSpacing: 1,
    margin: 0,
  })

  const qwRows = quickWins.length > 0 ? quickWins : result.keywords.slice(0, 5)
  const qwHead = [
    [
      { text: "Keyword Target", options: { bold: true, fill: THEME.colors.darkBg, color: "FFFFFF", fontSize: 9.5 } },
      { text: "Volume", options: { bold: true, fill: THEME.colors.darkBg, color: "FFFFFF", fontSize: 9.5, align: "center" } },
      { text: "KD", options: { bold: true, fill: THEME.colors.darkBg, color: "FFFFFF", fontSize: 9.5, align: "center" } },
      { text: "CPC", options: { bold: true, fill: THEME.colors.darkBg, color: "FFFFFF", fontSize: 9.5, align: "center" } },
    ],
  ]

  const qwBody = qwRows.map((k, i) => [
    { text: k.keyword, options: { fontSize: 9.5, fill: i % 2 === 0 ? "FFFFFF" : THEME.colors.cardBg } },
    { text: formatVolume(k.searchVolume), options: { fontSize: 9.5, align: "center", bold: true, fill: i % 2 === 0 ? "FFFFFF" : THEME.colors.cardBg } },
    { text: formatDifficulty(k.keywordDifficulty), options: { fontSize: 9.5, align: "center", bold: true, color: THEME.colors.emerald, fill: i % 2 === 0 ? "FFFFFF" : THEME.colors.cardBg } },
    { text: formatCpc(k.cpc), options: { fontSize: 9.5, align: "center", fill: i % 2 === 0 ? "FFFFFF" : THEME.colors.cardBg } },
  ])

  slide.addTable([...qwHead, ...qwBody], {
    x: MARGIN_X,
    y: bodyStartY + 0.35,
    w: leftW,
    colW: [leftW * 0.55, leftW * 0.15, leftW * 0.15, leftW * 0.15],
    rowH: 0.44,
    border: { color: THEME.colors.cardBorder, pt: 0.75 },
    fontFace: THEME.font,
  })

  // Quick win insight note
  const qwInsightY = bodyStartY + 0.35 + (qwRows.length + 1) * 0.44 + 0.25
  slide.addShape("roundRect", {
    x: MARGIN_X,
    y: qwInsightY,
    w: leftW,
    h: 1.1,
    rectRadius: 0.08,
    fill: { color: THEME.colors.emeraldBg },
    line: { type: "none" },
  })
  slide.addText(
    "💡 Content Strategy Recommendation:\nPublish targeted GEO articles addressing these low-competition keywords to earn immediate page-1 rankings and AI answer engine citations (ChatGPT & Perplexity).",
    {
      x: MARGIN_X + 0.2,
      y: qwInsightY + 0.12,
      w: leftW - 0.4,
      h: 0.86,
      fontFace: THEME.font,
      fontSize: 10,
      color: "065F46",
      margin: 0,
      lineSpacingMultiple: 1.25,
    },
  )

  // Right: Search Intent Breakdown Card
  slide.addText("SEARCH INTENT DISTRIBUTION", {
    x: rightX,
    y: bodyStartY,
    w: rightW,
    h: 0.25,
    fontFace: THEME.font,
    fontSize: 9,
    bold: true,
    color: THEME.colors.accent,
    charSpacing: 1,
    margin: 0,
  })

  const intentCounts: Record<string, { count: number; volume: number }> = {
    Informational: { count: 0, volume: 0 },
    Commercial: { count: 0, volume: 0 },
    Transactional: { count: 0, volume: 0 },
    Navigational: { count: 0, volume: 0 },
  }

  result.keywords.forEach((k) => {
    const formatted = formatIntent(k.intent)
    if (!intentCounts[formatted]) intentCounts[formatted] = { count: 0, volume: 0 }
    intentCounts[formatted].count++
    intentCounts[formatted].volume += k.searchVolume ?? 0
  })

  const intentList = Object.entries(intentCounts)
  const totalKeywords = result.keywords.length || 1

  intentList.forEach(([intentName, data], i) => {
    const pct = Math.round((data.count / totalKeywords) * 100)
    const cardY = bodyStartY + 0.35 + i * 1.02
    slide.addShape("roundRect", {
      x: rightX,
      y: cardY,
      w: rightW,
      h: 0.88,
      rectRadius: 0.08,
      fill: { color: THEME.colors.cardBg },
      line: { color: THEME.colors.cardBorder, width: 1 },
    })

    slide.addText(intentName, {
      x: rightX + 0.2,
      y: cardY + 0.15,
      w: rightW * 0.45,
      h: 0.3,
      fontFace: THEME.font,
      fontSize: 11,
      bold: true,
      color: THEME.colors.textPrimary,
      margin: 0,
    })

    slide.addText(`${data.count} keywords (${pct}%)`, {
      x: rightX + 0.2,
      y: cardY + 0.48,
      w: rightW * 0.45,
      h: 0.25,
      fontFace: THEME.font,
      fontSize: 9.5,
      color: THEME.colors.textSecondary,
      margin: 0,
    })

    slide.addText(`${formatVolume(data.volume)}`, {
      x: rightX + rightW * 0.5,
      y: cardY + 0.15,
      w: rightW * 0.45,
      h: 0.3,
      fontFace: THEME.font,
      fontSize: 13,
      bold: true,
      color: THEME.colors.blue,
      align: "right",
      margin: 0,
    })

    slide.addText("monthly searches", {
      x: rightX + rightW * 0.5,
      y: cardY + 0.48,
      w: rightW * 0.45,
      h: 0.25,
      fontFace: THEME.font,
      fontSize: 8.5,
      color: THEME.colors.textMuted,
      align: "right",
      margin: 0,
    })
  })
}

// ---------------------------------------------------------------------------
// 3. High Commercial Value & CPC Targets Slide
// ---------------------------------------------------------------------------

function renderCommercialTargets(pptx: any, result: KeywordResearchPayload) {
  const slide = pptx.addSlide()
  slide.background = { color: THEME.colors.slideBg }
  const bodyStartY = addKickerTitle(slide, "Commercial Value", "Highest CPC Keywords & Ad-Spend Savings")

  const highCpcKeywords = [...result.keywords]
    .sort((a, b) => (b.cpc ?? 0) - (a.cpc ?? 0))
    .slice(0, 7)

  slide.addText("TOP HIGH-VALUE COMMERCIAL QUERIES (ORGANIC TRAFFIC VALUE)", {
    x: MARGIN_X,
    y: bodyStartY,
    w: CONTENT_W,
    h: 0.25,
    fontFace: THEME.font,
    fontSize: 9,
    bold: true,
    color: THEME.colors.accent,
    charSpacing: 1,
    margin: 0,
  })

  const head = [
    [
      { text: "Keyword Phrase", options: { bold: true, fill: THEME.colors.darkBg, color: "FFFFFF", fontSize: 10 } },
      { text: "Search Volume", options: { bold: true, fill: THEME.colors.darkBg, color: "FFFFFF", fontSize: 10, align: "center" } },
      { text: "Cost Per Click (CPC)", options: { bold: true, fill: THEME.colors.darkBg, color: "FFFFFF", fontSize: 10, align: "center" } },
      { text: "KD %", options: { bold: true, fill: THEME.colors.darkBg, color: "FFFFFF", fontSize: 10, align: "center" } },
      { text: "Ad Competition", options: { bold: true, fill: THEME.colors.darkBg, color: "FFFFFF", fontSize: 10, align: "center" } },
    ],
  ]

  const body = highCpcKeywords.map((k, i) => [
    { text: k.keyword, options: { fontSize: 10, fill: i % 2 === 0 ? "FFFFFF" : THEME.colors.cardBg, bold: true } },
    { text: formatVolume(k.searchVolume), options: { fontSize: 10, align: "center", fill: i % 2 === 0 ? "FFFFFF" : THEME.colors.cardBg } },
    { text: formatCpc(k.cpc), options: { fontSize: 10, align: "center", bold: true, color: "D97706", fill: i % 2 === 0 ? "FFFFFF" : THEME.colors.cardBg } },
    { text: formatDifficulty(k.keywordDifficulty), options: { fontSize: 10, align: "center", fill: i % 2 === 0 ? "FFFFFF" : THEME.colors.cardBg } },
    { text: formatCompetition(k.competition), options: { fontSize: 10, align: "center", fill: i % 2 === 0 ? "FFFFFF" : THEME.colors.cardBg } },
  ])

  const rowH = 0.44
  slide.addTable([...head, ...body], {
    x: MARGIN_X,
    y: bodyStartY + 0.35,
    w: CONTENT_W,
    colW: [CONTENT_W * 0.44, CONTENT_W * 0.14, CONTENT_W * 0.15, CONTENT_W * 0.12, CONTENT_W * 0.15],
    rowH,
    border: { color: THEME.colors.cardBorder, pt: 0.75 },
    fontFace: THEME.font,
  })

  const insightY = bodyStartY + 0.35 + (highCpcKeywords.length + 1) * rowH + 0.25
  slide.addShape("roundRect", {
    x: MARGIN_X,
    y: insightY,
    w: CONTENT_W,
    h: 0.85,
    rectRadius: 0.08,
    fill: { color: THEME.colors.accentBg },
    line: { color: THEME.colors.accentBorder, width: 1 },
  })

  slide.addText(
    "💰 High-Ticket Commercial Value:\nEvery organic visitor captured on these high-CPC terms saves between $10.00 and $30.00+ in Google Search Ads spend while capturing qualified buyers actively comparing solutions.",
    {
      x: MARGIN_X + 0.25,
      y: insightY + 0.12,
      w: CONTENT_W - 0.5,
      h: 0.62,
      fontFace: THEME.font,
      fontSize: 10,
      color: "78350F",
      margin: 0,
      lineSpacingMultiple: 1.2,
    },
  )
}

// ---------------------------------------------------------------------------
// 4. Paginated Dataset Tables (10 rows per slide)
// ---------------------------------------------------------------------------

function renderDatasetSlides(pptx: any, result: KeywordResearchPayload) {
  const pageSize = 10
  const totalPages = Math.ceil(result.keywords.length / pageSize) || 1

  for (let p = 0; p < totalPages; p++) {
    const chunk = result.keywords.slice(p * pageSize, (p + 1) * pageSize)
    const slide = pptx.addSlide()
    slide.background = { color: THEME.colors.slideBg }

    const subtitle = totalPages > 1 ? `Keyword Dataset (Page ${p + 1} of ${totalPages})` : "Prioritized Keyword Dataset"
    const bodyStartY = addKickerTitle(slide, `Dataset Table · Rows ${p * pageSize + 1}–${p * pageSize + chunk.length}`, subtitle)

    const head = [
      [
        { text: "#", options: { bold: true, fill: THEME.colors.darkBg, color: "FFFFFF", fontSize: 9.5, align: "center" } },
        { text: "Keyword Phrase", options: { bold: true, fill: THEME.colors.darkBg, color: "FFFFFF", fontSize: 9.5 } },
        { text: "Intent", options: { bold: true, fill: THEME.colors.darkBg, color: "FFFFFF", fontSize: 9.5, align: "center" } },
        { text: "Volume", options: { bold: true, fill: THEME.colors.darkBg, color: "FFFFFF", fontSize: 9.5, align: "center" } },
        { text: "KD %", options: { bold: true, fill: THEME.colors.darkBg, color: "FFFFFF", fontSize: 9.5, align: "center" } },
        { text: "CPC", options: { bold: true, fill: THEME.colors.darkBg, color: "FFFFFF", fontSize: 9.5, align: "center" } },
        { text: "Competition", options: { bold: true, fill: THEME.colors.darkBg, color: "FFFFFF", fontSize: 9.5, align: "center" } },
      ],
    ]

    const body = chunk.map((k, i) => {
      const kd = k.keywordDifficulty ?? 0
      const kdColor = kd <= 35 ? THEME.colors.emerald : kd <= 60 ? "D97706" : THEME.colors.textPrimary
      return [
        { text: String(p * pageSize + i + 1), options: { fontSize: 9, align: "center", fill: i % 2 === 0 ? "FFFFFF" : THEME.colors.cardBg } },
        { text: k.keyword, options: { fontSize: 9.5, fill: i % 2 === 0 ? "FFFFFF" : THEME.colors.cardBg, bold: true } },
        { text: formatIntent(k.intent), options: { fontSize: 9, align: "center", fill: i % 2 === 0 ? "FFFFFF" : THEME.colors.cardBg } },
        { text: formatVolume(k.searchVolume), options: { fontSize: 9.5, align: "center", bold: true, fill: i % 2 === 0 ? "FFFFFF" : THEME.colors.cardBg } },
        { text: formatDifficulty(k.keywordDifficulty), options: { fontSize: 9.5, align: "center", bold: true, color: kdColor, fill: i % 2 === 0 ? "FFFFFF" : THEME.colors.cardBg } },
        { text: formatCpc(k.cpc), options: { fontSize: 9, align: "center", fill: i % 2 === 0 ? "FFFFFF" : THEME.colors.cardBg } },
        { text: formatCompetition(k.competition), options: { fontSize: 9, align: "center", fill: i % 2 === 0 ? "FFFFFF" : THEME.colors.cardBg } },
      ]
    })

    const rowH = 0.44
    slide.addTable([...head, ...body], {
      x: MARGIN_X,
      y: bodyStartY,
      w: CONTENT_W,
      colW: [
        CONTENT_W * 0.05,
        CONTENT_W * 0.43,
        CONTENT_W * 0.14,
        CONTENT_W * 0.11,
        CONTENT_W * 0.09,
        CONTENT_W * 0.09,
        CONTENT_W * 0.09,
      ],
      rowH,
      border: { color: THEME.colors.cardBorder, pt: 0.75 },
      fontFace: THEME.font,
    })
  }
}

// ---------------------------------------------------------------------------
// 5. Execution Roadmap Slide
// ---------------------------------------------------------------------------

function renderChecklist(pptx: any, result: KeywordResearchPayload) {
  const slide = pptx.addSlide()
  slide.background = { color: THEME.colors.slideBg }
  const bodyStartY = addKickerTitle(slide, "Execution Roadmap", "SEO & AI Search Optimization Action Plan")

  const items = [
    {
      label: "Select High-Priority Queries",
      detail: `Target top 5 quick-win keywords (KD < 35%) from the "${result.query}" dataset for immediate content generation.`,
    },
    {
      label: "Generate GEO Content Briefs",
      detail: "Use PromptPulse AI Content Briefs to craft authoritative articles with citations, H2/H3 layouts, and stats.",
    },
    {
      label: "Deploy High-Value Comparison Pages",
      detail: "Build dedicated solution and alternative landing pages targeting high-CPC commercial queries.",
    },
    {
      label: "Implement Structured FAQ Schema",
      detail: "Inject structured JSON-LD Schema on published pages to maximize LLM answer citations.",
    },
    {
      label: "Monitor AI Search Visibility",
      detail: "Track brand citation mentions across ChatGPT, Perplexity, and Gemini to measure visibility growth.",
    },
  ]

  const availH = 6.85 - bodyStartY
  const gapH = 0.16
  const n = items.length
  const rowH = (availH - gapH * (n - 1)) / n

  let y = bodyStartY
  items.forEach((item, idx) => {
    slide.addShape("roundRect", {
      x: MARGIN_X,
      y,
      w: CONTENT_W,
      h: rowH,
      rectRadius: 0.07,
      fill: { color: THEME.colors.cardBg },
      line: { color: THEME.colors.cardBorder, width: 1 },
    })

    slide.addShape("ellipse", {
      x: MARGIN_X + 0.22,
      y: y + rowH / 2 - 0.18,
      w: 0.36,
      h: 0.36,
      fill: { color: THEME.colors.accent },
      line: { type: "none" },
    })

    slide.addText(String(idx + 1), {
      x: MARGIN_X + 0.22,
      y: y + rowH / 2 - 0.18,
      w: 0.36,
      h: 0.36,
      fontFace: THEME.font,
      fontSize: 12,
      bold: true,
      color: THEME.colors.white,
      align: "center",
      valign: "middle",
      margin: 0,
    })

    slide.addText(
      [
        { text: item.label + "  ", options: { bold: true, color: THEME.colors.textPrimary } },
        { text: item.detail, options: { color: THEME.colors.textSecondary } },
      ],
      {
        x: MARGIN_X + 0.76,
        y,
        w: CONTENT_W - 1.0,
        h: rowH,
        fontFace: THEME.font,
        fontSize: 11,
        margin: 0,
        valign: "middle",
        lineSpacingMultiple: 1.2,
      },
    )

    y += rowH + gapH
  })
}

// ---------------------------------------------------------------------------
// Main Export Function
// ---------------------------------------------------------------------------

export async function exportKeywordResearchPptx(brandName: string, result: KeywordResearchPayload) {
  const pptx = new (PptxGenJS as any)()
  pptx.layout = "LAYOUT_WIDE" // 13.333 x 7.5 inches
  pptx.author = brandName
  pptx.company = brandName
  pptx.title = `Keyword Research: ${result.query}`
  pptx.subject = `SEO Intelligence & Keyword Demand Report for "${result.query}"`

  renderCover(pptx, brandName, result)
  renderQuickWins(pptx, result)
  renderCommercialTargets(pptx, result)
  renderDatasetSlides(pptx, result)
  renderChecklist(pptx, result)

  // Add footers with total slide count
  const total = pptx.slides.length
  pptx.slides.forEach((s: any, i: number) => {
    if (i === 0) return // Skip cover
    addFooter(s, brandName, i + 1, total)
  })

  // Download PPTX
  const filename = `${sanitizeFileName(brandName)}-keyword-research-${sanitizeFileName(result.query)}.pptx`
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
