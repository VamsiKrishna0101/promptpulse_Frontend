import type PptxGenJS from "pptxgenjs"
import { OVERVIEW_PPTX as T } from "./overviewPptxTheme"

type Slide = ReturnType<PptxGenJS["addSlide"]>

export function addOverviewBackground(slide: Slide) {
  slide.background = { color: T.colors.paper }
  slide.addShape("rect", { x: 0, y: 0, w: T.width, h: T.height, fill: { color: T.colors.paper }, line: { color: T.colors.paper } })
  slide.addShape("arc", { x: 10.4, y: -1.45, w: 4.4, h: 4.4, rotate: 15, fill: { color: "DDF2FF", transparency: 18 }, line: { color: "DDF2FF", transparency: 100 } })
}

export function addOverviewHeader(slide: Slide, eyebrow: string, title: string, subtitle?: string) {
  slide.addText(eyebrow.toUpperCase(), { x: 0.65, y: 0.48, w: 4.8, h: 0.18, fontFace: T.font, fontSize: 8, bold: true, color: T.colors.blue, charSpacing: 1.2, margin: 0 })
  slide.addText(title, { x: 0.65, y: 0.76, w: 9.8, h: 0.42, fontFace: T.font, fontSize: 25, bold: true, color: T.colors.ink, margin: 0, fit: "shrink" })
  if (subtitle) slide.addText(subtitle, { x: 0.67, y: 1.23, w: 10.8, h: 0.34, fontFace: T.font, fontSize: 10.5, color: T.colors.muted, margin: 0, fit: "shrink" })
}

export function addOverviewFooter(slide: Slide, brandName: string, period: string) {
  slide.addText(`${brandName} · Confidential`, { x: 0.65, y: 7.12, w: 4, h: 0.14, fontFace: T.font, fontSize: 7, color: T.colors.faint, margin: 0 })
  slide.addText(`Powered by PromptPulse · ${period}`, { x: 8.2, y: 7.12, w: 4.45, h: 0.14, fontFace: T.font, fontSize: 7, color: T.colors.faint, margin: 0, align: "right" })
}

export function addOverviewCard(slide: Slide, x: number, y: number, w: number, h: number, fill = T.colors.white) {
  slide.addShape("roundRect", { x, y, w, h, rectRadius: 0.06, fill: { color: fill }, line: { color: T.colors.border }, shadow: { type: "outer", opacity: 0.08, blur: 1, angle: 45 } })
}

export function addOverviewMetric(slide: Slide, x: number, y: number, w: number, label: string, value: string, detail: string, accent = T.colors.sky) {
  addOverviewCard(slide, x, y, w, 1.05)
  slide.addShape("rect", { x, y, w, h: 0.05, fill: { color: accent }, line: { color: accent } })
  slide.addText(label.toUpperCase(), { x: x + 0.16, y: y + 0.17, w: w - 0.32, h: 0.15, fontFace: T.font, fontSize: 7, bold: true, color: T.colors.muted, margin: 0, fit: "shrink" })
  slide.addText(value, { x: x + 0.16, y: y + 0.39, w: w - 0.32, h: 0.3, fontFace: T.font, fontSize: 19, bold: true, color: T.colors.ink, margin: 0, fit: "shrink" })
  slide.addText(detail, { x: x + 0.16, y: y + 0.78, w: w - 0.32, h: 0.14, fontFace: T.font, fontSize: 6.8, color: T.colors.faint, margin: 0, fit: "shrink" })
}

export function metricValue(metric: { value: number; format: string }) {
  if (metric.format === "percent") return `${metric.value.toFixed(1)}%`
  if (metric.format === "position") return metric.value ? `#${metric.value.toFixed(1)}` : "—"
  if (metric.format === "score") return metric.value ? metric.value.toFixed(1) : "—"
  return metric.value.toLocaleString()
}

export function addOverviewTable(
  slide: Slide,
  rows: Array<Array<string | number>>,
  x: number,
  y: number,
  w: number,
  h: number,
  widths?: number[],
) {
  slide.addTable(rows.map(row => row.map(value => ({ text: String(value) }))), {
    x, y, w, h,
    colW: widths,
    border: { type: "solid", color: T.colors.border, pt: 0.5 },
    fill: { color: T.colors.white },
    color: T.colors.text,
    fontFace: T.font,
    fontSize: 8,
    margin: 0.08,
    rowH: 0.34,
    breakLine: false,
    bold: false,
  })
}
