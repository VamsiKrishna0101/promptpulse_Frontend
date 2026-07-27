import PptxGenJS from "pptxgenjs"
import { loadBrandLogoDataUrl } from "@/lib/overviewExportAssets"
import type { OverviewPptxModel } from "./overviewPptxTypes"
import { addOverviewActionSlide } from "./slides/addOverviewActionSlide"
import { addOverviewCompetitionSlide } from "./slides/addOverviewCompetitionSlide"
import { addOverviewCoverSlide } from "./slides/addOverviewCoverSlide"
import { addOverviewExecutiveSlide } from "./slides/addOverviewExecutiveSlide"
import { addOverviewMethodologySlide } from "./slides/addOverviewMethodologySlide"
import { addOverviewPerformanceSlides } from "./slides/addOverviewPerformanceSlides"
import { addOverviewPromptSlide } from "./slides/addOverviewPromptSlide"
import { addOverviewSourcesSlide } from "./slides/addOverviewSourcesSlide"

export async function exportOverviewPptx(model: OverviewPptxModel) {
  if (!model.metrics.length || !model.coverage.responses) {
    throw new Error("The selected period does not contain enough analyzed responses for a presentation.")
  }

  const logoDataUrl = await loadBrandLogoDataUrl(model.brandUrl)
  const pptx = new PptxGenJS()
  pptx.layout = "LAYOUT_WIDE"
  pptx.author = model.brandName
  pptx.company = model.brandName
  pptx.subject = "AI visibility, prompt, competitor, source, and action intelligence"
  pptx.title = `${model.brandName} AI Visibility Intelligence Report`
  pptx.theme = { headFontFace: "Aptos Display", bodyFontFace: "Aptos" }

  addOverviewCoverSlide(pptx, model, logoDataUrl)
  addOverviewExecutiveSlide(pptx, model)
  addOverviewPerformanceSlides(pptx, model)
  addOverviewPromptSlide(pptx, model)
  addOverviewCompetitionSlide(pptx, model)
  addOverviewSourcesSlide(pptx, model)
  if (model.actions.length) addOverviewActionSlide(pptx, model)
  addOverviewMethodologySlide(pptx, model)

  const safeBrand = model.brandName.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase() || "brand"
  await pptx.writeFile({ fileName: `${safeBrand}-ai-visibility-report.pptx`, compression: true })
}
