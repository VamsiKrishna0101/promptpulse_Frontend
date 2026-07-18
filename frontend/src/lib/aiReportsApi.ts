import { api } from "@/lib/api"
import { AI_REPORTS_API_BASE_URL } from "@/config/baseUrls"

export { AI_REPORTS_API_BASE_URL }

export type ReportPeriod = "7d" | "14d" | "30d"

export type SavedReportSummary = {
  id: string
  project_id: string
  brand_name: string
  period_type: ReportPeriod | string
  period_start: string
  period_end: string
  status: string
  summary: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

export type SavedReportDetail = SavedReportSummary & {
  previous_period_start: string
  previous_period_end: string
  report: Record<string, unknown>
  errors: string[]
}

export async function listAIReports(projectId: string) {
  const response = await api.get<SavedReportSummary[]>("/reports", {
    params: { project_id: projectId },
  })
  return response.data
}

export async function getAIReport(reportId: string) {
  const response = await api.get<SavedReportDetail>(`/reports/${reportId}`)
  return response.data
}

export async function generateAIReport(projectId: string, periodType: ReportPeriod) {
  const response = await api.post<Record<string, unknown>>(
    "/reports/generate",
    {
      project_id: projectId,
      period_type: periodType,
    },
    {
      headers: {
        "Idempotency-Key": `ai-report-${projectId}-${periodType}-${Date.now()}`,
      },
    },
  )
  window.dispatchEvent(new Event("credits:changed"))
  return response.data
}
