import type { ExportReportData } from "../reportExportData"

export type ReportValidation = {
  warnings: string[]
  hasUsableContent: boolean
}

export function validateExportReport(data: ExportReportData): ReportValidation {
  const warnings: string[] = []

  if (!data.title.trim()) warnings.push("The report has no title.")
  if (!data.period.trim()) warnings.push("The report has no reporting period.")
  if (!data.summary.trim()) warnings.push("The executive summary is empty.")
  if (data.metrics.length === 0) warnings.push("No headline metrics are available.")
  if (data.sections.length === 0) warnings.push("No report sections are available.")

  return {
    warnings,
    hasUsableContent: Boolean(data.title.trim() && data.sections.length),
  }
}
