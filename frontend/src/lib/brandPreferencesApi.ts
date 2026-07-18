import { api } from "@/lib/api"

export type BrandPreference = {
  id: string
  project_id: string
  user_id: string
  industry_category: string
  buyer_persona: string | null
  keywords: string[]
  avoid_keywords: string[]
  competitor_context: string | null
  reddit_focus: string[]
  created_at: string
  updated_at: string
}

export type BrandPreferencePayload = {
  industry_category: string
  buyer_persona?: string | null
  keywords: string[]
  avoid_keywords: string[]
  competitor_context?: string | null
  reddit_focus: string[]
}

export async function getBrandPreference(projectId: string) {
  const response = await api.get<{ preference: BrandPreference | null }>(`/brand-preferences/${projectId}`)
  return response.data.preference
}

export async function saveBrandPreference(projectId: string, payload: BrandPreferencePayload) {
  const response = await api.put<{ preference: BrandPreference }>(`/brand-preferences/${projectId}`, payload)
  return response.data.preference
}
