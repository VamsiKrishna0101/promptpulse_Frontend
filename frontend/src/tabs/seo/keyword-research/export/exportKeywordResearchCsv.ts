import type { KeywordResearchRow } from "../api/keywordResearchApi"
import { sanitizeFileName } from "./types"

export function exportKeywordResearchCsv(rows: KeywordResearchRow[], query: string) {
  const headings = [
    "Keyword",
    "Intent",
    "Search volume",
    "CPC",
    "Keyword difficulty",
    "Competition",
    "SERP features",
    "12-month trend",
  ]

  const values = rows.map((row) => [
    row.keyword,
    row.intent || "",
    row.searchVolume ?? "",
    row.cpc ?? "",
    row.keywordDifficulty ?? "",
    row.competition ?? "",
    row.serpFeatures.join(" | "),
    row.trend.join(" | "),
  ])

  const csv = [headings, ...values]
    .map((columns) => columns.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(","))
    .join("\n")

  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }))
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = `${sanitizeFileName(query) || "keyword-research"}.csv`
  anchor.click()
  URL.revokeObjectURL(url)
}
