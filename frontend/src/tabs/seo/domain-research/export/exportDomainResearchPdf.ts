import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import type { DomainResearchData } from "../hooks/useDomainResearch"
import {
  DOMAIN_EXPORT_THEME as THEME,
  formatCompactNum,
  formatMoneyValue,
  formatPct,
  sanitizeDomainFilename,
} from "./types"
import { addDomainResearchPdfCharts } from "./pdfCharts"

export async function exportDomainResearchPdf(brandName: string, data: DomainResearchData) {
  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" })
  const W = doc.internal.pageSize.width // 595.28 pt
  const H = doc.internal.pageSize.height // 841.89 pt
  const margin = 40
  const contentW = W - margin * 2

  const C = THEME.pdfColors
  const { overview } = data
  const target = overview.target
  const summary = overview.summary.organic

  // -------------------------------------------------------------------------
  // Page 1: Header + 4 Hero KPI Cards + Position Distribution + Top Keywords
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
  doc.text(`${brandName.toUpperCase()} · DOMAIN INTELLIGENCE & SEO AUDIT`, margin, 24, { charSpace: 1.5 })

  // Title
  doc.setFont("helvetica", "bold")
  doc.setFontSize(16)
  doc.setTextColor(...C.white)
  doc.text(`Search Performance Overview: ${target.domain}`, margin, 46, { maxWidth: contentW - 80 })

  // Subtitle
  doc.setFont("helvetica", "normal")
  doc.setFontSize(8.5)
  doc.setTextColor(203, 213, 225)
  const subtitle = `Market: ${target.locationName} (${target.countryIsoCode.toUpperCase()}) · Language: ${target.languageName} · History: ${overview.availableHistoryMonths} Months`
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
      label: "ORGANIC TRAFFIC",
      value: `${formatCompactNum(summary.traffic)}/mo`,
      sub: "Monthly visits",
      color: C.emerald,
    },
    {
      label: "ORGANIC KEYWORDS",
      value: formatCompactNum(summary.keywords),
      sub: `${formatCompactNum(overview.rankingDistribution.top3)} in Top 3`,
      color: C.blue,
    },
    {
      label: "TRAFFIC VALUE",
      value: formatMoneyValue(summary.trafficValueUsd),
      sub: "Ad spend equivalent",
      color: C.amber,
    },
    {
      label: "TOP 10 COVERAGE",
      value: formatPct(summary.keywords ? (overview.rankingDistribution.top3 + overview.rankingDistribution.positions4To10) / summary.keywords : null),
      sub: "Page 1 rankings",
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
  // Ranking Distribution
  // -------------------------------------------------------------------------
  doc.setFont("helvetica", "bold")
  doc.setFontSize(9)
  doc.setTextColor(...C.amber)
  doc.text("ORGANIC RANKING DISTRIBUTION", margin, y, { charSpace: 1 })

  y += 8

  const dist = overview.rankingDistribution
  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [["Top 3 Positions", "Positions 4–10", "Positions 11–20", "Positions 21–50", "Positions 51–100"]],
    body: [
      [
        formatCompactNum(dist.top3),
      formatCompactNum(dist.positions4To10),
      formatCompactNum(dist.positions11To20),
      formatCompactNum(dist.positions21To50),
      formatCompactNum(dist.positions51To100),
      ],
    ],
    theme: "plain",
    headStyles: {
      fillColor: C.navy,
      textColor: C.white,
      fontStyle: "bold",
      fontSize: 8,
      cellPadding: 5,
      halign: "center",
    },
    bodyStyles: {
      fontSize: 9,
      cellPadding: 6,
      textColor: C.ink,
      fontStyle: "bold",
      halign: "center",
      lineColor: C.border,
      lineWidth: 0.5,
    },
  })

  y = (doc as any).lastAutoTable.finalY + 16

  // -------------------------------------------------------------------------
  // Top Organic Keywords Table
  // -------------------------------------------------------------------------
  doc.setFont("helvetica", "bold")
  doc.setFontSize(9)
  doc.setTextColor(...C.amber)
  doc.text("TOP PERFORMING ORGANIC KEYWORDS", margin, y, { charSpace: 1 })

  y += 8

  const kwRows = (data.organicKeywords?.keywords || []).slice(0, 8).map((k) => [
    k.keyword,
    k.position == null ? "—" : `#${k.position}`,
    formatCompactNum(k.searchVolume),
    `${Math.round(k.difficulty ?? 0)}%`,
    `$${Number(k.cpcUsd ?? 0).toFixed(2)}`,
    formatPct(data.organicKeywords.summary.estimatedTraffic ? (k.traffic / data.organicKeywords.summary.estimatedTraffic) : null),
  ])

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [["Keyword Target", "Rank", "Volume", "KD %", "CPC", "Traffic %"]],
    body: kwRows,
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
      0: { cellWidth: contentW * 0.44, fontStyle: "bold" },
      1: { cellWidth: contentW * 0.11, halign: "center", fontStyle: "bold", textColor: C.blue },
      2: { cellWidth: contentW * 0.13, halign: "center" },
      3: { cellWidth: contentW * 0.11, halign: "center" },
      4: { cellWidth: contentW * 0.11, halign: "center" },
      5: { cellWidth: contentW * 0.10, halign: "center", fontStyle: "bold" },
    },
  })

  // -------------------------------------------------------------------------
  // Page 2: Top Organic Pages & Competitors
  // -------------------------------------------------------------------------
  doc.addPage()

  doc.setFillColor(...C.amber)
  doc.rect(0, 0, W, 3, "F")

  doc.setFont("helvetica", "bold")
  doc.setFontSize(8.5)
  doc.setTextColor(...C.amber)
  doc.text("CONTENT & COMPETITIVE INTELLIGENCE", margin, 26, { charSpace: 1.5 })

  doc.setFont("helvetica", "bold")
  doc.setFontSize(13)
  doc.setTextColor(...C.ink)
  doc.text(`High-Traffic Pages & Market Competitors: ${target.domain}`, margin, 42)

  y = 56

  // Top Pages
  doc.setFont("helvetica", "bold")
  doc.setFontSize(9)
  doc.setTextColor(...C.navy)
  doc.text("TOP ORGANIC TRAFFIC PAGES", margin, y)

  y += 8

  const pRows = (data.topPages?.pages || []).slice(0, 8).map((p) => [
    p.url.replace(/^https?:\/\//, ""),
    formatCompactNum(p.estimatedTraffic),
    formatPct(summary.traffic ? (p.estimatedTraffic / summary.traffic) : null),
    formatCompactNum(p.rankingKeywords),
    p.top10Keywords ? `${formatCompactNum(p.top10Keywords)} in Top 10` : "—",
  ])

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [["Page URL", "Traffic", "Traffic %", "Ranked KWs", "Top Keyword"]],
    body: pRows,
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
      0: { cellWidth: contentW * 0.40, fontStyle: "bold" },
      1: { cellWidth: contentW * 0.13, halign: "center", fontStyle: "bold" },
      2: { cellWidth: contentW * 0.12, halign: "center" },
      3: { cellWidth: contentW * 0.13, halign: "center" },
      4: { cellWidth: contentW * 0.22 },
    },
  })

  y = (doc as any).lastAutoTable.finalY + 18

  // Competitors
  doc.setFont("helvetica", "bold")
  doc.setFontSize(9)
  doc.setTextColor(...C.navy)
  doc.text("TOP ORGANIC SEARCH COMPETITORS", margin, y)

  y += 8

  const cRows = (data.competitors?.competitors || []).slice(0, 8).map((c) => [
    c.domain,
    formatCompactNum(c.sharedKeywords),
    formatCompactNum(c.totalKeywords),
    formatCompactNum(c.estimatedTraffic),
    formatPct(c.sharedCoveragePercent),
  ])

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [["Competitor Domain", "Common KWs", "Total KWs", "Organic Traffic", "Overlap %"]],
    body: cRows,
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
      0: { cellWidth: contentW * 0.36, fontStyle: "bold" },
      1: { cellWidth: contentW * 0.16, halign: "center" },
      2: { cellWidth: contentW * 0.16, halign: "center" },
      3: { cellWidth: contentW * 0.18, halign: "center", fontStyle: "bold" },
      4: { cellWidth: contentW * 0.14, halign: "center" },
    },
  })

  addDomainResearchPdfCharts(doc, data, C, margin, W)

  // Footers on all pages
  const totalPages = (doc as any).internal.getNumberOfPages()
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(7.5)
    doc.setTextColor(...C.muted)
    doc.text(`${brandName.toUpperCase()} · DOMAIN INTELLIGENCE REPORT`, margin, H - 20)

    doc.setFont("helvetica", "normal")
    doc.text(`Page ${p} of ${totalPages}`, W - margin, H - 20, { align: "right" })
  }

  const filename = `${sanitizeDomainFilename(target.domain)}-domain-intelligence.pdf`
  doc.save(filename)
}
