import type { BrandPreference, BrandPreferencePayload } from "@/lib/brandPreferencesApi"

export const defaultRedditFocus = ["reviews", "alternatives", "pricing complaints", "recommendations"]

export type RedditSection = "overview" | "discussions" | "citations" | "actions"

export function toneClass(value?: string | null) {
  const clean = (value ?? "neutral").toLowerCase()
  if (clean === "positive") return "bg-emerald-50 text-emerald-700 ring-emerald-100"
  if (clean === "negative") return "bg-red-50 text-red-700 ring-red-100"
  if (clean === "skeptical") return "bg-amber-50 text-amber-700 ring-amber-100"
  return "bg-zinc-100 text-zinc-600 ring-zinc-200"
}

export function priorityClass(value?: string) {
  if (value === "HIGH") return "bg-red-50 text-red-700 ring-red-100"
  if (value === "LOW") return "bg-zinc-100 text-zinc-600 ring-zinc-200"
  return "bg-amber-50 text-amber-700 ring-amber-100"
}

export function listToText(values?: string[] | null) {
  return (values ?? []).join("\n")
}

export function textToList(value: string) {
  const seen = new Set<string>()
  const items: string[] = []
  for (const part of value.split(/[\n,]/g)) {
    const item = part.trim()
    const key = item.toLowerCase()
    if (!item || seen.has(key)) continue
    seen.add(key)
    items.push(item)
  }
  return items
}

export function isRunnablePreference(preference: BrandPreference | null) {
  return Boolean(preference?.industry_category?.trim() && preference.keywords?.length)
}

export function buildPreferencePayload(input: {
  industryCategory: string
  buyerPersona: string
  keywords: string
  avoidKeywords: string
  competitorContext: string
  redditFocus: string
}): BrandPreferencePayload {
  return {
    industry_category: input.industryCategory.trim(),
    buyer_persona: input.buyerPersona.trim() || null,
    keywords: textToList(input.keywords),
    avoid_keywords: textToList(input.avoidKeywords),
    competitor_context: input.competitorContext.trim() || null,
    reddit_focus: textToList(input.redditFocus),
  }
}

export function compactNumber(value: number | null | undefined) {
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(value ?? 0)
}

export function dateLabel(value?: string | null) {
  if (!value) return "Not finished"
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
}

export function statusClass(status?: string | null) {
  const clean = (status ?? "").toLowerCase()
  if (clean === "success" || clean === "done" || clean === "completed") return "border-emerald-200 bg-emerald-50 text-emerald-700"
  if (clean === "failed") return "border-red-200 bg-red-50 text-red-700"
  return "border-amber-200 bg-amber-50 text-amber-700"
}

export function isCompletedRunStatus(status?: string | null) {
  const clean = (status ?? "").toLowerCase()
  return clean === "success" || clean === "done" || clean === "completed" || clean === "partial_success"
}
