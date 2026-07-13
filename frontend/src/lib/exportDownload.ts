import { API_BASE_URL } from "@/lib/api"

export type ExportResource =
  | "overview"
  | "prompts"
  | "chats"
  | "sources"
  | "competitors"
  | "web-analytics"

/**
 * Downloads an export file from the backend.
 * format="csv" actually downloads an .xlsx (Excel) file for best quality.
 * format="pdf" downloads a PDF.
 */
export async function downloadCsvExport(
  projectId: string | null,
  resource: ExportResource,
  queryString = "",
  format: "csv" | "pdf" = "csv",
) {
  if (!projectId) return

  // "csv" requests are routed to .xlsx for professional Excel output
  const ext = format === "pdf" ? "pdf" : "xlsx"
  const token = localStorage.getItem("geolens_access_token")

  const response = await fetch(
    `${API_BASE_URL}/exports/${projectId}/${resource}.${ext}${queryString}`,
    { headers: token ? { Authorization: `Bearer ${token}` } : undefined },
  )

  if (!response.ok) {
    throw new Error("Export failed")
  }

  const blob     = await response.blob()
  const filename = readFilename(response.headers.get("Content-Disposition"))
    ?? `${resource}.${ext}`

  const url  = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href     = url
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
  const token = localStorage.getItem("geolens_access_token")

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
    throw new Error("PDF Export failed")
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
