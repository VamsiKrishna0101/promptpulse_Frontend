import { api } from "./api"

export type ProjectEngine = "CHATGPT" | "GEMINI" | "PERPLEXITY" | "GOOGLE_AI_MODE" | "COPILOT"

export type ProjectEnginesResponse = {
  engines: ProjectEngine[]
  selectable: ProjectEngine[]
  limit: number | "all"
  plan: string
}

export async function getProjectEngines(projectId: string): Promise<ProjectEnginesResponse> {
  const response = await api.get<ProjectEnginesResponse>(`/projects/${projectId}/engines`)
  return response.data
}

export async function updateProjectEngines(
  projectId: string,
  engines: ProjectEngine[],
): Promise<{ engines: ProjectEngine[] }> {
  const response = await api.put<{ engines: ProjectEngine[] }>(`/projects/${projectId}/engines`, { engines })
  return response.data
}
