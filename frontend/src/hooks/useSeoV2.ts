import { useCallback, useEffect, useRef, useState } from "react"
import { api } from "@/lib/api"

// ─── Types ────────────────────────────────────────────────────────────────────

export type SeoV2CrawlMode = "QUICK" | "STANDARD" | "DEEP"

export type SeoV2JobStatus = "QUEUED" | "RUNNING" | "COMPLETED" | "PARTIAL" | "FAILED"

export type SeoV2IssueSeverity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO"

export type SeoV2IssueCategory =
  | "INDEXABILITY" | "REDIRECT" | "CANONICAL" | "TITLE" | "META_DESCRIPTION"
  | "HEADINGS" | "IMAGES" | "LINKS" | "SCHEMA" | "MOBILE" | "DUPLICATE_CONTENT"
  | "SITEMAP" | "ROBOTS" | "ORPHAN_PAGES" | "CRAWL_DEPTH"

export type SeoV2Issue = {
  id: string
  category: SeoV2IssueCategory
  severity: SeoV2IssueSeverity
  title: string
  description: string
  evidence: string
  why_it_matters: string
  recommended_fix: string
  affected_pages_count: number
  example_urls: string[]
  priority_score: number
  verification: "UNVERIFIED" | "PENDING_RECRAWL" | "VERIFIED_FIXED" | "VERIFIED_STILL_PRESENT"
}

export type SeoV2Page = {
  id: string
  url: string
  status_code: number | null
  error_code: string
  crawl_depth: number
  inbound_links_count: number
  is_orphan: boolean
  indexable: boolean
  robots_blocked: boolean
  noindex: boolean
  title: string | null
  title_length: number | null
  meta_description: string | null
  h1: string | null
  h1_count: number
  word_count: number
  has_viewport: boolean
  has_schema: boolean
  schema_types: string[]
  images_total: number
  images_missing_alt: number
}

export type SeoV2Audit = {
  id: string
  project_id: string
  url: string
  is_partial: boolean
  crawl_coverage: number
  pages_crawled: number
  pages_failed: number
  issues_count: number
  critical_count: number
  high_count: number
  medium_count: number
  low_count: number
  technical_score: number | null
  confidence: number
  created_at: string
  issues: SeoV2Issue[]
  pages: SeoV2Page[]
  crawl_job: {
    mode: string
    url: string
    status: string
    partial_reason: string | null
    sitemap_urls_found: number
  }
}

export type SeoV2AuditSummary = {
  id: string
  is_partial: boolean
  crawl_coverage: number
  pages_crawled: number
  issues_count: number
  critical_count: number
  high_count: number
  technical_score: number | null
  confidence: number
  created_at: string
  crawl_job: { mode: string; url: string; status: string }
}

export type SeoV2Progress = {
  crawl_job_id: string
  status: SeoV2JobStatus
  pages_crawled: number
  pages_queued: number
  pages_failed: number
  crawl_coverage: number | null
  partial_reason: string | null
  started_at: string | null
  completed_at: string | null
  audit_id: string | null
}

export type GscStatus = {
  connected: boolean
  connection_id?: string
  selected_site_url?: string | null
  last_synced_at?: string | null
  data_freshness_date?: string | null
}

export type GscKeyword = {
  query: string
  page: string | null
  clicks: number
  impressions: number
  ctr: number
  avg_position: number
  position_change: number | null
  clicks_change: number | null
  groups: string[]
}

export type GscPage = {
  page: string
  clicks: number
  impressions: number
  avg_position: number
  ctr: number
  trend: "gaining" | "losing" | "stable"
}

export type SeoV2CoverageStatus = "COVERED" | "WEAK" | "GAP"

export type SeoV2PromptInsight = {
  id: string
  prompt_id: string
  keyword: string
  topic: string
  intent: string
  funnel: string
  priority_score: number
  seo_coverage: SeoV2CoverageStatus
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
  response_count: number
  mentioned_responses: number
  engines: string[]
  last_observed_at: string | null
}

export type SeoV2SearchIntelligence = {
  generated_at: string
  window_days: number
  latest_audit: {
    id: string
    created_at: string
    pages_crawled: number
  } | null
  profile: {
    brand_name: string
    brand_url: string
    location: string
    industry: string | null
    buyer_persona: string | null
    keywords: string[]
    tracked_competitors: number
    completeness: number
    missing_fields: string[]
  }
  summary: {
    tracked_prompts: number
    recent_answers: number
    ai_visibility: number | null
    ai_avg_position: number | null
    covered_prompts: number
    weak_prompts: number
    content_gaps: number
    source_domains: number
  }
  prompts: SeoV2PromptInsight[]
  content_opportunities: {
    id: string
    title: string
    description: string
    target_keyword: string
    recommended_page_type: string
    priority: "HIGH" | "MEDIUM" | "LOW"
    mapped_page_url: string | null
  }[]
  sources: {
    domain: string
    appearances: number
    cited_appearances: number
    answer_coverage: number
    avg_source_position: number | null
    source_type: string
    sample_url: string
    sample_title: string | null
  }[]
  competitors: {
    id: string
    name: string
    url: string | null
    response_mentions: number
    visibility: number
    avg_position: number | null
  }[]
  local_signals: {
    id: string
    label: string
    status: "PASS" | "NEEDS_WORK" | "NO_CRAWL"
    reason: string
  }[]
}

export const CREDIT_COSTS: Record<SeoV2CrawlMode, number> = {
  QUICK: 10,
  STANDARD: 25,
  DEEP: 75,
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useSeoV2(projectId: string | null) {
  const [audit, setAudit] = useState<SeoV2Audit | null>(null)
  const [history, setHistory] = useState<SeoV2AuditSummary[]>([])
  const [progress, setProgress] = useState<SeoV2Progress | null>(null)
  const [gscStatus, setGscStatus] = useState<GscStatus | null>(null)
  const [gscKeywords, setGscKeywords] = useState<GscKeyword[]>([])
  const [gscPages, setGscPages] = useState<GscPage[]>([])
  const [auditPages, setAuditPages] = useState<SeoV2Page[]>([])
  const [intelligence, setIntelligence] = useState<SeoV2SearchIntelligence | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingIntelligence, setIsLoadingIntelligence] = useState(false)
  const [isCrawling, setIsCrawling] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const clearPoll = () => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null }
  }

  const loadHistory = useCallback(async () => {
    if (!projectId) return
    try {
      const res = await api.get<{ audits: SeoV2AuditSummary[] }>(`/seo/v2/${projectId}/audits`)
      setHistory(res.data.audits ?? [])
    } catch { /* silent */ }
  }, [projectId])

  const loadAudit = useCallback(async (auditId: string) => {
    if (!projectId) return
    setIsLoading(true)
    setError(null)
    try {
      const res = await api.get<SeoV2Audit>(`/seo/v2/${projectId}/audits/${auditId}`)
      setAudit(res.data)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load audit")
    } finally {
      setIsLoading(false)
    }
  }, [projectId])

  const loadAuditPages = useCallback(async (auditId: string) => {
    if (!projectId) return
    try {
      const res = await api.get<{ pages: SeoV2Page[] }>(`/seo/v2/${projectId}/audits/${auditId}/pages`)
      setAuditPages(res.data.pages ?? [])
    } catch { /* silent */ }
  }, [projectId])

  const loadIntelligence = useCallback(async () => {
    if (!projectId) return
    setIsLoadingIntelligence(true)
    try {
      const res = await api.get<SeoV2SearchIntelligence>(`/seo/v2/${projectId}/intelligence`)
      setIntelligence(res.data)
    } catch (e: any) {
      const message = e?.response?.data?.error
      if (message) setError(message)
    } finally {
      setIsLoadingIntelligence(false)
    }
  }, [projectId])

  const startCrawl = useCallback(async (mode: SeoV2CrawlMode) => {
    if (!projectId) return
    setIsCrawling(true)
    setError(null)
    setAudit(null)
    setProgress(null)
    try {
      const res = await api.post<{ crawl_job_id: string }>(`/seo/v2/${projectId}/audits`, { mode })
      const jobId = res.data.crawl_job_id

      // Start polling
      pollRef.current = setInterval(async () => {
        try {
          const prog = await api.get<SeoV2Progress>(`/seo/v2/${projectId}/audits/progress/${jobId}`)
          setProgress(prog.data)

          if (prog.data.status === "COMPLETED" || prog.data.status === "PARTIAL") {
            clearPoll()
            setIsCrawling(false)
            if (prog.data.audit_id) {
              await loadAudit(prog.data.audit_id)
              await Promise.all([loadHistory(), loadIntelligence()])
            }
          } else if (prog.data.status === "FAILED") {
            clearPoll()
            setIsCrawling(false)
            setError("Crawl failed. Credits have been refunded.")
          }
        } catch { /* retry next tick */ }
      }, 3000)

    } catch (e: any) {
      setIsCrawling(false)
      const msg = e?.response?.data?.error ?? (e instanceof Error ? e.message : "Failed to start audit")
      if (msg.includes("Insufficient") || e?.response?.status === 402) {
        setError("Insufficient credits to run this audit.")
      } else {
        setError(msg)
      }
    }
  }, [projectId, loadAudit, loadHistory, loadIntelligence])

  const clearAudit = useCallback(() => {
    setAudit(null)
    setProgress(null)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [])

  // GSC
  const loadGscStatus = useCallback(async () => {
    if (!projectId) return
    try {
      const res = await api.get<GscStatus>(`/seo/v2/${projectId}/gsc/status`)
      setGscStatus(res.data)
    } catch { /* silent */ }
  }, [projectId])

  const syncGsc = useCallback(async () => {
    if (!projectId) return
    setIsSyncing(true)
    try {
      await api.post(`/seo/v2/${projectId}/gsc/sync`)
      await loadGscStatus()
    } catch (e: any) {
      setError(e?.response?.data?.error ?? "GSC sync failed")
    } finally {
      setIsSyncing(false)
    }
  }, [projectId, loadGscStatus])

  const loadGscKeywords = useCallback(async (group?: string) => {
    if (!projectId) return
    try {
      const params = group ? `?group=${group}` : ""
      const res = await api.get<{ opportunities: GscKeyword[] }>(`/seo/v2/${projectId}/gsc/keywords${params}`)
      setGscKeywords(res.data.opportunities ?? [])
    } catch { /* silent */ }
  }, [projectId])

  const loadGscPages = useCallback(async () => {
    if (!projectId) return
    try {
      const res = await api.get<{ pages: GscPage[] }>(`/seo/v2/${projectId}/gsc/pages`)
      setGscPages(res.data.pages ?? [])
    } catch { /* silent */ }
  }, [projectId])

  const connectGsc = useCallback(async () => {
    if (!projectId) return
    try {
      const res = await api.get<{ auth_url: string }>(`/seo/v2/${projectId}/gsc/auth-url`)
      window.open(res.data.auth_url, "_blank")
    } catch { /* silent */ }
  }, [projectId])

  // Mark issue verified
  const markIssueVerified = useCallback(async (
    issueId: string,
    verification: "VERIFIED_FIXED" | "VERIFIED_STILL_PRESENT"
  ) => {
    if (!projectId) return
    try {
      await api.post(`/seo/v2/${projectId}/issues/${issueId}/mark-verified`, { verification })
      if (audit) {
        setAudit(prev => prev ? {
          ...prev,
          issues: prev.issues.map(i => i.id === issueId ? { ...i, verification } : i)
        } : null)
      }
    } catch { /* silent */ }
  }, [projectId, audit])

  useEffect(() => {
    if (projectId) {
      setAudit(null)
      setIntelligence(null)
      void loadHistory()
      void loadGscStatus()
      void loadIntelligence()
    }
    return clearPoll
  }, [projectId, loadHistory, loadGscStatus, loadIntelligence])

  return {
    audit,
    history,
    progress,
    gscStatus,
    gscKeywords,
    gscPages,
    auditPages,
    intelligence,
    isLoading,
    isLoadingIntelligence,
    isCrawling,
    isSyncing,
    error,
    startCrawl,
    loadAudit,
    loadAuditPages,
    loadIntelligence,
    clearAudit,
    loadHistory,
    loadGscStatus,
    syncGsc,
    loadGscKeywords,
    loadGscPages,
    connectGsc,
    markIssueVerified,
    setError,
  }
}
