import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import type { GeoArticleBrief, GeoArticleDraft } from "@/hooks/useGeoArticle"

const C = {
  navy: [15, 23, 42] as [number, number, number],
  ink: [24, 24, 27] as [number, number, number],
  text: [63, 63, 70] as [number, number, number],
  muted: [113, 113, 122] as [number, number, number],
  border: [228, 228, 231] as [number, number, number],
  panel: [244, 244, 245] as [number, number, number],
  soft: [250, 250, 250] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  green: [16, 185, 129] as [number, number, number],
  amber: [245, 158, 11] as [number, number, number],
}

function stripInline(value: string): string {
  return value
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/`(.+?)`/g, "$1")
}

function safeFilename(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9.]+/g, "-").replace(/^-|-$/g, "")
}

export function generateGeoArticlePdf(
  brandName: string,
  brief: GeoArticleBrief,
  article: GeoArticleDraft
) {
  const doc = new jsPDF({ format: "a4", unit: "pt" })
  const W = doc.internal.pageSize.width
  const H = doc.internal.pageSize.height
  const margin = 54
  const measure = W - margin * 2
  let y = 0

  function checkPage(needed: number) {
    if (y + needed > H - margin - 34) {
      doc.addPage()
      y = margin
    }
  }

  function sectionHeader(title: string) {
    y += 18
    checkPage(54)
    doc.setFillColor(...C.navy)
    doc.roundedRect(margin, y, measure, 34, 7, 7, "F")
    doc.setFont("helvetica", "bold")
    doc.setFontSize(10.5)
    doc.setTextColor(...C.white)
    doc.text(title.toUpperCase(), margin + 14, y + 22)
    y += 50
  }

  function paragraph(text: string) {
    checkPage(36)
    const lines = doc.splitTextToSize(stripInline(text), measure)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(12.5)
    doc.setTextColor(...C.text)
    doc.text(lines, margin, y)
    y += lines.length * 18 + 8
  }

  function bullet(text: string) {
    checkPage(34)
    const lines = doc.splitTextToSize(stripInline(text), measure - 22)
    doc.setFillColor(...C.ink)
    doc.circle(margin + 5, y - 4, 2.3, "F")
    doc.setFont("helvetica", "normal")
    doc.setFontSize(12.5)
    doc.setTextColor(...C.text)
    doc.text(lines, margin + 18, y)
    y += lines.length * 18 + 7
  }

  function numbered(index: string, text: string) {
    checkPage(34)
    const lines = doc.splitTextToSize(stripInline(text), measure - 30)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(12.5)
    doc.setTextColor(...C.ink)
    doc.text(`${index}.`, margin, y)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(...C.text)
    doc.text(lines, margin + 30, y)
    y += lines.length * 18 + 7
  }

  doc.setFillColor(...C.navy)
  doc.rect(0, 0, W, 132, "F")

  doc.setFont("helvetica", "bold")
  doc.setFontSize(10)
  doc.setTextColor(...C.green)
  doc.text(`${brandName.toUpperCase()} - GEO ARTICLE`, margin, 32)

  const title = article.title ?? brief.recommended_article.title
  doc.setFont("helvetica", "bold")
  doc.setFontSize(25)
  doc.setTextColor(...C.white)
  doc.text(doc.splitTextToSize(title, measure - 96).slice(0, 2), margin, 64)

  doc.setFont("helvetica", "normal")
  doc.setFontSize(11)
  doc.setTextColor(180, 188, 204)
  doc.text(
    doc.splitTextToSize(article.meta_description ?? brief.recommended_article.priority_reason, measure - 96).slice(0, 2),
    margin,
    100
  )

  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)
  doc.setTextColor(148, 163, 184)
  doc.text(new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }), W - margin, 32, { align: "right" })

  const action = brief.recommended_article.action
  const badgeColor = action === "CREATE" ? C.green : action === "REFRESH" ? C.amber : [148, 163, 184] as [number, number, number]
  doc.setFillColor(30, 41, 59)
  doc.roundedRect(W - margin - 84, 50, 84, 22, 5, 5, "F")
  doc.setFont("helvetica", "bold")
  doc.setFontSize(9)
  doc.setTextColor(...badgeColor)
  doc.text(action, W - margin - 42, 65, { align: "center" })

  y = 156

  const m = brief.metrics
  const kpis = [
    { label: "Visibility", value: `${m.own_visibility}%`, sub: "of AI answers" },
    { label: "Position", value: m.own_avg_position ? `#${m.own_avg_position}` : "-", sub: "when mentioned" },
    { label: "Sentiment", value: m.own_avg_sentiment ?? "-", sub: "AI tone score" },
    { label: "Evidence", value: String(m.evidence_count), sub: `${m.days_analyzed}d analysed` },
  ]

  const gap = 10
  const kpiW = (measure - gap * 3) / 4
  kpis.forEach((kpi, index) => {
    const x = margin + index * (kpiW + gap)
    doc.setDrawColor(...C.border)
    doc.setLineWidth(1)
    doc.roundedRect(x, y, kpiW, 60, 7, 7, "S")
    doc.setFont("helvetica", "bold")
    doc.setFontSize(8.5)
    doc.setTextColor(...C.muted)
    doc.text(kpi.label.toUpperCase(), x + 11, y + 18)
    doc.setFontSize(21)
    doc.setTextColor(...C.ink)
    doc.text(String(kpi.value), x + 11, y + 41)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(8.5)
    doc.setTextColor(...C.muted)
    doc.text(kpi.sub, x + 11, y + 54)
  })

  y += 88

  const markdown = article.article_markdown ?? ""
  const mdLines = markdown.split("\n")
  let pendingTableHeaders: string[] = []
  let pendingTableRows: string[][] = []
  let inTable = false

  function flushTable() {
    if (!pendingTableHeaders.length) return
    checkPage(140)
    autoTable(doc, {
      startY: y,
      head: [pendingTableHeaders],
      body: pendingTableRows,
      margin: { left: margin, right: margin },
      tableWidth: measure,
      styles: {
        font: "helvetica",
        fontSize: 11,
        textColor: C.ink,
        cellPadding: 7,
      },
      headStyles: {
        fillColor: C.navy,
        textColor: C.white,
        fontStyle: "bold",
        fontSize: 10,
        halign: "left",
      },
      alternateRowStyles: {
        fillColor: C.soft,
      },
      theme: "striped",
    })
    y = ((doc as any).lastAutoTable?.finalY ?? y) + 20
    pendingTableHeaders = []
    pendingTableRows = []
    inTable = false
  }

  for (const line of mdLines) {
    const trimmed = line.trim()

    if (trimmed.startsWith("|")) {
      inTable = true
      const cells = trimmed.split("|").slice(1, -1).map(cell => stripInline(cell.trim()))
      if (cells.every(cell => /^[-:]+$/.test(cell))) continue
      if (!pendingTableHeaders.length) pendingTableHeaders = cells
      else pendingTableRows.push(cells)
      continue
    }

    if (inTable) flushTable()
    if (!trimmed) {
      y += 10
      continue
    }

    if (trimmed.startsWith("# ")) {
      sectionHeader(stripInline(trimmed.slice(2)))
      continue
    }

    if (trimmed.startsWith("## ")) {
      y += 16
      checkPage(52)
      doc.setFont("helvetica", "bold")
      doc.setFontSize(18)
      doc.setTextColor(...C.ink)
      const lines = doc.splitTextToSize(stripInline(trimmed.slice(3)), measure)
      doc.text(lines, margin, y)
      y += lines.length * 22 + 6
      doc.setDrawColor(...C.border)
      doc.line(margin, y, W - margin, y)
      y += 14
      continue
    }

    if (trimmed.startsWith("### ")) {
      y += 10
      checkPage(38)
      doc.setFont("helvetica", "bold")
      doc.setFontSize(14)
      doc.setTextColor(...C.ink)
      const lines = doc.splitTextToSize(stripInline(trimmed.slice(4)), measure)
      doc.text(lines, margin, y)
      y += lines.length * 18 + 8
      continue
    }

    if (trimmed.startsWith("#### ")) {
      y += 8
      checkPage(30)
      doc.setFont("helvetica", "bold")
      doc.setFontSize(12.5)
      doc.setTextColor(...C.muted)
      const lines = doc.splitTextToSize(stripInline(trimmed.slice(5)), measure)
      doc.text(lines, margin, y)
      y += lines.length * 16 + 6
      continue
    }

    if (/^[-*] /.test(trimmed)) {
      bullet(trimmed.replace(/^[-*] /, ""))
      continue
    }

    const numberedMatch = trimmed.match(/^(\d+)\. (.+)$/)
    if (numberedMatch) {
      numbered(numberedMatch[1], numberedMatch[2])
      continue
    }

    if (/^---+$/.test(trimmed)) {
      y += 10
      doc.setDrawColor(...C.border)
      doc.line(margin, y, W - margin, y)
      y += 18
      continue
    }

    paragraph(trimmed)
  }

  if (inTable) flushTable()

  if (article.faq?.length) {
    y += 8
    sectionHeader("Frequently Asked Questions")

    for (const item of article.faq) {
      const qLines = doc.splitTextToSize(stripInline(item.question), measure - 36)
      const aLines = doc.splitTextToSize(stripInline(item.answer), measure - 36)
      const boxH = 22 + qLines.length * 17 + 8 + aLines.length * 17 + 18

      checkPage(boxH + 12)
      doc.setFillColor(...C.panel)
      doc.setDrawColor(...C.border)
      doc.roundedRect(margin, y, measure, boxH, 8, 8, "FD")
      doc.setFillColor(...C.navy)
      doc.roundedRect(margin, y, 5, boxH, 2, 2, "F")

      doc.setFont("helvetica", "bold")
      doc.setFontSize(12.5)
      doc.setTextColor(...C.ink)
      doc.text(qLines, margin + 18, y + 22)

      doc.setFont("helvetica", "normal")
      doc.setFontSize(11.5)
      doc.setTextColor(...C.text)
      doc.text(aLines, margin + 18, y + 22 + qLines.length * 17 + 8)
      y += boxH + 12
    }
  }

  if (article.needs_data?.length) {
    y += 8
    const boxH = 42 + article.needs_data.length * 18
    checkPage(boxH + 10)
    doc.setFillColor(255, 251, 235)
    doc.setDrawColor(252, 211, 77)
    doc.roundedRect(margin, y, measure, boxH, 8, 8, "FD")
    doc.setFont("helvetica", "bold")
    doc.setFontSize(11)
    doc.setTextColor(146, 64, 14)
    doc.text("Needs data - fill these before publishing", margin + 14, y + 22)
    y += 38

    for (const item of article.needs_data) {
      doc.setFont("helvetica", "normal")
      doc.setFontSize(11.5)
      doc.text(`- ${stripInline(item)}`, margin + 18, y)
      y += 18
    }
  }

  const totalPages = (doc as any).internal.getNumberOfPages()
  for (let page = 1; page <= totalPages; page++) {
    doc.setPage(page)
    doc.setDrawColor(...C.border)
    doc.line(margin, H - 36, W - margin, H - 36)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(9)
    doc.setTextColor(...C.muted)
    doc.text(`AI Visibility - ${brandName} - ${new Date().toLocaleDateString()}`, margin, H - 20)
    doc.text(`Page ${page} of ${totalPages}`, W - margin, H - 20, { align: "right" })
  }

  const slug = safeFilename(`${brandName}-geo-article-${new Date().toISOString().slice(0, 10)}.pdf`)
  doc.save(slug)
}
