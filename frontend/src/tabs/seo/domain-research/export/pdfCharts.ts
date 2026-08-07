import type { DomainResearchData } from "../hooks/useDomainResearch"
import type { DOMAIN_EXPORT_THEME } from "./types"
import { formatCompactNum, formatPct } from "./types"

type PdfTheme = typeof DOMAIN_EXPORT_THEME["pdfColors"]

export function addDomainResearchPdfCharts(doc: any, data: DomainResearchData, C: PdfTheme, margin: number, W: number) {
  doc.addPage()
  doc.setFillColor(...C.amber)
  doc.rect(0, 0, W, 4, "F")
  doc.setFillColor(...C.navy)
  doc.rect(0, 4, W, 78, "F")
  doc.setFont("helvetica", "bold")
  doc.setFontSize(8)
  doc.setTextColor(...C.amber)
  doc.text("PERFORMANCE & RANKING VISUALS", margin, 25, { charSpace: 1.3 })
  doc.setFontSize(15)
  doc.setTextColor(...C.white)
  doc.text(`SEO trend summary: ${data.overview.target.domain}`, margin, 51)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(8.5)
  doc.setTextColor(203, 213, 225)
  doc.text("The same snapshot powers the dashboard charts and this export page.", margin, 69)

  const chartX = margin
  const chartY = 112
  const chartW = W - margin * 2
  const chartH = 230
  doc.setFillColor(...C.panel)
  doc.setDrawColor(...C.border)
  doc.roundedRect(chartX, chartY, chartW, chartH, 5, 5, "FD")
  doc.setFont("helvetica", "bold")
  doc.setFontSize(9)
  doc.setTextColor(...C.amber)
  doc.text("ORGANIC TRAFFIC TREND", chartX + 14, chartY + 20, { charSpace: 1 })

  const history = [...data.overview.history].sort((a, b) => a.date.localeCompare(b.date))
  const plotX = chartX + 36
  const plotY = chartY + 42
  const plotW = chartW - 58
  const plotH = 145
  const values = history.map(point => point.organic.traffic || 0)
  const max = Math.max(...values, 1)
  const min = Math.min(...values, 0)
  const span = Math.max(max - min, 1)
  doc.setDrawColor(...C.border)
  doc.setLineWidth(0.45)
  for (let i = 0; i <= 4; i++) {
    const gy = plotY + (plotH / 4) * i
    doc.line(plotX, gy, plotX + plotW, gy)
  }
  if (history.length > 1) {
    doc.setDrawColor(...C.blue)
    doc.setLineWidth(2)
    for (let i = 1; i < values.length; i++) {
      const x1 = plotX + (plotW * (i - 1)) / (values.length - 1)
      const x2 = plotX + (plotW * i) / (values.length - 1)
      const y1 = plotY + plotH - ((values[i - 1] - min) / span) * plotH
      const y2 = plotY + plotH - ((values[i] - min) / span) * plotH
      doc.line(x1, y1, x2, y2)
      doc.setFillColor(...C.blue)
      doc.circle(x2, y2, 2.4, "F")
    }
    doc.setFont("helvetica", "normal")
    doc.setFontSize(7)
    doc.setTextColor(...C.muted)
    history.forEach((point, index) => {
      if (index === 0 || index === history.length - 1 || index === Math.floor(history.length / 2)) {
        const x = plotX + (plotW * index) / Math.max(history.length - 1, 1)
        doc.text(new Date(point.date).toLocaleString("en-US", { month: "short", year: "2-digit" }), x, plotY + plotH + 16, { align: "center" })
      }
    })
  } else {
    doc.setFont("helvetica", "normal")
    doc.setFontSize(9)
    doc.setTextColor(...C.muted)
    doc.text("At least two history points are needed to show a trend.", plotX + plotW / 2, plotY + plotH / 2, { align: "center" })
  }
  doc.setFont("helvetica", "bold")
  doc.setFontSize(8)
  doc.setTextColor(...C.text)
  doc.text(`Current: ${formatCompactNum(data.overview.summary.organic.traffic)} organic visits / month`, chartX + 14, chartY + chartH - 18)

  const bandY = 392
  doc.setFont("helvetica", "bold")
  doc.setFontSize(9)
  doc.setTextColor(...C.amber)
  doc.text("RANKING DISTRIBUTION", margin, bandY)
  const dist = data.overview.rankingDistribution
  const bands = [
    ["Top 3", dist.top3, C.emerald],
    ["4-10", dist.positions4To10, C.blue],
    ["11-20", dist.positions11To20, [13, 148, 136]],
    ["21-50", dist.positions21To50, C.amber],
    ["51-100", dist.positions51To100, [225, 29, 72]],
  ] as const
  const maxBand = Math.max(...bands.map(([, value]) => value), 1)
  bands.forEach(([label, value, color], index) => {
    const y = bandY + 16 + index * 28
    doc.setFont("helvetica", "normal")
    doc.setFontSize(8)
    doc.setTextColor(...C.text)
    doc.text(label, margin, y + 9)
    doc.setFillColor(...C.border)
    doc.roundedRect(margin + 54, y, chartW - 130, 14, 3, 3, "F")
    doc.setFillColor(...color)
    doc.roundedRect(margin + 54, y, ((chartW - 130) * value) / maxBand, 14, 3, 3, "F")
    doc.setFont("helvetica", "bold")
    doc.text(formatCompactNum(value), W - margin, y + 10, { align: "right" })
  })

  const coverage = data.overview.summary.organic.keywords > 0
    ? (dist.top3 + dist.positions4To10) / data.overview.summary.organic.keywords
    : null
  doc.setFillColor(...C.blue)
  doc.roundedRect(margin, 570, chartW, 54, 5, 5, "F")
  doc.setFont("helvetica", "bold")
  doc.setFontSize(9)
  doc.setTextColor(...C.white)
  doc.text("KEY TAKEAWAY", margin + 12, 590)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(8.5)
  doc.text(`Page-one coverage is ${formatPct(coverage)}. Focus the next optimization cycle on page-two terms and the pages already earning the most traffic.`, margin + 12, 608, { maxWidth: chartW - 24 })
}
