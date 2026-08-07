import PptxGenJS from "pptxgenjs"
import type { GeoArticleBrief } from "@/hooks/useGeoArticle"

export interface GeoArticleExportInput {
  title: string
  meta_description?: string
  slug?: string
  target_query?: string
  search_intent?: string
  article_markdown: string
  faq?: Array<{ question: string; answer: string }>
  json_ld?: string
  needs_data?: string[]
}

const THEME = {
  font: "Arial",
  colors: {
    darkBg: "0F172A",
    darkCard: "1E293B",
    darkCardBorder: "334155",
    slideBg: "FFFFFF",
    cardBg: "F8FAFC",
    cardBorder: "E2E8F0",
    textPrimary: "0F172A",
    textSecondary: "475569",
    textMuted: "94A3B8",
    accent: "D97706",
    accentBg: "FEF3C7",
    accentBorder: "FDE68A",
    emerald: "059669",
    emeraldBg: "ECFDF5",
    blue: "2563EB",
    blueBg: "EFF6FF",
    white: "FFFFFF",
  },
}

const PAGE_W = 13.333
const PAGE_H = 7.5
const MARGIN_X = 0.8
const CONTENT_W = PAGE_W - MARGIN_X * 2 // 11.733

interface ParsedSection {
  title: string
  paragraphs: string[]
  bullets: string[]
  table?: { headers: string[]; rows: string[][] }
  callouts: string[]
}

// ---------------------------------------------------------------------------
// Text measurement helpers.
//
// pptxgenjs has no layout engine — it will happily let text overflow a box
// or leave a box half-empty. Rather than hardcoding box heights and hoping
// the text fits (the old failure mode), every template below estimates how
// many lines a paragraph/bullet list will wrap to at a given width and font
// size, and sizes boxes / picks font sizes from that estimate.
// ---------------------------------------------------------------------------

const AVG_CHAR_WIDTH_FACTOR = 0.52 // fraction of font-size (pt) per average character, Arial

function charsPerLine(fontSize: number, widthIn: number): number {
  const charWidthIn = (fontSize * AVG_CHAR_WIDTH_FACTOR) / 72
  return Math.max(6, Math.floor(widthIn / charWidthIn))
}

function estimateLines(text: string, fontSize: number, widthIn: number): number {
  if (!text) return 0
  const cpl = charsPerLine(fontSize, widthIn)
  return Math.max(1, Math.ceil(text.length / cpl))
}

// Height (in) for a block of paragraphs rendered as separate blocks with a
// blank-line gap between them (mirrors "\n\n"-joined text in pptxgenjs).
function estimateParagraphsHeight(
  paragraphs: string[],
  fontSize: number,
  widthIn: number,
  lineSpacingMultiple = 1.25,
): number {
  const lineH = (fontSize * lineSpacingMultiple) / 72
  let lines = 0
  paragraphs.forEach((p, i) => {
    lines += estimateLines(p, fontSize, widthIn)
    if (i < paragraphs.length - 1) lines += 0.6
  })
  return lines * lineH
}

// Picks the largest font size (from a descending candidate list) whose
// estimated height fits maxHeightIn; falls back to the smallest candidate.
function fitFontSize(
  paragraphs: string[],
  widthIn: number,
  maxHeightIn: number,
  candidates: number[],
): { fontSize: number; height: number } {
  for (const size of candidates) {
    const h = estimateParagraphsHeight(paragraphs, size, widthIn)
    if (h <= maxHeightIn) return { fontSize: size, height: h }
  }
  const size = candidates[candidates.length - 1]
  return { fontSize: size, height: estimateParagraphsHeight(paragraphs, size, widthIn) }
}

// Pulls a headline number out of a section's prose (e.g. "78.3%" or "9x") to
// use as a big pull-stat on list slides. Falls back to the caller's default.
function firstStat(paragraphs: string[]): string | null {
  for (const p of paragraphs) {
    const m = p.match(/(\d{1,3}(?:\.\d+)?)\s?%/)
    if (m) return `${m[1]}%`
  }
  for (const p of paragraphs) {
    const m = p.match(/\b(\d{1,3}(?:\.\d+)?x)\b/i)
    if (m) return m[1]
  }
  return null
}

// ---------------------------------------------------------------------------
// Markdown -> sections
// ---------------------------------------------------------------------------

function parseMarkdownToSections(markdown: string): ParsedSection[] {
  const lines = markdown.split("\n")
  const sections: ParsedSection[] = []
  let currentSection: ParsedSection = {
    title: "Executive Summary",
    paragraphs: [],
    bullets: [],
    callouts: [],
  }

  let tableLines: string[] = []

  function flushTable() {
    if (tableLines.length === 0) return
    const rawRows = tableLines
      .map(r => r.split("|").map(c => c.trim()).filter((_, i, arr) => i > 0 && i < arr.length - 1))
      .filter(r => r.length > 0 && !r.every(c => /^[-:]+$/.test(c)))

    tableLines = []
    if (rawRows.length > 0) {
      currentSection.table = {
        headers: rawRows[0],
        rows: rawRows.slice(1),
      }
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i]
    const trimmed = raw.trim()

    if (trimmed.startsWith("|")) {
      tableLines.push(trimmed)
      continue
    } else if (tableLines.length > 0) {
      flushTable()
    }

    if (!trimmed) continue

    if (trimmed.startsWith("## ") || trimmed.startsWith("# ")) {
      if (currentSection.paragraphs.length > 0 || currentSection.bullets.length > 0 || currentSection.table || currentSection.callouts.length > 0) {
        sections.push(currentSection)
      }
      currentSection = {
        title: trimmed.replace(/^#+\s*/, "").replace(/\*\*/g, ""),
        paragraphs: [],
        bullets: [],
        callouts: [],
      }
      continue
    }

    if (trimmed.startsWith("### ")) {
      currentSection.paragraphs.push(trimmed.replace(/^###\s*/, ""))
      continue
    }

    if (trimmed.includes("[NEEDS DATA:")) {
      const calloutText = trimmed.replace(/\[NEEDS DATA:\s*/i, "").replace(/\]/g, "")
      currentSection.callouts.push(calloutText)
      continue
    }

    if (/^[-*]\s+/.test(trimmed)) {
      currentSection.bullets.push(trimmed.replace(/^[-*]\s+/, "").replace(/\*\*/g, ""))
      continue
    }

    currentSection.paragraphs.push(trimmed.replace(/\*\*/g, ""))
  }

  flushTable()
  if (currentSection.paragraphs.length > 0 || currentSection.bullets.length > 0 || currentSection.table || currentSection.callouts.length > 0) {
    sections.push(currentSection)
  }

  return sections
}

// ---------------------------------------------------------------------------
// Shared chrome: kicker + title, footer, callout chip
// ---------------------------------------------------------------------------

function addKickerTitle(slide: any, kicker: string, title: string): number {
  slide.addText(kicker.toUpperCase(), {
    x: MARGIN_X, y: 0.55, w: 10.5, h: 0.25,
    fontFace: THEME.font, fontSize: 9, bold: true, color: THEME.colors.accent,
    charSpacing: 1.5, margin: 0,
  })

  const titleLines = estimateLines(title, 20, CONTENT_W)
  const titleFontSize = titleLines > 1 ? 18 : 20
  const titleH = titleLines > 1 ? 0.85 : 0.5

  slide.addText(title, {
    x: MARGIN_X, y: 0.82, w: CONTENT_W, h: titleH,
    fontFace: THEME.font, fontSize: titleFontSize, bold: true, color: THEME.colors.textPrimary,
    margin: 0, fit: "shrink",
  })

  return 0.82 + titleH + 0.22 // y where body content can start
}

function addFooter(slide: any, brandName: string, pageNum: number, totalPages: number) {
  slide.addText(brandName.toUpperCase(), {
    x: MARGIN_X, y: 7.16, w: 5, h: 0.25,
    fontFace: THEME.font, fontSize: 8, bold: true, color: THEME.colors.textMuted, charSpacing: 1, margin: 0,
  })
  slide.addText(`${pageNum} / ${totalPages}`, {
    x: PAGE_W - MARGIN_X - 1.2, y: 7.16, w: 1.2, h: 0.25,
    fontFace: THEME.font, fontSize: 8, color: THEME.colors.textMuted, align: "right", margin: 0,
  })
}

// Compact callout chip (never a full-width banner) — sits bottom-right and
// is sized to its own text, so it never collides with content above it
// (callers reserve a bottomLimit for the main content when a callout exists).
function addCalloutChip(slide: any, text: string) {
  const width = 5.3
  const x = PAGE_W - MARGIN_X - width
  const fontSize = 9.5
  const textW = width - 0.85
  const lines = estimateLines(text, fontSize, textW)
  const lineH = (fontSize * 1.2) / 72
  const height = Math.max(0.62, lines * lineH + 0.34)
  const y = PAGE_H - 0.55 - height

  slide.addShape("roundRect", {
    x, y, w: width, h: height, rectRadius: 0.08,
    fill: { color: THEME.colors.accentBg }, line: { color: THEME.colors.accentBorder, width: 1 },
  })

  slide.addShape("ellipse", {
    x: x + 0.18, y: y + height / 2 - 0.14, w: 0.28, h: 0.28,
    fill: { color: THEME.colors.accent }, line: { type: "none" },
  })
  slide.addText("!", {
    x: x + 0.18, y: y + height / 2 - 0.14, w: 0.28, h: 0.28,
    fontFace: THEME.font, fontSize: 12, bold: true, color: THEME.colors.white,
    align: "center", valign: "middle", margin: 0,
  })

  slide.addText(text, {
    x: x + 0.58, y: y + 0.14, w: textW, h: height - 0.24,
    fontFace: THEME.font, fontSize, color: "78350F", margin: 0, valign: "middle", lineSpacingMultiple: 1.15,
  })
}

// ---------------------------------------------------------------------------
// Section slide templates.
//
// Each article section is routed to the template that fits its content shape
// instead of every section using one identical "title + white card" layout.
// ---------------------------------------------------------------------------

// Has a markdown table: full-width data table, a one-line caption if the
// first paragraph is short, and a tinted insight strip if there's more text.
function renderDataSlide(slide: any, sec: ParsedSection, bodyStartY: number, bottomLimit = 6.85) {
  const headers = sec.table!.headers
  const rows = sec.table!.rows
  const colCount = headers.length
  const colWidths = Array(colCount).fill(CONTENT_W / colCount)
  if (colCount >= 3) {
    colWidths[0] = (CONTENT_W / colCount) * 1.4
    const rest = CONTENT_W - colWidths[0]
    for (let c = 1; c < colCount; c++) colWidths[c] = rest / (colCount - 1)
  }

  let y = bodyStartY
  if (sec.paragraphs[0] && sec.paragraphs[0].length < 200) {
    slide.addText(sec.paragraphs[0], {
      x: MARGIN_X, y, w: CONTENT_W, h: 0.5,
      fontFace: THEME.font, fontSize: 11.5, color: THEME.colors.textSecondary, margin: 0, lineSpacingMultiple: 1.2,
    })
    y += 0.55
  }

  const rowH = 0.42
  const head = [headers.map((h, i) => ({
    text: h,
    options: { bold: true, fill: THEME.colors.darkBg, color: THEME.colors.white, fontSize: 10.5, align: i === 0 ? "left" : "center" },
  }))]
  const body = rows.map((row, r) => row.map((cell, c) => ({
    text: cell,
    options: {
      fontSize: 10, fill: r % 2 === 0 ? THEME.colors.white : THEME.colors.cardBg,
      color: THEME.colors.textPrimary, bold: c === 0, align: c === 0 ? "left" : "center",
    },
  })))

  slide.addTable([...head, ...body], {
    x: MARGIN_X, y, w: CONTENT_W, colW: colWidths, rowH,
    border: { color: THEME.colors.cardBorder, pt: 0.75 }, fontFace: THEME.font,
  })
  y += (head.length + body.length) * rowH + 0.35

  const secondPara = sec.paragraphs[1] || (sec.paragraphs[0] && sec.paragraphs[0].length >= 200 ? sec.paragraphs[0] : null)
  if (secondPara && y < bottomLimit - 0.55) {
    const insightW = CONTENT_W
    const lines = estimateLines(secondPara, 11, insightW - 0.5)
    const h = Math.max(0.7, lines * ((11 * 1.25) / 72) + 0.35)
    slide.addShape("roundRect", {
      x: MARGIN_X, y, w: insightW, h, rectRadius: 0.08,
      fill: { color: THEME.colors.blueBg }, line: { type: "none" },
    })
    slide.addText(secondPara, {
      x: MARGIN_X + 0.28, y: y + 0.14, w: insightW - 0.56, h: h - 0.28,
      fontFace: THEME.font, fontSize: 11, color: THEME.colors.textPrimary, margin: 0,
      valign: "middle", lineSpacingMultiple: 1.2,
    })
  }
}

// Short section, no bullets/table: big centered pull-quote-style statement
// instead of a lonely paragraph floating inside an oversized white card.
function renderStatementSlide(slide: any, sec: ParsedSection, bodyStartY: number, bottomLimit = 6.85) {
  const availH = bottomLimit - bodyStartY
  const text = sec.paragraphs.join("  ")
  const { fontSize, height } = fitFontSize([text], CONTENT_W - 1.2, availH, [26, 22, 19, 16, 14])
  const y = bodyStartY + Math.max(0, (availH - height) / 2)

  slide.addText("\u201C", {
    x: MARGIN_X - 0.15, y: y - 0.55, w: 1.2, h: 1.0,
    fontFace: "Georgia", fontSize: 60, bold: true, color: THEME.colors.accentBorder, margin: 0,
  })

  slide.addText(text, {
    x: MARGIN_X + 0.6, y, w: CONTENT_W - 1.2, h: height + 0.3,
    fontFace: THEME.font, fontSize, color: THEME.colors.textPrimary, bold: fontSize >= 19,
    margin: 0, lineSpacingMultiple: 1.3, valign: "top",
  })
}

// Bullets present: left panel is a dark stat card (pulls a headline number
// out of the prose), right side is a numbered list of card rows sized to
// their own text instead of a fixed guessed height.
function renderListSlide(slide: any, sec: ParsedSection, bodyStartY: number, bottomLimit = 6.6) {
  const leftW = 3.6
  const gap = 0.4
  const rightX = MARGIN_X + leftW + gap
  const rightW = CONTENT_W - leftW - gap

  const stat = firstStat(sec.paragraphs) || String(sec.bullets.length).padStart(2, "0")
  slide.addShape("roundRect", {
    x: MARGIN_X, y: bodyStartY, w: leftW, h: bottomLimit - bodyStartY, rectRadius: 0.1,
    fill: { color: THEME.colors.darkBg }, line: { type: "none" },
  })
  slide.addText(stat, {
    x: MARGIN_X + 0.3, y: bodyStartY + 0.4, w: leftW - 0.6, h: 1.1,
    fontFace: THEME.font, fontSize: 44, bold: true, color: THEME.colors.accent, margin: 0, fit: "shrink",
  })
  if (sec.paragraphs[0]) {
    slide.addText(sec.paragraphs[0], {
      x: MARGIN_X + 0.3, y: bodyStartY + 1.6, w: leftW - 0.6, h: bottomLimit - bodyStartY - 1.9,
      fontFace: THEME.font, fontSize: 11.5, color: "CBD5E1", margin: 0, lineSpacingMultiple: 1.3,
    })
  }

  const n = sec.bullets.length
  const availH = bottomLimit - bodyStartY
  const gapH = 0.14
  const perRowH = (availH - gapH * (n - 1)) / n
  const fontSize = perRowH > 0.9 ? 11.5 : perRowH > 0.65 ? 10.5 : 9.5

  let y = bodyStartY
  sec.bullets.forEach((bullet, i) => {
    const rowH = perRowH
    slide.addShape("roundRect", {
      x: rightX, y, w: rightW, h: rowH, rectRadius: 0.07,
      fill: { color: THEME.colors.cardBg }, line: { color: THEME.colors.cardBorder, width: 1 },
    })
    slide.addShape("ellipse", {
      x: rightX + 0.2, y: y + rowH / 2 - 0.17, w: 0.34, h: 0.34,
      fill: { color: THEME.colors.accent }, line: { type: "none" },
    })
    slide.addText(String(i + 1), {
      x: rightX + 0.2, y: y + rowH / 2 - 0.17, w: 0.34, h: 0.34,
      fontFace: THEME.font, fontSize: 11, bold: true, color: THEME.colors.white,
      align: "center", valign: "middle", margin: 0,
    })
    slide.addText(bullet, {
      x: rightX + 0.7, y, w: rightW - 0.95, h: rowH,
      fontFace: THEME.font, fontSize, color: THEME.colors.textPrimary, margin: 0,
      valign: "middle", lineSpacingMultiple: 1.15,
    })
    y += rowH + gapH
  })
}

// Longer prose, no bullets/table: two-column flowing text (balanced by
// character count) instead of one long paragraph in a single wide card.
//
// Safety valve: fitFontSize's smallest candidate is a *best effort*, not a
// guarantee — if the estimated height still exceeds the available space at
// the smallest size, we fall back to pptxgenjs's own auto-shrink so the text
// can never bleed past bottomLimit into the footer.
function renderProseSlide(slide: any, sec: ParsedSection, bodyStartY: number, bottomLimit = 6.85) {
  const colGap = 0.5
  const colW = (CONTENT_W - colGap) / 2
  const availH = bottomLimit - bodyStartY

  const totalChars = sec.paragraphs.reduce((s, p) => s + p.length, 0)
  const left: string[] = []
  const right: string[] = []
  let running = 0
  for (const p of sec.paragraphs) {
    if (running < totalChars / 2) left.push(p)
    else right.push(p)
    running += p.length
  }
  if (right.length === 0 && left.length > 1) right.push(left.pop()!)

  const leftChars = left.reduce((s, p) => s + p.length, 0)
  const rightChars = right.reduce((s, p) => s + p.length, 0)
  const worst = leftChars >= rightChars ? left : right
  const { fontSize, height } = fitFontSize(worst, colW, availH, [12.5, 11.5, 10.5, 9.5, 8.5, 7.5])

  // If even the smallest candidate size is estimated to overflow the
  // available height, hand off to pptxgenjs's built-in auto-shrink rather
  // than letting the text run into the footer.
  const overflowing = height > availH
  const overflowOpts = overflowing ? { fit: "shrink" as const, shrinkText: true } : {}

  slide.addText(left.join("\n\n"), {
    x: MARGIN_X, y: bodyStartY, w: colW, h: availH,
    fontFace: THEME.font, fontSize, color: THEME.colors.textPrimary, margin: 0,
    lineSpacingMultiple: 1.3, ...overflowOpts,
  })
  slide.addText(right.join("\n\n"), {
    x: MARGIN_X + colW + colGap, y: bodyStartY, w: colW, h: availH,
    fontFace: THEME.font, fontSize, color: THEME.colors.textPrimary, margin: 0,
    lineSpacingMultiple: 1.3, ...overflowOpts,
  })
}

function renderSectionSlide(pptx: any, sec: ParsedSection, index: number) {
  const slide = pptx.addSlide()
  slide.background = { color: THEME.colors.slideBg }

  const bodyStartY = addKickerTitle(slide, `Section ${index + 1}`, sec.title)

  // Reserve room at the bottom-right for the callout chip so it never
  // overlaps the last row/line of the main content.
  const hasCallout = sec.callouts.length > 0
  const bottomLimit = hasCallout ? 6.1 : 6.85

  if (sec.table && sec.table.headers.length > 0) {
    renderDataSlide(slide, sec, bodyStartY, bottomLimit)
  } else if (sec.bullets.length >= 2) {
    renderListSlide(slide, sec, bodyStartY, hasCallout ? 6.35 : 6.6)
  } else if (sec.paragraphs.reduce((s, p) => s + p.length, 0) < 260 && sec.paragraphs.length > 0) {
    renderStatementSlide(slide, sec, bodyStartY, bottomLimit)
  } else if (sec.paragraphs.length > 0) {
    renderProseSlide(slide, sec, bodyStartY, bottomLimit)
  } else if (sec.bullets.length === 1) {
    renderListSlide(slide, sec, bodyStartY, hasCallout ? 6.35 : 6.6)
  }

  if (hasCallout) {
    addCalloutChip(slide, sec.callouts.join(" \u00B7 "))
  }

  return slide
}

// ---------------------------------------------------------------------------
// Cover, benchmark, FAQ, checklist slides
// ---------------------------------------------------------------------------

function renderCover(pptx: any, brandName: string, brief: GeoArticleBrief, article: GeoArticleExportInput) {
  const cover = pptx.addSlide()
  cover.background = { color: THEME.colors.darkBg }

  cover.addText(`${brandName.toUpperCase()} \u00B7 GEO ARTICLE & AI VISIBILITY INTELLIGENCE`, {
    x: MARGIN_X, y: 0.85, w: 11.0, h: 0.3,
    fontFace: THEME.font, fontSize: 9.5, bold: true, color: THEME.colors.accent, charSpacing: 2, margin: 0,
  })

  const title = article.title || brief.recommended_article.title
  const titleLines = estimateLines(title, 30, CONTENT_W)
  cover.addText(title, {
    x: MARGIN_X, y: 1.3, w: CONTENT_W, h: titleLines > 1 ? 1.7 : 1.1,
    fontFace: THEME.font, fontSize: 30, bold: true, color: THEME.colors.white, margin: 0, fit: "shrink",
  })

  const desc = article.meta_description || brief.recommended_article.priority_reason
  if (desc) {
    cover.addText(desc, {
      x: MARGIN_X, y: titleLines > 1 ? 3.1 : 2.65, w: CONTENT_W, h: 0.8,
      fontFace: THEME.font, fontSize: 12, color: "CBD5E1", margin: 0, lineSpacingMultiple: 1.3,
    })
  }

  const m = brief.metrics || { own_visibility: 0, evidence_count: 0, own_avg_position: null }
  const kpis = [
    { label: "AI VISIBILITY", value: `${m.own_visibility}%`, color: "34D399" },
    { label: "COMPETITOR GAP", value: `${(100 - m.own_visibility).toFixed(1)}%`, color: "FBBF24" },
    { label: "AVG POSITION", value: m.own_avg_position ? `#${m.own_avg_position}` : "\u2014", color: "38BDF8" },
    { label: "EVIDENCE ANSWERS", value: String(m.evidence_count), color: "C084FC" },
  ]
  const kpiW = (CONTENT_W - 0.23 * 3) / 4
  kpis.forEach((kpi, idx) => {
    const kX = MARGIN_X + idx * (kpiW + 0.23)
    cover.addShape("roundRect", {
      x: kX, y: 4.35, w: kpiW, h: 1.35, rectRadius: 0.1,
      fill: { color: THEME.colors.darkCard }, line: { color: THEME.colors.darkCardBorder, width: 1 },
    })
    cover.addText(kpi.label, {
      x: kX + 0.2, y: 4.5, w: kpiW - 0.4, h: 0.25,
      fontFace: THEME.font, fontSize: 8.5, bold: true, color: "94A3B8", charSpacing: 1, margin: 0,
    })
    cover.addText(kpi.value, {
      x: kX + 0.2, y: 4.78, w: kpiW - 0.4, h: 0.75,
      fontFace: THEME.font, fontSize: 22, bold: true, color: kpi.color, margin: 0, fit: "shrink",
    })
  })

  cover.addShape("line", {
    x: MARGIN_X, y: 6.15, w: CONTENT_W, h: 0, line: { color: THEME.colors.darkCardBorder, width: 0.75 },
  })
  cover.addText(
    `Target Query: "${brief.target_prompt.text}"   |   Content Action: ${brief.recommended_article.action}   |   Slug: /${brief.recommended_article.suggested_slug}`,
    {
      x: MARGIN_X, y: 6.35, w: CONTENT_W, h: 0.5,
      fontFace: THEME.font, fontSize: 9.5, color: "64748B", margin: 0, lineSpacingMultiple: 1.3,
    },
  )
}

function renderBenchmark(pptx: any, brief: GeoArticleBrief) {
  const slide = pptx.addSlide()
  slide.background = { color: THEME.colors.slideBg }
  const bodyStartY = addKickerTitle(slide, "AI Visibility Benchmark", "Competitor Presence in AI Generated Answers")

  const cardGap = 0.3
  const leftW = 6.9
  const rightW = CONTENT_W - leftW - cardGap
  const rightX = MARGIN_X + leftW + cardGap

  const compRows = brief.competitors.length > 0 ? brief.competitors.slice(0, 5) : []
  const compRowH = 0.44
  const compTableH = (compRows.length + 1) * compRowH

  slide.addText("TOP MENTIONED PROVIDERS", {
    x: MARGIN_X, y: bodyStartY, w: leftW, h: 0.25,
    fontFace: THEME.font, fontSize: 9, bold: true, color: THEME.colors.accent, charSpacing: 1, margin: 0,
  })

  const head = [[
    { text: "Provider", options: { bold: true, fill: THEME.colors.darkBg, color: "FFFFFF", fontSize: 10 } },
    { text: "Visibility", options: { bold: true, fill: THEME.colors.darkBg, color: "FFFFFF", fontSize: 10, align: "center" } },
    { text: "Position", options: { bold: true, fill: THEME.colors.darkBg, color: "FFFFFF", fontSize: 10, align: "center" } },
  ]]
  const body = compRows.map((c, i) => [
    { text: c.name, options: { fontSize: 10, fill: i % 2 === 0 ? "FFFFFF" : THEME.colors.cardBg } },
    { text: `${c.visibility}%`, options: { fontSize: 10, align: "center", bold: true, color: THEME.colors.emerald, fill: i % 2 === 0 ? "FFFFFF" : THEME.colors.cardBg } },
    { text: c.avg_position ? `#${c.avg_position.toFixed(1)}` : "\u2014", options: { fontSize: 10, align: "center", fill: i % 2 === 0 ? "FFFFFF" : THEME.colors.cardBg } },
  ])

  slide.addTable([...head, ...body], {
    x: MARGIN_X, y: bodyStartY + 0.35, w: leftW, colW: [leftW * 0.55, leftW * 0.225, leftW * 0.225], rowH: compRowH,
    border: { color: THEME.colors.cardBorder, pt: 0.75 }, fontFace: THEME.font,
  })

  const leader = compRows[0]
  if (leader) {
    const insightY = bodyStartY + 0.35 + compTableH + 0.25
    const lowestVisibility = compRows[compRows.length - 1]?.visibility ?? 0
    const insightText = `${leader.name} leads with ${leader.visibility}% AI visibility, ${(leader.visibility - lowestVisibility).toFixed(1)} points ahead of the lowest-ranked tracked competitor.`
    const lines = estimateLines(insightText, 10.5, leftW - 0.5)
    const h = Math.max(0.55, lines * ((10.5 * 1.2) / 72) + 0.28)
    slide.addShape("roundRect", { x: MARGIN_X, y: insightY, w: leftW, h, rectRadius: 0.07, fill: { color: THEME.colors.emeraldBg }, line: { type: "none" } })
    slide.addText(insightText, {
      x: MARGIN_X + 0.22, y: insightY, w: leftW - 0.44, h,
      fontFace: THEME.font, fontSize: 10.5, color: "065F46", margin: 0, valign: "middle", lineSpacingMultiple: 1.2,
    })
  }

  const srcRows = brief.sources_to_reference.slice(0, 6)
  const srcRowH = 0.44
  slide.addText("DIRECTORIES & CITED DOMAINS", {
    x: rightX, y: bodyStartY, w: rightW, h: 0.25,
    fontFace: THEME.font, fontSize: 9, bold: true, color: THEME.colors.accent, charSpacing: 1, margin: 0,
  })
  const srcHead = [[
    { text: "Source Domain", options: { bold: true, fill: THEME.colors.darkBg, color: "FFFFFF", fontSize: 10 } },
    { text: "Citations", options: { bold: true, fill: THEME.colors.darkBg, color: "FFFFFF", fontSize: 10, align: "center" } },
  ]]
  const srcBody = srcRows.map((s, i) => [
    { text: s.domain, options: { fontSize: 9.5, fill: i % 2 === 0 ? "FFFFFF" : THEME.colors.cardBg } },
    { text: `${s.mentions} answers`, options: { fontSize: 9.5, align: "center", bold: true, color: THEME.colors.blue, fill: i % 2 === 0 ? "FFFFFF" : THEME.colors.cardBg } },
  ])
  slide.addTable([...srcHead, ...srcBody], {
    x: rightX, y: bodyStartY + 0.35, w: rightW, colW: [rightW * 0.62, rightW * 0.38], rowH: srcRowH,
    border: { color: THEME.colors.cardBorder, pt: 0.75 }, fontFace: THEME.font,
  })

  const topSrc = srcRows[0]
  if (topSrc) {
    const insightY = bodyStartY + 0.35 + (srcRows.length + 1) * srcRowH + 0.25
    const insightText = `${topSrc.domain} is the most-cited source, appearing in ${topSrc.mentions} tracked AI answers.`
    const lines = estimateLines(insightText, 10.5, rightW - 0.5)
    const h = Math.max(0.55, lines * ((10.5 * 1.2) / 72) + 0.28)
    slide.addShape("roundRect", { x: rightX, y: insightY, w: rightW, h, rectRadius: 0.07, fill: { color: THEME.colors.blueBg }, line: { type: "none" } })
    slide.addText(insightText, {
      x: rightX + 0.22, y: insightY, w: rightW - 0.44, h,
      fontFace: THEME.font, fontSize: 10.5, color: "1E3A8A", margin: 0, valign: "middle", lineSpacingMultiple: 1.2,
    })
  }
}

// Paginates 4 FAQs per slide (2x2 grid) instead of silently truncating to
// the first 4 like the previous implementation.
function renderFaqSlides(pptx: any, faqs: Array<{ question: string; answer: string }>) {
  const slides: any[] = []
  for (let i = 0; i < faqs.length; i += 4) {
    const chunk = faqs.slice(i, i + 4)
    const slide = pptx.addSlide()
    slide.background = { color: THEME.colors.slideBg }
    const bodyStartY = addKickerTitle(slide, "AI Search Snippets", i === 0 ? "Frequently Asked Questions" : "Frequently Asked Questions (cont.)")

    const gap = 0.3
    const cardW = (CONTENT_W - gap) / 2
    const cardH = (6.9 - bodyStartY - gap) / 2

    chunk.forEach((f, idx) => {
      const col = idx % 2
      const row = Math.floor(idx / 2)
      const x = MARGIN_X + col * (cardW + gap)
      const y = bodyStartY + row * (cardH + gap)

      slide.addShape("roundRect", {
        x, y, w: cardW, h: cardH, rectRadius: 0.08,
        fill: { color: THEME.colors.cardBg }, line: { color: THEME.colors.cardBorder, width: 1 },
      })
      const qLines = estimateLines(f.question, 12, cardW - 0.5)
      const qH = qLines * 0.24 + 0.1
      slide.addText(`Q: ${f.question}`, {
        x: x + 0.25, y: y + 0.2, w: cardW - 0.5, h: qH,
        fontFace: THEME.font, fontSize: 12, bold: true, color: THEME.colors.textPrimary, margin: 0, lineSpacingMultiple: 1.15,
      })
      slide.addText(f.answer, {
        x: x + 0.25, y: y + 0.28 + qH, w: cardW - 0.5, h: cardH - qH - 0.5,
        fontFace: THEME.font, fontSize: 10, color: THEME.colors.textSecondary, margin: 0, lineSpacingMultiple: 1.25,
      })
    })
    slides.push(slide)
  }
  return slides
}

function renderChecklist(pptx: any, brief: GeoArticleBrief, article: GeoArticleExportInput) {
  const slide = pptx.addSlide()
  slide.background = { color: THEME.colors.slideBg }
  const bodyStartY = addKickerTitle(slide, "Deployment Workflow", "CMS Publishing & Verification Checklist")

  const items = [
    { label: "Target URL Slug", detail: `/${article.slug || brief.recommended_article.suggested_slug}` },
    { label: "Target Search Query", detail: `"${brief.target_prompt.text}" (${brief.recommended_article.content_type})` },
    { label: "Verify credentials & specs", detail: "Fill in verified doctor credentials, equipment specs, and emergency response statistics." },
    { label: "Inject schema", detail: "Add the generated FAQ JSON-LD Article Schema into the <head> of the published page." },
    { label: "Link internally", detail: "Link from the primary service hub and homepage to establish internal page authority." },
    { label: "Monitor visibility", detail: "Re-check the AI Visibility benchmark after 14 days to track citation growth." },
  ]

  const availH = 6.85 - bodyStartY
  const gapH = 0.16
  const n = items.length
  const rowH = (availH - gapH * (n - 1)) / n

  let y = bodyStartY
  items.forEach((item, idx) => {
    slide.addShape("roundRect", {
      x: MARGIN_X, y, w: CONTENT_W, h: rowH, rectRadius: 0.07,
      fill: { color: THEME.colors.cardBg }, line: { color: THEME.colors.cardBorder, width: 1 },
    })
    slide.addShape("ellipse", {
      x: MARGIN_X + 0.22, y: y + rowH / 2 - 0.18, w: 0.36, h: 0.36,
      fill: { color: THEME.colors.accent }, line: { type: "none" },
    })
    slide.addText(String(idx + 1), {
      x: MARGIN_X + 0.22, y: y + rowH / 2 - 0.18, w: 0.36, h: 0.36,
      fontFace: THEME.font, fontSize: 12, bold: true, color: THEME.colors.white, align: "center", valign: "middle", margin: 0,
    })
    slide.addText([
      { text: item.label + "  ", options: { bold: true, color: THEME.colors.textPrimary } },
      { text: item.detail, options: { color: THEME.colors.textSecondary } },
    ], {
      x: MARGIN_X + 0.76, y, w: CONTENT_W - 1.0, h: rowH,
      fontFace: THEME.font, fontSize: 11, margin: 0, valign: "middle", lineSpacingMultiple: 1.2,
    })
    y += rowH + gapH
  })
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

export async function exportGeoArticlePptx(
  brandName: string,
  brief: GeoArticleBrief,
  article: GeoArticleExportInput,
) {
  const pptx = new (PptxGenJS as any)()
  pptx.layout = "LAYOUT_WIDE" // 13.333 x 7.5 inches
  pptx.author = brandName
  pptx.company = brandName
  pptx.title = article.title || brief.recommended_article.title
  pptx.subject = `GEO Article & AI Intelligence: ${article.title}`

  // Drop any "FAQ" / "Frequently Asked Questions" heading found in the
  // article body. FAQs are already rendered separately (and far better) by
  // renderFaqSlides below, using the structured article.faq array. Left in,
  // this heading was being treated as a generic prose section — producing a
  // duplicate, unstyled "Section N / FAQ" slide whose text could overflow
  // past bottomLimit into the footer.
  const isFaqHeading = (title: string) =>
    /^(faq|frequently asked questions)s?$/i.test(title.trim())

  const sections = parseMarkdownToSections(article.article_markdown || "")
    .filter(sec => !isFaqHeading(sec.title))

  renderCover(pptx, brandName, brief, article)
  renderBenchmark(pptx, brief)
  sections.forEach((sec, i) => renderSectionSlide(pptx, sec, i))
  if (article.faq && article.faq.length > 0) renderFaqSlides(pptx, article.faq)
  renderChecklist(pptx, brief, article)

  // Footer pass needs the final slide count, so it runs after every slide
  // has been added. The cover keeps its own footer treatment (target query
  // / action / slug line) instead of the plain brand+page footer.
  const total = pptx.slides.length
  pptx.slides.forEach((s: any, i: number) => {
    if (i === 0) return
    addFooter(s, brandName, i + 1, total)
  })

  // ----------------------------------------------------
  // Robust browser download (blob driven, instant unblock)
  // ----------------------------------------------------
  const filename = `${brandName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-geo-article-${brief.recommended_article.suggested_slug || "deck"}.pptx`

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