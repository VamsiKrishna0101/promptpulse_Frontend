import { api } from "@/lib/api"
import type { BrandResearchData, BrandResearchResult, Plan, SuggestedPrompt } from "./types"
import type { ProjectEngine } from "./types"

export type PlanQuota = {
  plan: Plan
  limits: {
    projects: number
    prompts: number
    competitors: number | "unlimited"
    refreshes_per_week: number | "daily"
    sara: "none" | "basic" | "full" | "advanced"
    exports: "none" | "basic" | "full"
    engine_limit: number | "all"
  }
  usage: {
    project_count: number
    prompt_count: number
    competitor_count: number
  }
  remaining: {
    projects: number
    prompts: number
    competitors: number | "unlimited"
  }
}

export async function getPlanQuota() {
  const response = await api.get<PlanQuota>("/subscription/quota")
  return response.data
}

export async function researchBrand(input: { brand_name: string; brand_url: string }) {
  const response = await api.post<BrandResearchResult>("/onboarding/research", input)
  return response.data
}

export async function generatePrompts(input: {
  brand_name: string
  brand_url: string
  brand_data: BrandResearchData
}) {
  const response = await api.post<{ prompts: Array<Omit<SuggestedPrompt, "source">> }>("/onboarding/prompts", input)
  return response.data.prompts.map((prompt) => ({ ...prompt, source: "GENERATED" as const }))
}

export async function createProject(input: {
  brand_name: string
  brand_url: string
  brand_location: string
  competitors: string[]
  engines: ProjectEngine[]
  prompts: Array<SuggestedPrompt & { selected: boolean }>
}) {
  const response = await api.post<{ id: string }>("/onboarding/project", input)
  return response.data
}

export async function enqueueInitialRun(projectId: string, promptIds?: string[]) {
  const response = await api.post("/scraping/runs", {
    project_id: projectId,
    prompt_ids: promptIds,
  })
  return response.data
}
