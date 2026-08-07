import { api } from "@/lib/api"

export type KeywordMatchType = "phrase" | "exact" | "broad" | "related"

export type KeywordResearchRow = {
  keyword: string
  searchVolume: number | null
  cpc: number | null
  keywordDifficulty: number | null
  competition: number | string | null
  intent: string | null
  serpFeatures: string[]
  trend: number[]
}

export type KeywordResearchPayload = {
  query: string
  database: string
  matchType: KeywordMatchType
  pages: number
  summary: {
    returnedKeywords: number
    totalSearchVolume: number
    averageDifficulty: number | null
    averageCpc: number | null
  }
  keywords: KeywordResearchRow[]
  snapshot: {
    id: string
    fetchedAt: string
    expiresAt: string
    cacheStatus: "HIT" | "STALE" | "REFRESHED"
  }
}

export type KeywordResearchInput = {
  q: string
  db: string
  type: KeywordMatchType
  pages: number
}

export const keywordResearchApi = {
  async get(projectId: string, input: KeywordResearchInput) {
    const { data } = await api.get<KeywordResearchPayload>(`/seo/keyword-research/${projectId}/research`, { params: input })
    return data
  },
  async run(projectId: string, input: KeywordResearchInput) {
    const { data } = await api.post<KeywordResearchPayload>(`/seo/keyword-research/${projectId}/research/refresh`, input)
    return data
  },
  async listRuns(projectId: string) {
    const { data } = await api.get<KeywordResearchPayload[]>(`/seo/keyword-research/${projectId}/runs`, { params: { limit: 12 } })
    return data
  },
}
