import type { ReportViewModel } from "../../utils/reportMapper"
import { createExportData, type ExportReportData } from "../reportExportData"
import { defaultReportProfile, type ReportProfile } from "./reportProfile"
import { validateExportReport, type ReportValidation } from "./reportValidation"

export type EnterpriseReportModel = {
  data: ExportReportData
  profile: ReportProfile
  validation: ReportValidation
  generatedAt: string
  methodology: string
}

export function createEnterpriseReportModel(
  report: ReportViewModel,
  profile: ReportProfile = defaultReportProfile,
): EnterpriseReportModel {
  const data = createExportData(report)

  return {
    data,
    profile,
    validation: validateExportReport(data),
    generatedAt: new Date().toISOString(),
    methodology:
      "PromptPulse compares tracked prompts, AI engine responses, brand mentions, positions, competitors, and cited sources for the selected reporting period. Results depend on prompt coverage and successful runs.",
  }
}
