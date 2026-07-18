import { useEffect, useState } from "react"
import { api } from "@/lib/api"

export type OpportunityType = "MISSING" | "OUTRANKED" | "SOURCE_GAP" | "SENTIMENT_GAP"
export type OpportunityImpact = "HIGH" | "MEDIUM" | "LOW"
export type OpportunityEffort = "LOW" | "MEDIUM" | "HIGH"
export type OpportunityConfidence = "HIGH" | "MEDIUM" | "LOW" | "NEEDS_REVIEW"

export type OpportunitySource = {
  domain: string
  title: string | null
  source_type: string | null
  mentions: number
}

export type ContentGapPlan = {
  gap_reason: string
  recommended_content_type: string
  suggested_title: string
  action: "CREATE" | "REFRESH" | "OPTIMIZE"
  priority_reason: string
  missing_angles: string[]
  optimization_focus: string[]
}

export type OpportunityItem = {
  id: string
  type: OpportunityType
  title: string
  description: string
  prompt_id: string
  prompt_text: string
  topic: string | null
  competitor_name: string
  own_visibility: number
  competitor_visibility: number
  own_position: number | null
  competitor_position: number | null
  own_sentiment: number | null
  competitor_sentiment: number | null
  impact_score: number
  impact: OpportunityImpact
  effort: OpportunityEffort
  evidence_count: number
  clean_evidence_count: number
  confidence: OpportunityConfidence
  confidence_reasons: string[]
  prompt_intent_warning: string | null
  top_sources: OpportunitySource[]
  content_gap: ContentGapPlan
  next_step: string
  sample_response: string | null
}

export type OpportunitiesResponse = {
  summary: {
    total: number
    high_impact: number
    quick_wins: number
    create_pages: number
    refresh_pages: number
    competitor_gaps: number
    source_gaps: number
    sentiment_gaps: number
  }
  opportunities: OpportunityItem[]
}

const EMPTY_RESPONSE: OpportunitiesResponse = {
  summary: {
    total: 0,
    high_impact: 0,
    quick_wins: 0,
    create_pages: 0,
    refresh_pages: 0,
    competitor_gaps: 0,
    source_gaps: 0,
    sentiment_gaps: 0,
  },
  opportunities: [],
}

export function useOpportunities(projectId: string | null, queryString = "") {
  const [data, setData] = useState<OpportunitiesResponse>(EMPTY_RESPONSE)
  const [isLoading, setIsLoading] = useState(Boolean(projectId))
  const [error, setError] = useState<string | null>(null)

  async function refresh() {
    if (!projectId) return
    setIsLoading(true)
    setError(null)
    try {
      const response = await api.get<OpportunitiesResponse>(`/opportunities/${projectId}${queryString}`)
      setData(response.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load opportunities")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
  }, [projectId, queryString])

  return {
    ...data,
    isLoading,
    error,
    refresh,
  }
}
