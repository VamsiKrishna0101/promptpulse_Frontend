import PptxGenJS from "pptxgenjs"
import type { ReportViewModel } from "../../utils/reportMapper"
import { createEnterpriseReportModel } from "../enterprise/enterpriseReportModel"
import { loadAssetAsDataUrl } from "../shared/reportAssets"
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
import { addMethodologySlide } from "./slides/addMethodologySlide"

export async function exportReportPptx(report: ReportViewModel) {
  const model = createEnterpriseReportModel(report)
  const data = model.data
  if (!model.validation.hasUsableContent) {
    throw new Error(model.validation.warnings.join(" "))
  }
  const logoDataUrl = await loadAssetAsDataUrl(model.profile.logoUrl)
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

  addCoverSlide(pptx, data, logoDataUrl)
  addExecutiveSlide(pptx, report, data)
  addVisibilitySlide(pptx, report, data)
  addModelDetailSlides(pptx, report, data)
  addPromptDetailSlides(pptx, report, data)
  addCompetitorDetailSlides(pptx, report, data)
  addSourceSentimentSlide(pptx, report, data)
  addRecommendationSlide(pptx, report, data)
  addMethodologySlide(pptx, model)

  await pptx.writeFile({ fileName: `${data.fileName}.pptx`, compression: true })
}
