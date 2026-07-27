import type PptxGenJS from "pptxgenjs"
import type { OverviewPptxModel } from "../overviewPptxTypes"
import { addOverviewBackground, addOverviewCard, addOverviewFooter, addOverviewHeader, addOverviewMetric, addOverviewTable } from "../overviewPptxHelpers"
import { OVERVIEW_PPTX as T } from "../overviewPptxTheme"

export function addOverviewPromptSlide(pptx: PptxGenJS, model: OverviewPptxModel) {
  const slide = pptx.addSlide()
  addOverviewBackground(slide)
  addOverviewHeader(slide, "Buyer intelligence", "Prompt and topic coverage", "The buyer questions the brand owns, the questions it partially answers, and the gaps requiring new content.")

  const gaps = model.prompts.filter(prompt => prompt.status === "GAP").length
  const improve = model.prompts.filter(prompt => prompt.status === "OPPORTUNITY").length
  const leaders = model.prompts.filter(prompt => prompt.status === "LEADER").length
  addOverviewMetric(slide, 0.65, 1.72, 2.25, "Prompts represented", String(model.coverage.representedPrompts), "Measured in this report")
  addOverviewMetric(slide, 3.05, 1.72, 2.25, "Visibility gaps", String(gaps), "Below 35% visibility", T.colors.amber)
  addOverviewMetric(slide, 5.45, 1.72, 2.25, "Improve", String(improve), "35–69% visibility", T.colors.sky)
  addOverviewMetric(slide, 7.85, 1.72, 2.25, "Leaders", String(leaders), "70%+ visibility", T.colors.mint)

  addOverviewCard(slide, 0.65, 3.02, 8.15, 3.55)
  slide.addText("PRIORITY BUYER PROMPTS", { x: 0.92, y: 3.28, w: 3, h: 0.16, fontFace: T.font, fontSize: 8, bold: true, color: T.colors.blue, margin: 0 })
  const prompts = [...model.prompts].sort((a, b) => a.visibility - b.visibility).slice(0, 6)
  addOverviewTable(slide, [
    ["PROMPT", "TOPIC", "VIS.", "POS.", "STATUS"],
    ...prompts.map(row => [
      row.prompt.length > 54 ? `${row.prompt.slice(0, 51)}…` : row.prompt,
      row.topic,
      `${row.visibility.toFixed(1)}%`,
      row.position === null ? "—" : `#${row.position.toFixed(1)}`,
      row.status === "OPPORTUNITY" ? "IMPROVE" : row.status,
    ]),
  ], 0.92, 3.63, 7.6, 2.45, [3.75, 1.25, 0.75, 0.65, 1.2])

  addOverviewCard(slide, 9.05, 3.02, 3.65, 3.55)
  slide.addText("TOPIC COVERAGE", { x: 9.32, y: 3.28, w: 2.6, h: 0.16, fontFace: T.font, fontSize: 8, bold: true, color: T.colors.blue, margin: 0 })
  model.topics.slice(0, 5).forEach((topic, index) => {
    const y = 3.73 + index * 0.48
    slide.addText(topic.topic, { x: 9.32, y, w: 1.8, h: 0.18, fontFace: T.font, fontSize: 8.5, bold: true, color: T.colors.text, margin: 0, fit: "shrink" })
    slide.addShape("rect", { x: 11.1, y: y + 0.02, w: 1.18, h: 0.12, fill: { color: T.colors.border }, line: { color: T.colors.border } })
    slide.addShape("rect", { x: 11.1, y: y + 0.02, w: 1.18 * topic.visibility / 100, h: 0.12, fill: { color: T.colors.blue }, line: { color: T.colors.blue } })
    slide.addText(`${topic.visibility.toFixed(0)}%`, { x: 12.35, y: y - 0.02, w: 0.25, h: 0.18, fontFace: T.font, fontSize: 7.5, color: T.colors.muted, margin: 0, align: "right" })
  })
  addOverviewFooter(slide, model.brandName, model.periodLabel)
}
