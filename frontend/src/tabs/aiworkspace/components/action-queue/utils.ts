import type { ActionQueueItem } from "@/lib/actionQueueApi"

export function labelize(value: string) {
  return value.toLowerCase().replace(/_/g, " ")
}

export function readableError(error: unknown) {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (error as { response?: { data?: { error?: string; detail?: string } } }).response
    return response?.data?.error ?? response?.data?.detail ?? "Please try again."
  }
  return error instanceof Error ? error.message : "Please try again."
}

export function getEvidenceLabel(item: ActionQueueItem): string | null {
  const evidence = item.evidence ?? {}
  if (typeof evidence.source_title === "string" || typeof evidence.url === "string") {
    const domain = typeof evidence.domain === "string" ? evidence.domain : "Source"
    const competitors = Array.isArray(evidence.mentioned_competitors)
      ? evidence.mentioned_competitors
          .filter((name): name is string => typeof name === "string")
          .slice(0, 3)
      : []
    if (competitors.length > 0) return `${domain} mentions ${competitors.join(", ")} but not your brand`
    if (typeof evidence.source_title === "string") return `${domain}: ${evidence.source_title}`
    return domain
  }
  if (typeof evidence.prompt_text === "string") return evidence.prompt_text
  if (typeof evidence.domain === "string") return evidence.domain
  if (typeof evidence.model === "string") return `${evidence.model} visibility gap`
  if (typeof evidence.top_competitor === "string") return `Top competitor: ${evidence.top_competitor}`
  if (Array.isArray(evidence.top_cited_domains) && evidence.top_cited_domains.length > 0) {
    const first = evidence.top_cited_domains[0] as { domain?: unknown }
    return typeof first.domain === "string" ? `Top cited: ${first.domain}` : null
  }
  return null
}

export function sortItems(items: ActionQueueItem[]) {
  const order: Record<string, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 }
  return [...items].sort((a, b) => {
    const priorityDiff = (order[a.priority] ?? 3) - (order[b.priority] ?? 3)
    if (priorityDiff !== 0) return priorityDiff
    return (b.impact_score ?? 0) - (a.impact_score ?? 0)
  })
}
