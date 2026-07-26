import { useCallback, useEffect, useState } from "react"
import { api } from "@/lib/api"

export type SeoAudit = {
  id: string
  project_id: string
  url: string
  status: string
  overall_score: number
  technical_score: number
  ai_readiness_score: number
  local_score: number
  content_score: number
  schema_score: number
  credits_spent: number
  created_at: string
  pages: {
    id: string
    url: string
    status_code: number | null
    title: string | null
    h1: string | null
    word_count: number
    indexable: boolean
    has_schema: boolean
    has_faq: boolean
    page_type: string
    detected_services: string[]
    detected_locations: string[]
  }[]
  issues: {
    id: string
    page_id?: string | null
    page?: {
      id: string
      url: string
      title: string | null
      page_type: string
      status_code: number | null
    } | null
    category: string
    severity: "HIGH" | "MEDIUM" | "LOW"
    title: string
    description: string
    recommendation: string
    priority_score: number
  }[]
  actions: {
    id: string
    action_type: string
    title: string
    description: string
    page_url: string | null
    priority: "HIGH" | "MEDIUM" | "LOW"
    difficulty: "LOW" | "MEDIUM" | "HIGH"
    status: string
    related_prompt_ids: string[]
    related_sources: string[]
  }[]
}

export type SeoAuditSummary = {
  id: string
  url: string
  overall_score: number
  technical_score: number
  ai_readiness_score: number
  local_score: number
  content_score: number
  schema_score: number
  credits_spent: number
  created_at: string
  _count: { pages: number; issues: number }
}

export type SeoKeywordOpportunity = {
  id: string
  prompt_id: string
  keyword: string
  topic: string
  intent: string
  funnel: string
  priority_score: number
  seo_coverage: "COVERED" | "WEAK" | "GAP"
  mapped_page_url: string | null
  mapped_page_title: string | null
  ai_visibility: number | null
  ai_avg_position: number | null
  google_rank: number | null
  google_rank_status: "NOT_CONFIGURED" | "FOUND" | "NOT_FOUND"
  google_ranking_url: string | null
  google_ranking_title: string | null
  related_queries: string[]
  recommendation: string
}

export type SeoIntelligence = {
  keywords: SeoKeywordOpportunity[]
  content_opportunities: {
    id: string
    title: string
    description: string
    target_keyword: string
    recommended_page_type: string
    priority: "HIGH" | "MEDIUM" | "LOW"
    mapped_page_url: string | null
  }[]
  local_checklist: {
    id: string
    label: string
    status: "PASS" | "NEEDS_WORK"
    reason: string
  }[]
  rank_tracking: {
    google_enabled: boolean
    message: string
    checked_keywords: number
  }
}

type SeoAuditCosts = {
  quick_scan: number
  full_audit_max: number
}

type SeoAuditResponse = {
  audit: SeoAudit | null
  intelligence?: SeoIntelligence
  costs?: Partial<SeoAuditCosts>
  cost?: number
}

type SeoHistoryResponse = {
  audits: SeoAuditSummary[]
  costs?: Partial<SeoAuditCosts>
}

const DEFAULT_SEO_COSTS: SeoAuditCosts = { quick_scan: 3, full_audit_max: 15 }

function normalizeSeoCosts(response: SeoAuditResponse | SeoHistoryResponse): SeoAuditCosts {
  return {
    quick_scan: response.costs?.quick_scan ?? DEFAULT_SEO_COSTS.quick_scan,
    full_audit_max: response.costs?.full_audit_max ?? DEFAULT_SEO_COSTS.full_audit_max,
  }
}

export function useSeoAudit(projectId: string | null) {
  const [audit, setAudit] = useState<SeoAudit | null>(null)
  const [intelligence, setIntelligence] = useState<SeoIntelligence | null>(null)
  const [costs, setCosts] = useState<SeoAuditCosts>(DEFAULT_SEO_COSTS)
  const [history, setHistory] = useState<SeoAuditSummary[]>([])
  const [isLoading, setIsLoading] = useState(Boolean(projectId))
  const [isRunning, setIsRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refreshHistory = useCallback(async () => {
    if (!projectId) return
    try {
      const response = await api.get<SeoHistoryResponse>(`/seo/${projectId}/history`)
      setHistory(response.data.audits ?? [])
    } catch {
      // silently fail — history is non-critical
    }
  }, [projectId])

  async function refresh() {
    if (!projectId) return
    setIsLoading(true)
    setError(null)
    try {
      const response = await api.get<SeoAuditResponse>(`/seo/${projectId}/latest`)
      setAudit(response.data.audit)
      setIntelligence(response.data.intelligence ?? null)
      setCosts(normalizeSeoCosts(response.data))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load SEO audit")
    } finally {
      setIsLoading(false)
    }
  }

  function clearAudit() {
    setAudit(null)
    setIntelligence(null)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  async function loadAudit(auditId: string) {
    if (!projectId) return
    setIsLoading(true)
    setError(null)
    try {
      const response = await api.get<SeoAuditResponse>(`/seo/${projectId}/audit/${auditId}`)
      setAudit(response.data.audit)
      setIntelligence(response.data.intelligence ?? null)
      setCosts(normalizeSeoCosts(response.data))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load SEO audit")
    } finally {
      setIsLoading(false)
    }
  }

  async function run(input?: { url?: string; mode?: "quick" | "full" }) {
    if (!projectId) return
    setIsRunning(true)
    setError(null)
    try {
      const response = await api.post<SeoAuditResponse & { audit: SeoAudit }>(`/seo/${projectId}/run`, { url: input?.url, mode: input?.mode ?? "full" })
      setAudit(response.data.audit)
      setIntelligence(response.data.intelligence ?? null)
      setCosts(normalizeSeoCosts(response.data))
      void refreshHistory()
    } catch (err: any) {
      setError(err?.response?.data?.error ?? (err instanceof Error ? err.message : "Failed to run SEO audit"))
    } finally {
      setIsRunning(false)
    }
  }

  useEffect(() => {
    // Only fetch history initially. We don't auto-load the latest audit anymore
    // so the user sees the history list or empty state first.
    if (projectId) {
      setIsLoading(true)
      refreshHistory().finally(() => setIsLoading(false))
    }
  }, [projectId, refreshHistory])

  return { audit, intelligence, costs, history, isLoading, isRunning, error, refresh, refreshHistory, loadAudit, clearAudit, run }
}
