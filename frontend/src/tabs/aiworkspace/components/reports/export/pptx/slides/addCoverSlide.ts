import type PptxGenJS from "pptxgenjs"
import type { ExportReportData } from "../../reportExportData"
import { addBackground, addCard, addEyebrow, addFooter, addMetricCard } from "../pptxHelpers"
import { bodyText, PPTX } from "../pptxTheme"

export function addCoverSlide(pptx: PptxGenJS, data: ExportReportData) {
  const slide = pptx.addSlide()
  addBackground(slide)

  slide.addShape("roundRect", {
    x: 0.55,
    y: 0.55,
    w: 12.25,
    h: 4.15,
    rectRadius: 0.12,
    fill: { color: PPTX.colors.dark },
    line: { color: PPTX.colors.dark },
  })
  slide.addShape("arc", {
    x: 9.9,
    y: 0.25,
    w: 3.7,
    h: 3.7,
    fill: { color: PPTX.colors.dark2, transparency: 15 },
    line: { color: PPTX.colors.dark2, transparency: 100 },
  })

  addEyebrow(slide, "AI Visibility Report", 0.95, 0.98)
  slide.addText(data.title, {
    x: 0.92,
    y: 1.42,
    w: 7.4,
    h: 0.58,
    fontFace: PPTX.font,
    fontSize: 30,
    bold: true,
    color: PPTX.colors.white,
    margin: 0,
    fit: "shrink",
  })
  slide.addText(data.headline || data.subtitle, {
    x: 0.95,
    y: 2.22,
    w: 7.5,
    h: 0.9,
    ...bodyText,
    fontSize: 14,
    color: "D7E4E1",
  })

  addCard(slide, 9.45, 1.18, 2.75, 1.52, "315C67")
  slide.addText("PERIOD", {
    x: 9.74,
    y: 1.46,
    w: 2.1,
    h: 0.16,
    fontFace: PPTX.font,
    fontSize: 7.5,
    bold: true,
    color: "C7D6D2",
    margin: 0,
  })
  slide.addText(data.period, {
    x: 9.74,
    y: 1.83,
    w: 2.1,
    h: 0.34,
    fontFace: PPTX.font,
    fontSize: 17,
    bold: true,
    color: PPTX.colors.white,
    margin: 0,
    fit: "shrink",
  })

  data.metrics.slice(0, 4).forEach((metric, index) => {
    addMetricCard(slide, 0.65 + index * 3.05, 5.08, 2.78, metric.label, metric.value)
  })

  addFooter(slide, data.period)
}
