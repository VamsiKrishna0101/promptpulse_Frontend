import { readFile, writeFile } from "node:fs/promises"
import PptxGenJS from "pptxgenjs"
import type { OverviewPptxModel } from "../src/lib/overviewPptx/overviewPptxTypes"
import { addOverviewActionSlide } from "../src/lib/overviewPptx/slides/addOverviewActionSlide"
import { addOverviewCompetitionSlide } from "../src/lib/overviewPptx/slides/addOverviewCompetitionSlide"
import { addOverviewCoverSlide } from "../src/lib/overviewPptx/slides/addOverviewCoverSlide"
import { addOverviewExecutiveSlide } from "../src/lib/overviewPptx/slides/addOverviewExecutiveSlide"
import { addOverviewMethodologySlide } from "../src/lib/overviewPptx/slides/addOverviewMethodologySlide"
import { addOverviewPerformanceSlides } from "../src/lib/overviewPptx/slides/addOverviewPerformanceSlides"
import { addOverviewPromptSlide } from "../src/lib/overviewPptx/slides/addOverviewPromptSlide"
import { addOverviewSourcesSlide } from "../src/lib/overviewPptx/slides/addOverviewSourcesSlide"

const modelPath = "../../Empty/tmp/pdfs/overview-export-qa/overview-enterprise.json"
const outputPath = "../../Empty/tmp/pdfs/overview-export-qa/overview-enterprise.pptx"
const model = JSON.parse(await readFile(modelPath, "utf8")) as OverviewPptxModel
const PptxConstructor = ((PptxGenJS as unknown as { default?: typeof PptxGenJS }).default ?? PptxGenJS)
const pptx = new PptxConstructor()
pptx.layout = "LAYOUT_WIDE"
pptx.author = model.brandName
pptx.company = model.brandName
pptx.subject = "AI visibility intelligence"
pptx.title = `${model.brandName} AI Visibility Intelligence Report`
pptx.theme = { headFontFace: "Aptos Display", bodyFontFace: "Aptos" }

addOverviewCoverSlide(pptx, model, null)
addOverviewExecutiveSlide(pptx, model)
addOverviewPerformanceSlides(pptx, model)
addOverviewPromptSlide(pptx, model)
addOverviewCompetitionSlide(pptx, model)
addOverviewSourcesSlide(pptx, model)
addOverviewActionSlide(pptx, model)
addOverviewMethodologySlide(pptx, model)

const output = await pptx.write({ outputType: "nodebuffer", compression: true })
await writeFile(outputPath, output as Buffer)
console.log(outputPath)
