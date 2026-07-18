import type PptxGenJS from "pptxgenjs"
import { bodyText, eyebrow, PPTX } from "./pptxTheme"

type Slide = ReturnType<PptxGenJS["addSlide"]>

export function addBackground(slide: Slide) {
  slide.background = { color: "F7FAF9" }
  slide.addShape("rect", {
    x: 0,
    y: 0,
    w: PPTX.width,
    h: PPTX.height,
    fill: { color: "F7FAF9" },
    line: { color: "F7FAF9" },
  })
  slide.addShape("arc", {
    x: 10.2,
    y: -1.2,
    w: 4.2,
    h: 4.2,
    fill: { color: "DDEDE8", transparency: 20 },
    line: { color: "DDEDE8", transparency: 100 },
  })
}

export function addFooter(slide: Slide, period: string) {
  slide.addText("PromptPulse AI Visibility Report", {
    x: PPTX.margin,
    y: 7.08,
    w: 4,
    h: 0.18,
    fontFace: PPTX.font,
    fontSize: 7.5,
    bold: true,
    color: "94A3AF",
    margin: 0,
  })
  slide.addText(period, {
    x: 10.1,
    y: 7.08,
    w: 2.7,
    h: 0.18,
    fontFace: PPTX.font,
    fontSize: 7.5,
    bold: true,
    align: "right",
    color: "94A3AF",
    margin: 0,
  })
}

export function addEyebrow(slide: Slide, text: string, x: number, y: number, w = 4) {
  slide.addText(text.toUpperCase(), { ...eyebrow, x, y, w, h: 0.18 })
}

export function addCard(slide: Slide, x: number, y: number, w: number, h: number, fill = PPTX.colors.white) {
  slide.addShape("roundRect", {
    x,
    y,
    w,
    h,
    fill: { color: fill },
    line: { color: PPTX.colors.line, transparency: 10 },
    shadow: { type: "outer", opacity: 0.08, blur: 1, angle: 45 },
  })
}

export function addMetricCard(slide: Slide, x: number, y: number, w: number, label: string, value: string) {
  addCard(slide, x, y, w, 0.82)
  slide.addText(label.toUpperCase(), {
    x: x + 0.18,
    y: y + 0.15,
    w: w - 0.36,
    h: 0.16,
    fontFace: PPTX.font,
    fontSize: 7.5,
    bold: true,
    color: "8392A0",
    margin: 0,
  })
  slide.addText(value, {
    x: x + 0.18,
    y: y + 0.38,
    w: w - 0.36,
    h: 0.28,
    fontFace: PPTX.font,
    fontSize: 18,
    bold: true,
    color: PPTX.colors.ink,
    margin: 0,
    fit: "shrink",
  })
}

export function addBullets(slide: Slide, items: string[], x: number, y: number, w: number, max = 5) {
  items.slice(0, max).forEach((item, index) => {
    const top = y + index * 0.48
    slide.addShape("ellipse", {
      x,
      y: top + 0.08,
      w: 0.08,
      h: 0.08,
      fill: { color: PPTX.colors.dark },
      line: { color: PPTX.colors.dark },
    })
    slide.addText(item, {
      ...bodyText,
      x: x + 0.18,
      y: top,
      w,
      h: 0.34,
    })
  })
}

export function addSectionCard(
  slide: Slide,
  title: string,
  items: string[],
  x: number,
  y: number,
  w: number,
  h: number,
  tone: "neutral" | "good" | "risk" = "neutral",
) {
  const fill = tone === "good" ? PPTX.colors.greenSoft : tone === "risk" ? PPTX.colors.redSoft : PPTX.colors.white
  const titleColor = tone === "good" ? PPTX.colors.green : tone === "risk" ? PPTX.colors.red : PPTX.colors.ink
  addCard(slide, x, y, w, h, fill)
  slide.addText(title, {
    x: x + 0.22,
    y: y + 0.18,
    w: w - 0.44,
    h: 0.22,
    fontFace: PPTX.font,
    fontSize: 12,
    bold: true,
    color: titleColor,
    margin: 0,
  })
  addBullets(slide, items, x + 0.24, y + 0.58, w - 0.65, Math.floor((h - 0.72) / 0.48))
}
