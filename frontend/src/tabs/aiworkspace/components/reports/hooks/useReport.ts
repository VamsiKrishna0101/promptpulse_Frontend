import { useEffect, useState } from "react"
import { useProjects } from "@/hooks/useProjects"
import { generateAIReport, getAIReport, listAIReports, type ReportPeriod, type SavedReportDetail, type SavedReportSummary } from "@/lib/aiReportsApi"
import { text } from "../utils/reportHelpers"

export function useReport() {
  const { selectedProject } = useProjects()
  const [reports, setReports] = useState<SavedReportSummary[]>([])
  const [detail, setDetail] = useState<SavedReportDetail | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function refresh() {
    if (!selectedProject?.id) return
    setIsLoading(true)
    setError(null)
    try {
      setReports(await listAIReports(selectedProject.id))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load reports")
    } finally {
      setIsLoading(false)
    }
  }

  async function openReport(reportId: string) {
    setError(null)
    try {
      setDetail(await getAIReport(reportId))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to open report")
    }
  }

  async function generate(period: ReportPeriod) {
    if (!selectedProject?.id) return
    setDetail(null)
    setIsGenerating(true)
    setError(null)
    try {
      const result = await generateAIReport(selectedProject.id, period)
      await refresh()
      const reportId = text(result.report_id, "")
      if (reportId) await openReport(reportId)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate report")
    } finally {
      setIsGenerating(false)
    }
  }

  useEffect(() => {
    void refresh()
  }, [selectedProject?.id])

  return {
    brandName: selectedProject?.brand_name ?? "your brand",
    reports,
    detail,
    isLoading,
    isGenerating,
    error,
    clearDetail: () => setDetail(null),
    refresh,
    openReport,
    generate,
  }
}
