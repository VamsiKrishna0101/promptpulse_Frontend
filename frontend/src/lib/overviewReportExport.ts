import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import ExcelJS from "exceljs"
import { api } from "@/lib/api"
import type { Project } from "@/hooks/useProjects"
import type { CompetitorRow, DashboardData, SourceRow } from "@/hooks/useDashboard"
import type { TimeSeriesDay } from "@/hooks/useVisibilityTimeSeries"
import type { RecentChat } from "@/hooks/useRecentChats"

type ReportData = {
  dashboard: DashboardData | null
  sources: SourceRow[]
  competitors: CompetitorRow[]
  timeSeries: TimeSeriesDay[]
  chats: RecentChat[]
}

type BrandSnapshot = {
  name: string
  visibility: number
  sentiment: number | null
  position: number | null
}

const XL = {
  navy: "FF0F172A",
  navyMid: "FF1E293B",
  blue: "FF3B82F6",
  muted: "FF94A3B8",
  border: "FFE2E8F0",
  stripe: "FFF8FAFC",
  white: "FFFFFFFF",
  text: "FF1E293B",
  sectionBg: "FFEFF6FF",
}

const PDF_COLORS = {
  navy: "#0F172A",
  blue: "#3B82F6",
  blueLight: "#EFF6FF",
  text: "#1E293B",
  muted: "#64748B",
  border: "#E2E8F0",
  stripe: "#F8FAFC",
  white: "#FFFFFF",
}

function prettify(s: string | null) {
  if (!s) return "Other"
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase().replace(/_/g, " ")
}

// ─── PDF Generation ─────────────────────────────────────────────────────────

export async function exportOverviewPdf(project: Project | null, queryString: string) {
  if (!project) return

  const report = await loadOverviewReport(project.id, queryString)
  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" })
  const W = doc.internal.pageSize.getWidth()
  const margin = 40
  const brand = buildBrandRows(project, report)[0]
  const dateStr = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(new Date())

  // Header Bar
  doc.setFillColor(PDF_COLORS.navy)
  doc.rect(0, 0, W, 88, "F")

  doc.setTextColor(PDF_COLORS.blue)
  doc.setFontSize(9)
  doc.setFont("helvetica", "bold")
  doc.text(project.brand_name.toUpperCase(), margin, 32)

  doc.setTextColor(PDF_COLORS.white)
  doc.setFontSize(22)
  doc.text("AI Visibility Overview", margin, 52)

  doc.setTextColor("#94A3B8")
  doc.setFontSize(9)
  doc.setFont("helvetica", "normal")
  doc.text("Brand visibility, competitive landscape & source intelligence", margin, 72)

  doc.setTextColor("#64748B")
  doc.setFontSize(8.5)
  doc.text(dateStr, W - margin, 32, { align: "right" })

  let y = 106

  // Section: Executive Summary
  y = drawSectionHeader(doc, "Executive Summary", margin, y, W)
  
  // KPI Cards
  const cards = [
    { label: "VISIBILITY", value: `${brand?.visibility.toFixed(1) ?? "0"}%`, desc: "Brand share" },
    { label: "POSITION", value: brand?.position == null ? "-" : `#${brand.position.toFixed(1)}`, desc: "Average rank" },
    { label: "SENTIMENT", value: brand?.sentiment == null ? "-" : brand.sentiment.toFixed(0), desc: "Response tone" },
    { label: "SOURCES", value: String(report.sources.length), desc: "Cited domains" }
  ]
  
  const cardW = (W - margin * 2 - 30) / 4
  cards.forEach((c, i) => {
    const cx = margin + i * (cardW + 10)
    doc.setFillColor(PDF_COLORS.white)
    doc.setDrawColor(PDF_COLORS.border)
    doc.setLineWidth(0.5)
    doc.roundedRect(cx, y, cardW, 60, 4, 4, "FD")
    
    doc.setFillColor(PDF_COLORS.blue)
    doc.rect(cx, y, cardW, 2, "F")
    
    doc.setTextColor(PDF_COLORS.muted)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(7.5)
    doc.text(c.label, cx + 8, y + 14)
    
    doc.setTextColor(PDF_COLORS.navy)
    doc.setFontSize(20)
    doc.text(c.value, cx + 8, y + 36)
    
    doc.setTextColor(PDF_COLORS.muted)
    doc.setFontSize(7.5)
    doc.setFont("helvetica", "normal")
    doc.text(c.desc, cx + 8, y + 50)
  })
  
  y += 80

  // Section: Brand Leaderboard
  y = drawSectionHeader(doc, "Brand Leaderboard", margin, y, W)
  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [["#", "Brand", "Visibility", "Avg. Position", "Avg. Sentiment"]],
    body: buildBrandRows(project, report).map((row, index) => [
      String(index + 1),
      row.name,
      `${row.visibility.toFixed(1)}%`,
      row.position == null ? "-" : `#${row.position.toFixed(1)}`,
      row.sentiment == null ? "-" : row.sentiment.toFixed(0),
    ]),
    theme: "plain",
    headStyles: { fillColor: PDF_COLORS.navy, textColor: PDF_COLORS.white, fontStyle: "bold", fontSize: 8, cellPadding: 6 },
    bodyStyles: { textColor: PDF_COLORS.text, fontSize: 8.5, cellPadding: 6 },
    alternateRowStyles: { fillColor: PDF_COLORS.stripe },
    columnStyles: {
      0: { cellWidth: 30, halign: "center" },
      1: { cellWidth: 200 },
      2: { halign: "center" },
      3: { halign: "center" },
      4: { halign: "center" },
    },
  })
  
  y = (doc as any).lastAutoTable.finalY + 24

  // Section: Top Sources
  y = drawSectionHeader(doc, "Top Influencing Sources", margin, y, W)
  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [["#", "Domain", "Type", "Used %", "Avg. Citations"]],
    body: report.sources.slice(0, 15).map((source, index) => [
      String(index + 1),
      source.domain,
      prettify(source.source_type),
      `${((source.used_percentage ?? source.usage_percentage) ?? 0).toFixed(0)}%`,
      source.avg_citations == null ? "-" : source.avg_citations.toFixed(1),
    ]),
    theme: "plain",
    headStyles: { fillColor: PDF_COLORS.navy, textColor: PDF_COLORS.white, fontStyle: "bold", fontSize: 8, cellPadding: 6 },
    bodyStyles: { textColor: PDF_COLORS.text, fontSize: 8.5, cellPadding: 6 },
    alternateRowStyles: { fillColor: PDF_COLORS.stripe },
    columnStyles: {
      0: { cellWidth: 30, halign: "center" },
      1: { cellWidth: 200 },
      2: { halign: "center" },
      3: { halign: "center" },
      4: { halign: "center" },
    },
  })

  // Add footer to all pages
  const totalPages = (doc.internal as any).getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setDrawColor(PDF_COLORS.border)
    doc.setLineWidth(0.5)
    doc.line(margin, doc.internal.pageSize.getHeight() - 28, W - margin, doc.internal.pageSize.getHeight() - 28)
    
    doc.setTextColor(PDF_COLORS.muted)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(7.5)
    doc.text(`Confidential — Generated for ${project.brand_name}`, margin, doc.internal.pageSize.getHeight() - 16)
    
    doc.setFont("helvetica", "bold")
    doc.text("PromptPulse", W / 2, doc.internal.pageSize.getHeight() - 16, { align: "center" })
    
    doc.setFont("helvetica", "normal")
    doc.text(`Page ${i} of ${totalPages}`, W - margin, doc.internal.pageSize.getHeight() - 16, { align: "right" })
  }

  doc.save(`${slug(project.brand_name)}-visibility-report.pdf`)
}

function drawSectionHeader(doc: jsPDF, title: string, margin: number, y: number, W: number) {
  doc.setFillColor(PDF_COLORS.blueLight)
  doc.rect(margin, y, W - margin * 2, 24, "F")
  doc.setFillColor(PDF_COLORS.blue)
  doc.rect(margin, y, 3, 24, "F")
  
  doc.setTextColor(PDF_COLORS.blue)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(9)
  doc.text(title.toUpperCase(), margin + 12, y + 16)
  
  return y + 36
}

// ─── Excel / CSV Generation ──────────────────────────────────────────────────

export async function exportOverviewCsv(project: Project | null, queryString: string) {
  if (!project) return

  const report = await loadOverviewReport(project.id, queryString)
  const brandRows = buildBrandRows(project, report)
  
  const wb = new ExcelJS.Workbook()
  wb.creator = "PromptPulse"
  
  // Data Sheet
  const ws = wb.addWorksheet("Data", { properties: { tabColor: { argb: XL.navy } } })
  ws.columns = [
    { key: "section", width: 16 },
    { key: "item", width: 30 },
    { key: "value", width: 18, style: { alignment: { horizontal: "right" } } },
    { key: "detail", width: 48 },
    { key: "rank", width: 6, style: { alignment: { horizontal: "center" } } },
  ]
  
  const hRow = ws.getRow(1)
  hRow.height = 28
  ;["Section", "Item", "Value", "Detail", "#"].forEach((h, i) => {
    const cell = hRow.getCell(i + 1)
    cell.value = h
    cell.font = { name: "Calibri", size: 10, bold: true, color: { argb: XL.white } }
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: XL.navy } }
    cell.border = { bottom: { style: "medium", color: { argb: XL.blue } } }
    cell.alignment = { vertical: "middle", indent: 1 }
  })

  // Cover Sheet
  const meta = wb.addWorksheet("Report Info", { properties: { tabColor: { argb: XL.blue } } })
  meta.getColumn(1).width = 28
  meta.getColumn(2).width = 44
  
  meta.mergeCells("A1:B1")
  const titleCell = meta.getCell("A1")
  titleCell.value = `${project.brand_name}  ·  AI Visibility Overview`
  titleCell.font = { name: "Calibri", size: 16, bold: true, color: { argb: XL.white } }
  titleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: XL.navy } }
  titleCell.alignment = { vertical: "middle", horizontal: "left", indent: 1 }
  meta.getRow(1).height = 36

  const generatedDate = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "UTC" }).format(new Date()) + " UTC"
  
  const metaRows = [
    ["Generated", generatedDate],
    ["Brand", project.brand_name],
    ["Report Type", "AI Visibility Overview"],
    ["Filters", queryString || "All time, all models, all topics"],
    ["Powered by", "PromptPulse"],
  ]
  
  metaRows.forEach(([k, v], i) => {
    const row = meta.getRow(i + 2)
    row.height = 22
    row.getCell(1).value = k
    row.getCell(1).font = { name: "Calibri", size: 10, bold: true, color: { argb: XL.muted } }
    row.getCell(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: XL.stripe } }
    row.getCell(1).alignment = { vertical: "middle", indent: 1 }
    
    row.getCell(2).value = v
    row.getCell(2).font = { name: "Calibri", size: 10, color: { argb: XL.text } }
    row.getCell(2).alignment = { vertical: "middle", indent: 1 }
  })



  let rowIdx = 2

  const appendSection = (name: string, data: any[]) => {
    const secRow = ws.getRow(rowIdx)
    secRow.height = 22
    ws.mergeCells(`A${rowIdx}:E${rowIdx}`)
    secRow.getCell(1).value = name.toUpperCase()
    secRow.getCell(1).font = { name: "Calibri", size: 9, bold: true, color: { argb: XL.blue } }
    secRow.getCell(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: XL.sectionBg } }
    secRow.getCell(1).alignment = { vertical: "middle", indent: 2 }
    rowIdx++

    data.forEach((r, i) => {
      const row = ws.getRow(rowIdx)
      row.height = 20
      const isStripe = i % 2 === 0
      
      row.getCell(1).value = r.section
      row.getCell(2).value = r.item
      row.getCell(3).value = r.value
      row.getCell(4).value = r.detail
      row.getCell(5).value = r.rank

      for (let c = 1; c <= 5; c++) {
        const cell = row.getCell(c)
        cell.font = { name: "Calibri", size: 10, color: { argb: XL.text } }
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: isStripe ? XL.stripe : XL.white } }
        cell.border = { bottom: { style: "hair", color: { argb: XL.border } } }
      }
      rowIdx++
    })
    rowIdx++
  }

  appendSection("Summary", [
    { section: "Summary", item: "Brand Visibility", value: `${brandRows[0]?.visibility.toFixed(1) ?? "0"}%`, detail: "Share of AI answers mentioning the brand", rank: "" },
    { section: "Summary", item: "Avg. Position", value: brandRows[0]?.position == null ? "-" : brandRows[0].position.toFixed(1), detail: "Average rank when mentioned", rank: "" },
    { section: "Summary", item: "Avg. Sentiment", value: brandRows[0]?.sentiment == null ? "-" : brandRows[0].sentiment.toFixed(0), detail: "Weighted model response sentiment", rank: "" },
    { section: "Summary", item: "Unique Source Domains", value: report.sources.length, detail: "Distinct domains influencing AI answers", rank: "" }
  ])

  appendSection("Brands", brandRows.map((r, i) => ({
    section: "Brands",
    item: r.name,
    value: `${r.visibility.toFixed(1)}%`,
    detail: `Pos: ${r.position?.toFixed(1) ?? "–"} | Sent: ${r.sentiment?.toFixed(0) ?? "–"}`,
    rank: i + 1
  })))

  appendSection("Sources", report.sources.slice(0, 15).map((r, i) => ({
    section: "Sources",
    item: r.domain,
    value: `${((r.used_percentage ?? r.usage_percentage) ?? 0).toFixed(0)}%`,
    detail: `${prettify(r.source_type)} | Avg citations: ${r.avg_citations?.toFixed(1) ?? "–"}`,
    rank: i + 1
  })))

  ws.views = [{ state: "frozen", xSplit: 0, ySplit: 1, topLeftCell: "A2", activeCell: "A2" }]
  ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: 5 } }

  const buffer = await wb.xlsx.writeBuffer()
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `${slug(project.brand_name)}-visibility-export.xlsx`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

async function loadOverviewReport(projectId: string, queryString: string): Promise<ReportData> {
  const qs = queryString || ""
  const [dashboard, sources, tracked, discovered, timeSeries, chats] = await Promise.allSettled([
    api.get<DashboardData>(`/dashboard/${projectId}${qs}`),
    api.get<SourceRow[]>(`/sources/${projectId}/top${qs}`),
    api.get<CompetitorRow[]>(`/brands/${projectId}/tracked`),
    api.get<CompetitorRow[]>(`/brands/${projectId}/discovered`),
    api.get<TimeSeriesDay[]>(`/dashboard/${projectId}/timeseries${qs}`),
    api.get<RecentChat[]>(`/dashboard/${projectId}/recent-chats${qs}`),
  ])

  const trackedRows = tracked.status === "fulfilled" ? tracked.value.data : []
  const discoveredRows = discovered.status === "fulfilled" ? discovered.value.data : []

  return {
    dashboard: dashboard.status === "fulfilled" ? dashboard.value.data : null,
    sources: sources.status === "fulfilled" ? sources.value.data : [],
    competitors: trackedRows.length ? trackedRows : discoveredRows,
    timeSeries: timeSeries.status === "fulfilled" ? timeSeries.value.data : [],
    chats: chats.status === "fulfilled" ? chats.value.data : [],
  }
}

function buildBrandRows(project: Project, report: ReportData): BrandSnapshot[] {
  const currentBrand: BrandSnapshot = {
    name: project.brand_name,
    visibility: report.dashboard?.brand?.visibility ?? 0,
    sentiment: report.dashboard?.brand?.avg_sentiment ?? null,
    position: report.dashboard?.brand?.avg_position ?? null,
  }

  const compBrands: BrandSnapshot[] = report.competitors.map(c => ({
    name: c.name ?? "Unknown",
    visibility: c.visibility ?? 0,
    sentiment: c.avg_sentiment ?? null,
    position: c.avg_position ?? null,
  }))

  const all = [currentBrand, ...compBrands].filter(b => b.visibility > 0)
  return all.sort((a, b) => b.visibility - a.visibility)
}

function slug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
}
