import { API_BASE_URL } from "@/lib/api"
import type { OverviewPptxModel } from "@/lib/overviewPptx/overviewPptxTypes"

export type ExportResource =
  | "overview"
  | "prompts"
  | "chats"
  | "sources"
  | "competitors"
  | "web-analytics"

export type ExportFormat = "pdf" | "pptx" | "csv"

/**
 * Downloads an export file from the backend.
 * format="csv" downloads raw CSV data.
 * format="pdf" downloads a styled PDF executive summary.
 * format="pptx" builds an editable presentation from the overview report model.
 */
export async function downloadCsvExport(
  projectId: string | null,
  resource: ExportResource,
  queryString = "",
  format: ExportFormat = "pdf",
) {
  if (!projectId) return

  if (format === "pptx") {
    if (resource !== "overview") throw new Error("PowerPoint export is only available for the overview report.")
    const token = localStorage.getItem("promptpulse_access_token")
    const response = await fetch(
      `${API_BASE_URL}/exports/${projectId}/overview.json${queryString}`,
      { headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) } },
    )
    if (!response.ok) throw new Error(await readError(response, "PowerPoint export failed"))
    const { exportOverviewPptx } = await import("@/lib/overviewPptx/exportOverviewPptx")
    await exportOverviewPptx(await response.json() as OverviewPptxModel)
    return
  }

  const ext = format === "pdf" ? "pdf" : "csv"
  const token = localStorage.getItem("promptpulse_access_token")

  const response = await fetch(
    `${API_BASE_URL}/exports/${projectId}/${resource}.${ext}${queryString}`,
    {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    },
  )

  if (!response.ok) {
    throw new Error(await readError(response, "Export failed"))
  }

  const blob = await response.blob()
  const filename = readFilename(response.headers.get("Content-Disposition"))
    ?? `${resource}.${ext}`

  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

function readFilename(disposition: string | null): string | null {
  if (!disposition) return null
  const match = disposition.match(/filename="([^"]+)"/i)
  return match?.[1] ?? null
}

/**
 * Sends the brief and article to the backend to generate a clean PDF export.
 */
export async function downloadGeoArticlePdf(
  projectId: string,
  brief: any,
  article: any,
) {
  const token = localStorage.getItem("promptpulse_access_token")

  const response = await fetch(
    `${API_BASE_URL}/exports/${projectId}/geoarticle-pdf`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ brief, article })
    }
  )

  if (!response.ok) {
    throw new Error(await readError(response, "PDF Export failed"))
  }

  const blob = await response.blob()
  const filename = readFilename(response.headers.get("Content-Disposition"))
    ?? `geo-article.pdf`

  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

/**
 * Generates an executive PowerPoint presentation for the GEO article.
 */
export async function downloadGeoArticlePptx(
  brandName: string,
  brief: any,
  article: any,
) {
  const { exportGeoArticlePptx } = await import("@/tabs/geoarticles/exportGeoArticlePptx")
  await exportGeoArticlePptx(brandName, brief, article)
}

/**
 * Generates an executive PowerPoint presentation for Keyword Research datasets.
 */
export async function downloadKeywordResearchPptx(
  brandName: string,
  result: any,
) {
  const { exportKeywordResearchPptx } = await import("@/tabs/seo/keyword-research/export")
  await exportKeywordResearchPptx(brandName, result)
}

/**
 * Generates an executive PDF report for Keyword Research datasets.
 */
export async function downloadKeywordResearchPdf(
  brandName: string,
  result: any,
) {
  const { exportKeywordResearchPdf } = await import("@/tabs/seo/keyword-research/export")
  await exportKeywordResearchPdf(brandName, result)
}

/**
 * Generates an executive PowerPoint presentation for Domain Research / Overview.
 */
export async function downloadDomainResearchPptx(
  brandName: string,
  data: any,
) {
  const { exportDomainResearchPptx } = await import("@/tabs/seo/domain-research/export")
  await exportDomainResearchPptx(brandName, data)
}

/**
 * Generates an executive PDF report for Domain Research / Overview.
 */
export async function downloadDomainResearchPdf(
  brandName: string,
  data: any,
) {
  const { exportDomainResearchPdf } = await import("@/tabs/seo/domain-research/export")
  await exportDomainResearchPdf(brandName, data)
}

async function readError(response: Response, fallback: string) {
  try {
    const data = await response.clone().json()
    if (typeof data?.error === "string") return data.error
  } catch {
    // Keep the original fallback for binary/non-JSON error responses.
  }
  return fallback
}
