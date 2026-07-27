export type OverviewMetric = {
  label: string
  value: number
  format: "number" | "percent" | "position" | "score"
  previous: number | null
  delta: number | null
  lowerIsBetter?: boolean
}

export type OverviewPptxModel = {
  brandName: string
  brandUrl: string
  generatedAt: string
  periodLabel: string
  comparisonLabel: string | null
  metrics: OverviewMetric[]
  trend: Array<{ date: string; visibility: number; responses: number }>
  engines: Array<{ engine: string; responses: number; visibility: number; position: number | null; sentiment: number | null; sourceDomains: number }>
  prompts: Array<{ prompt: string; topic: string; responses: number; visibility: number; position: number | null; status: "LEADER" | "OPPORTUNITY" | "GAP" }>
  topics: Array<{ topic: string; prompts: number; responses: number; visibility: number; position: number | null }>
  brands: Array<{ rank: number; brand: string; visibility: number; mentions: number; position: number | null; sentiment: number | null; isOwnBrand: boolean }>
  sources: Array<{ rank: number; domain: string; usedPct: number; sourceType: string; citations: number; url: string; brandPresence: "CONFIRMED" | "NOT_CONFIRMED" }>
  sourceTypes: Array<{ sourceType: string; domains: number; citations: number; confirmedDomains: number }>
  sentiment: { scoredResponses: number; positive: number; neutral: number; negative: number; average: number | null }
  actions: Array<{ priority: "HIGH" | "MEDIUM"; horizon: "NOW" | "NEXT" | "LATER"; title: string; rationale: string; action: string; evidence: string }>
  coverage: {
    activePrompts: number
    representedPrompts: number
    responses: number
    successfulRuns: number
    partialRuns: number
    failedRuns: number
    completedJobs: number
    failedJobs: number
  }
  executiveHeadline: string
  executivePoints: string[]
  methodology: string[]
}
