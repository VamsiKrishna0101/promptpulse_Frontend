import { api } from "@/lib/api"

export type ActionQueueStatus = "OPEN" | "IN_PROGRESS" | "DONE" | "DISMISSED"
export type ActionQueuePriority = "HIGH" | "MEDIUM" | "LOW"
export type ActionQueueCategory =
  | "CONTENT"
  | "SOURCE"
  | "PROMPT"
  | "COMPETITOR"
  | "MODEL"
  | "TECHNICAL"
  | "REPORT"

export type ActionQueueItem = {
  id: string
  project_id: string
  user_id: string
  title: string
  description: string
  category: ActionQueueCategory | string
  priority: ActionQueuePriority | string
  status: ActionQueueStatus | string
  impact_score: number
  effort_score: number
  confidence_score: number
  recommended_action: string | null
  success_metric: string | null
  evidence: Record<string, unknown>
  source_type: string | null
  source_ref_id: string | null
  due_at: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
}

export type GenerateActionQueueResponse = {
  request_id: string
  project_id: string
  brand_name: string | null
  signals: Record<string, unknown>
  prioritized_actions: Array<Record<string, unknown>>
  persisted_actions: ActionQueueItem[]
  errors: string[]
  workflow_stage: string
}

export async function listActionQueue(projectId: string, status?: string) {
  const response = await api.get<ActionQueueItem[]>("/action-queue", {
    params: {
      project_id: projectId,
      ...(status && status !== "ALL" ? { status } : {}),
    },
  })
  return response.data
}

export async function generateActionQueue(projectId: string, lookbackDays = 30) {
  const response = await api.post<GenerateActionQueueResponse>("/action-queue/generate", {
    project_id: projectId,
    lookback_days: lookbackDays,
  })
  return response.data
}

export async function updateActionQueueStatus(itemId: string, status: ActionQueueStatus) {
  const response = await api.patch<ActionQueueItem>(`/action-queue/${itemId}`, { status })
  return response.data
}
