import PptxGenJS from "pptxgenjs"
import type { ReportViewModel } from "../../utils/reportMapper"
import { createExportData } from "../reportExportData"
import { addCoverSlide } from "./slides/addCoverSlide"
import {
  addCompetitorDetailSlides,
  addModelDetailSlides,
  addPromptDetailSlides,
  addSourceSentimentSlide,
} from "./slides/addDetailedAnalysisSlides"
import { addExecutiveSlide } from "./slides/addExecutiveSlide"
import { addRecommendationSlide } from "./slides/addRecommendationSlide"
import { addVisibilitySlide } from "./slides/addVisibilitySlide"

export async function exportReportPptx(report: ReportViewModel) {
  const data = createExportData(report)
  const pptx = new PptxGenJS()

  pptx.layout = "LAYOUT_WIDE"
  pptx.author = "PromptPulse"
  pptx.company = "PromptPulse"
  pptx.subject = data.subtitle
  pptx.title = data.title
  pptx.theme = {
    headFontFace: "Aptos Display",
    bodyFontFace: "Aptos",
  }

  addCoverSlide(pptx, data)
  addExecutiveSlide(pptx, report, data)
  addVisibilitySlide(pptx, report, data)
  addModelDetailSlides(pptx, report, data)
  addPromptDetailSlides(pptx, report, data)
  addCompetitorDetailSlides(pptx, report, data)
  addSourceSentimentSlide(pptx, report, data)
  addRecommendationSlide(pptx, report, data)

  await pptx.writeFile({ fileName: `${data.fileName}.pptx`, compression: true })
}
