import { api } from "@/lib/api"

export type SiteAuditStatus = {
  id: string
  status: "QUEUED" | "RUNNING" | "COMPLETED" | "FAILED" | string
  url: string
  pagesCrawled: number
  issuesFound: number
  overallScore: number
  createdAt: string
  errorReason: string | null
}

export type SiteAuditPageRecord = {
  id: string
  url: string
  status_code: number | null
  title: string | null
  meta_description: string | null
  h1: string | null
  canonical: string | null
  word_count: number
  indexable: boolean
  has_viewport: boolean
  has_schema: boolean
  has_faq: boolean
  created_at: string
}

export type SiteAuditIssueRecord = {
  id: string
  page_id: string | null
  category: string
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO" | string
  title: string
  description: string
  recommendation: string
  priority_score: number
  created_at: string
}

export type SiteAuditRecord = {
  id: string
  project_id: string
  url: string
  status: string
  overall_score: number
  technical_score: number
  content_score: number
  ai_readiness_score: number
  local_score: number
  schema_score: number
  error_reason: string | null
  created_at: string
  updated_at: string
  pages: SiteAuditPageRecord[]
  issues: SiteAuditIssueRecord[]
}

export type SiteAuditHistoryRecord = Omit<SiteAuditRecord, "pages" | "issues"> & {
  _count: { pages: number }
}

export const siteAuditApi = {
  async start(projectId: string, input: { startUrl: string; maxPages: number }) {
    const { data } = await api.post<{ auditId: string }>(`/seo/site-audit/${projectId}/start`, input)
    return data
  },

  async status(projectId: string, auditId: string) {
    const { data } = await api.get<SiteAuditStatus>(`/seo/site-audit/${projectId}/${auditId}/status`)
    return data
  },

  async results(projectId: string, auditId: string) {
    const { data } = await api.get<SiteAuditRecord>(`/seo/site-audit/${projectId}/${auditId}/results`)
    return data
  },

  async history(projectId: string) {
    const { data } = await api.get<{ history: SiteAuditHistoryRecord[] }>(`/seo/site-audit/${projectId}/history`)
    return data.history ?? []
  },
}
