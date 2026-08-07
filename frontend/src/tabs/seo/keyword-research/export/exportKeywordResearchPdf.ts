import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
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

export async function exportKeywordResearchPdf(brandName: string, result: KeywordResearchPayload) {
  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" })
  const W = doc.internal.pageSize.width // 595.28 pt
  const H = doc.internal.pageSize.height // 841.89 pt
  const margin = 40
  const contentW = W - margin * 2

  const C = THEME.pdfColors

  // -------------------------------------------------------------------------
  // Page 1: Header + 4 Hero KPI Cards + Quick Wins & Intent Summary
  // -------------------------------------------------------------------------

  // Top Amber accent line
  doc.setFillColor(...C.amber)
  doc.rect(0, 0, W, 4, "F")

  // Header Dark Block
  doc.setFillColor(...C.navy)
  doc.rect(0, 4, W, 90, "F")

  // Eyebrow
  doc.setFont("helvetica", "bold")
  doc.setFontSize(8)
  doc.setTextColor(...C.amber)
  doc.text(`${brandName.toUpperCase()} · KEYWORD RESEARCH & SEARCH INTELLIGENCE`, margin, 24, { charSpace: 1.5 })

  // Title
  doc.setFont("helvetica", "bold")
  doc.setFontSize(16)
  doc.setTextColor(...C.white)
  doc.text(`Search Demand & Opportunity: "${result.query}"`, margin, 46, { maxWidth: contentW - 80 })

  // Subtitle
  doc.setFont("helvetica", "normal")
  doc.setFontSize(8.5)
  doc.setTextColor(203, 213, 225) // slate-300
  const subtitle = `Market: ${result.database.toUpperCase()} Database · Match Type: ${result.matchType.toUpperCase()} · ${result.summary.returnedKeywords} Keyword Opportunities`
  doc.text(subtitle, margin, 74)

  // Date top right
  const dateStr = new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
  doc.setFontSize(8)
  doc.setTextColor(...C.muted)
  doc.text(dateStr, W - margin, 24, { align: "right" })

  let y = 106

  // 4 Hero KPI Cards
  const kpis = [
    {
      label: "TOTAL DEMAND",
      value: `${formatVolume(result.summary.totalSearchVolume)}/mo`,
      sub: "Monthly search volume",
      color: C.emerald,
    },
    {
      label: "AVG DIFFICULTY",
      value: formatDifficulty(result.summary.averageDifficulty),
      sub: "Ranking competition",
      color: C.blue,
    },
    {
      label: "AVG COMMERCIAL CPC",
      value: formatCpc(result.summary.averageCpc),
      sub: "Average click value",
      color: C.amber,
    },
    {
      label: "OPPORTUNITIES",
      value: String(result.summary.returnedKeywords),
      sub: "Target keywords",
      color: C.ink,
    },
  ]

  const kpiGap = 10
  const kpiW = (contentW - kpiGap * 3) / 4
  const kpiH = 56

  kpis.forEach((kpi, idx) => {
    const kX = margin + idx * (kpiW + kpiGap)
    doc.setFillColor(...C.panel)
    doc.setDrawColor(...C.border)
    doc.setLineWidth(0.75)
    doc.roundedRect(kX, y, kpiW, kpiH, 4, 4, "FD")

    doc.setFont("helvetica", "bold")
    doc.setFontSize(7)
    doc.setTextColor(...C.muted)
    doc.text(kpi.label, kX + 8, y + 14, { charSpace: 0.5 })

    doc.setFont("helvetica", "bold")
    doc.setFontSize(13)
    doc.setTextColor(...kpi.color)
    doc.text(kpi.value, kX + 8, y + 33)

    doc.setFont("helvetica", "normal")
    doc.setFontSize(6.8)
    doc.setTextColor(...C.text)
    doc.text(kpi.sub, kX + 8, y + 47)
  })

  y += kpiH + 20

  // -------------------------------------------------------------------------
  // Section: Strategic Quick Wins (Low KD <= 35)
  // -------------------------------------------------------------------------
  doc.setFont("helvetica", "bold")
  doc.setFontSize(9)
  doc.setTextColor(...C.amber)
  doc.text("QUICK-WIN RANKING TARGETS (LOW DIFFICULTY < 35%)", margin, y, { charSpace: 1 })

  y += 8

  const quickWins = result.keywords
    .filter((k) => (k.keywordDifficulty ?? 100) <= 35 && (k.searchVolume ?? 0) > 0)
    .sort((a, b) => (b.searchVolume ?? 0) - (a.searchVolume ?? 0))
    .slice(0, 5)

  const qwRows = (quickWins.length > 0 ? quickWins : result.keywords.slice(0, 5)).map((k) => [
    k.keyword,
    formatIntent(k.intent),
    formatVolume(k.searchVolume),
    formatDifficulty(k.keywordDifficulty),
    formatCpc(k.cpc),
  ])

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [["Keyword Target", "Intent", "Volume", "KD %", "CPC"]],
    body: qwRows,
    theme: "plain",
    headStyles: {
      fillColor: C.navy,
      textColor: C.white,
      fontStyle: "bold",
      fontSize: 8,
      cellPadding: 5,
    },
    bodyStyles: {
      fontSize: 8,
      cellPadding: 4.5,
      textColor: C.ink,
      lineColor: C.border,
      lineWidth: 0.5,
    },
    alternateRowStyles: {
      fillColor: C.panel,
    },
    columnStyles: {
      0: { cellWidth: contentW * 0.48, fontStyle: "bold" },
      1: { cellWidth: contentW * 0.16, halign: "center" },
      2: { cellWidth: contentW * 0.12, halign: "center", fontStyle: "bold" },
      3: { cellWidth: contentW * 0.12, halign: "center", fontStyle: "bold", textColor: C.emerald },
      4: { cellWidth: contentW * 0.12, halign: "center" },
    },
  })

  y = (doc as any).lastAutoTable.finalY + 16

  // -------------------------------------------------------------------------
  // Section: High Commercial Intent & PPC Savings
  // -------------------------------------------------------------------------
  doc.setFont("helvetica", "bold")
  doc.setFontSize(9)
  doc.setTextColor(...C.amber)
  doc.text("HIGHEST COMMERCIAL VALUE QUERIES (PPC VALUE)", margin, y, { charSpace: 1 })

  y += 8

  const highCpc = [...result.keywords]
    .sort((a, b) => (b.cpc ?? 0) - (a.cpc ?? 0))
    .slice(0, 5)
    .map((k) => [
      k.keyword,
      formatIntent(k.intent),
      formatVolume(k.searchVolume),
      formatDifficulty(k.keywordDifficulty),
      formatCpc(k.cpc),
      formatCompetition(k.competition),
    ])

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [["Commercial Keyword", "Intent", "Volume", "KD %", "CPC ($)", "Ad Comp."]],
    body: highCpc,
    theme: "plain",
    headStyles: {
      fillColor: C.navy,
      textColor: C.white,
      fontStyle: "bold",
      fontSize: 8,
      cellPadding: 5,
    },
    bodyStyles: {
      fontSize: 8,
      cellPadding: 4.5,
      textColor: C.ink,
      lineColor: C.border,
      lineWidth: 0.5,
    },
    alternateRowStyles: {
      fillColor: C.panel,
    },
    columnStyles: {
      0: { cellWidth: contentW * 0.42, fontStyle: "bold" },
      1: { cellWidth: contentW * 0.14, halign: "center" },
      2: { cellWidth: contentW * 0.11, halign: "center" },
      3: { cellWidth: contentW * 0.11, halign: "center" },
      4: { cellWidth: contentW * 0.11, halign: "center", fontStyle: "bold", textColor: C.amber },
      5: { cellWidth: contentW * 0.11, halign: "center" },
    },
  })

  y = (doc as any).lastAutoTable.finalY + 16

  // Strategic Insight Callout Box
  doc.setFillColor(...C.amberBg)
  doc.setDrawColor(...C.amber)
  doc.setLineWidth(0.75)
  doc.roundedRect(margin, y, contentW, 40, 4, 4, "FD")

  doc.setFont("helvetica", "bold")
  doc.setFontSize(8)
  doc.setTextColor(120, 53, 15) // amber-900
  doc.text("Strategic Action Item:", margin + 10, y + 14)

  doc.setFont("helvetica", "normal")
  doc.setFontSize(7.5)
  doc.text(
    `Generating AI Content Briefs targeting these top quick-win and commercial keywords captures organic Google search traffic and positions ${brandName} for citations in AI answer engines (ChatGPT, Perplexity, Gemini).`,
    margin + 10,
    y + 26,
    { maxWidth: contentW - 20 },
  )

  // -------------------------------------------------------------------------
  // Page 2+: Full Paginated Dataset Table
  // -------------------------------------------------------------------------
  doc.addPage()

  // Header on Page 2
  doc.setFillColor(...C.amber)
  doc.rect(0, 0, W, 3, "F")

  doc.setFont("helvetica", "bold")
  doc.setFontSize(8.5)
  doc.setTextColor(...C.amber)
  doc.text("FULL KEYWORD DATASET", margin, 26, { charSpace: 1.5 })

  doc.setFont("helvetica", "bold")
  doc.setFontSize(13)
  doc.setTextColor(...C.ink)
  doc.text(`All Identified Opportunities for "${result.query}"`, margin, 42)

  const allRows = result.keywords.map((k, i) => [
    String(i + 1),
    k.keyword,
    formatIntent(k.intent),
    formatVolume(k.searchVolume),
    formatDifficulty(k.keywordDifficulty),
    formatCpc(k.cpc),
    formatCompetition(k.competition),
  ])

  autoTable(doc, {
    startY: 54,
    margin: { left: margin, right: margin, bottom: 40 },
    head: [["#", "Keyword Target", "Intent", "Volume", "KD %", "CPC", "Competition"]],
    body: allRows,
    theme: "plain",
    headStyles: {
      fillColor: C.navy,
      textColor: C.white,
      fontStyle: "bold",
      fontSize: 8,
      cellPadding: 5,
    },
    bodyStyles: {
      fontSize: 7.8,
      cellPadding: 4.2,
      textColor: C.ink,
      lineColor: C.border,
      lineWidth: 0.5,
    },
    alternateRowStyles: {
      fillColor: C.panel,
    },
    columnStyles: {
      0: { cellWidth: 22, halign: "center", textColor: C.muted },
      1: { cellWidth: contentW * 0.44, fontStyle: "bold" },
      2: { cellWidth: contentW * 0.13, halign: "center" },
      3: { cellWidth: contentW * 0.11, halign: "center", fontStyle: "bold" },
      4: { cellWidth: contentW * 0.09, halign: "center", fontStyle: "bold" },
      5: { cellWidth: contentW * 0.11, halign: "center" },
      6: { cellWidth: contentW * 0.12, halign: "center" },
    },
    didParseCell: (data) => {
      // Color code KD column
      if (data.section === "body" && data.column.index === 4) {
        const val = parseInt(data.cell.raw as string, 10)
        if (!isNaN(val) && val <= 35) {
          data.cell.styles.textColor = C.emerald
        }
      }
    },
  })

  // Add Footers to all pages
  const totalPages = (doc as any).internal.getNumberOfPages()
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(7.5)
    doc.setTextColor(...C.muted)
    doc.text(`${brandName.toUpperCase()} · KEYWORD INTELLIGENCE REPORT`, margin, H - 20)

    doc.setFont("helvetica", "normal")
    doc.text(`Page ${p} of ${totalPages}`, W - margin, H - 20, { align: "right" })
  }

  // Save / Download PDF
  const filename = `${sanitizeFileName(brandName)}-keyword-research-${sanitizeFileName(result.query)}.pdf`
  doc.save(filename)
}
