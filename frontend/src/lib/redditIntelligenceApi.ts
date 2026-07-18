import { api } from "@/lib/api"
import type { BrandPreference } from "@/lib/brandPreferencesApi"

export type RedditScanMode = "standard" | "deep"

export type RedditPost = {
  id: string
  run_id?: string | null
  url: string
  subreddit: string | null
  title: string
  description: string | null
  author: string | null
  keyword: string | null
  num_comments: number
  num_upvotes: number
  date_posted: string | null
  sentiment: string | null
  intent: string | null
  importance_score: number
  relevance_score?: number
  relevance_bucket?: "relevant" | "maybe" | "rejected"
  relevance_reasons?: string[]
  mentioned_brands: string[]
  mentioned_competitors: string[]
  raw_json?: Record<string, any> | null
  created_at: string
}

export type RedditRun = {
  id: string
  mode: RedditScanMode | string
  status: string
  credits_spent: number
  post_limit: number
  keyword_count: number
  keywords: string[]
  summary: Record<string, any> | null
  themes: Array<Record<string, any>>
  actions: Array<Record<string, any>>
  completed_at: string | null
  created_at: string
  posts?: RedditPost[]
}

export type AiCitedRedditThread = {
  id: string
  url: string
  domain: string
  title: string | null
  snippet: string | null
  subreddit: string | null
  chat: {
    id: string
    ai_model: string
    brand_mentioned: boolean
    sentiment_score: number | null
    created_at: string
    prompt: {
      id: string
      text: string
      topic: string
    }
  }
}

export type RedditIntelligenceResponse = {
  latest_run: RedditRun | null
  runs: RedditRun[]
  posts: RedditPost[]
  cited_threads: AiCitedRedditThread[]
  brand_preference: BrandPreference | null
  summary: Record<string, any>
}

export type RunRedditScanResponse = {
  run: RedditRun
  result: Record<string, any>
  intelligence: RedditIntelligenceResponse
}

export async function getRedditIntelligence(projectId: string) {
  const response = await api.get<RedditIntelligenceResponse>("/reddit-intelligence", {
    params: { project_id: projectId },
  })
  return response.data
}

export async function runRedditScan(projectId: string, mode: RedditScanMode) {
  const response = await api.post<RunRedditScanResponse>("/reddit-intelligence/run", {
    project_id: projectId,
    mode,
  })
  return response.data
}
