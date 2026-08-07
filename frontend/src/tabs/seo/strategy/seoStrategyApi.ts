import { api } from "@/lib/api"

export type StrategyTier = "quick" | "standard" | "deep"

export interface StrategyRunInput {
    tier: StrategyTier
    max_credits?: number
    country: string
    language_code?: string
    services?: string[]
    target_audience?: string
    goals?: string[]
    competitor_domains?: string[]
    max_pages?: number
    include_provider_research?: boolean
    include_backlinks?: boolean
    run_ai_visibility?: boolean
    ai_prompt_count?: number
}

export interface StrategyStep {
    id: string
    run_id: string
    step_key: string
    status: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED"
    attempts: number
    result: any
    error_reason: string | null
    started_at: string | null
    completed_at: string | null
}

export interface StrategyFinding {
    id: string
    run_id: string
    category: string
    title: string
    summary: string
    severity: "INFO" | "MEDIUM" | "HIGH" | "CRITICAL"
    evidence: Record<string, any>
    created_at: string
}

export interface StrategyRecommendation {
    id: string
    run_id: string
    title: string
    description: string
    category: string
    priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW"
    impact_score: number
    effort_score: number
    confidence_score: number
    recommended_action: string | null
    success_metric: string | null
    evidence: Record<string, any>
    approval_status: "PENDING" | "APPROVED" | "REJECTED"
    action_queue_id: string | null
    created_at: string
}

export interface StrategyRun {
    id: string
    project_id: string
    status: "QUEUED" | "RUNNING" | "WAITING_AI" | "COMPLETED" | "PARTIAL" | "FAILED"
    current_step: string
    progress_percent: number
    max_credits: number
    credits_spent: number
    provider_cost_usd: string | number
    audit_id: string | null
    visibility_run_id: string | null
    input: StrategyRunInput
    cost_breakdown: Record<string, any>
    summary: {
        tier?: StrategyTier
        crawled_pages?: number
        failed_urls?: number
        technical_score?: number | null
        research_sources?: string[]
        failures?: string[]
        plan?: {
            days_1_30: string[]
            days_31_60: string[]
            days_61_90: string[]
        }
        ai_visibility?: {
            visibility_percent: number | null
            successful_jobs: number
            total_jobs: number
        }
    } | null
    error_reason: string | null
    started_at: string | null
    completed_at: string | null
    created_at: string
    steps: StrategyStep[]
    findings: StrategyFinding[]
    recommendations: StrategyRecommendation[]
}

export const seoStrategyApi = {
    async startStrategyRun(projectId: string, input: StrategyRunInput): Promise<{ run_id: string; status: string; tier: StrategyTier; estimated_max_credits: number }> {
        const { data } = await api.post(`/seo/onboarding/${projectId}/start`, input)
        return data
    },

    async getLatestStrategyRun(projectId: string): Promise<StrategyRun | null> {
        const { data } = await api.get(`/seo/onboarding/${projectId}/latest`)
        return data.run ?? null
    },

    async getStrategyRun(runId: string): Promise<StrategyRun> {
        const { data } = await api.get(`/seo/onboarding/runs/${runId}`)
        return data
    },

    async retryStrategyRun(runId: string): Promise<{ run_id: string; status: string }> {
        const { data } = await api.post(`/seo/onboarding/runs/${runId}/retry`)
        return data
    },

    async approveRecommendation(recommendationId: string): Promise<StrategyRecommendation> {
        const { data } = await api.post(`/seo/onboarding/recommendations/${recommendationId}/approve`)
        return data
    },

    async rejectRecommendation(recommendationId: string): Promise<StrategyRecommendation> {
        const { data } = await api.post(`/seo/onboarding/recommendations/${recommendationId}/reject`)
        return data
    },
}
