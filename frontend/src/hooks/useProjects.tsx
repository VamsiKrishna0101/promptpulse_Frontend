import { createContext, useContext, useEffect, useMemo, useState } from "react"
import type { ReactNode } from "react"
import { api } from "@/lib/api"

export type ProjectPrompt = {
  id: string
  text: string
  topic: string
  type: string
  status: string
  is_active: boolean
  last_run_at: string | null
}

export type ProjectRun = {
  id: string
  status: "QUEUED" | "RUNNING" | "SUCCESS" | "PARTIAL_SUCCESS" | "FAILED"
  ran_at: string
  completed_at: string | null
  scrape_jobs: {
    id: string
    engine: "CHATGPT" | "GEMINI" | "PERPLEXITY" | "GOOGLE_AI_OVERVIEW" | "GOOGLE_AI_MODE" | "COPILOT"
    status: string
    prompt_id: string
    completed_at: string | null
    created_at: string
    error_reason: string | null
    retry_count: number
    chat_id: string | null
    geo_country_code: string | null
    geo_city: string | null
  }[]
}

export type Project = {
  id: string
  brand_name: string
  brand_url: string
  brand_location: string
  prompts: ProjectPrompt[]
  competitors: { id: string; name: string }[]
  runs: ProjectRun[]
}

type ProjectsContextValue = {
  projects: Project[]
  selectedProject: Project | null
  selectedProjectId: string | null
  selectProject: (projectId: string) => void
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
}

const ProjectsContext = createContext<ProjectsContextValue | null>(null)

export function ProjectsProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(() => localStorage.getItem("promptpulse_selected_project_id"))
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function refresh() {
    setIsLoading(true)
    setError(null)
    try {
      const response = await api.get<Project[]>("/projects")
      setProjects(response.data)
      const remembered = localStorage.getItem("promptpulse_selected_project_id")
      const nextId = response.data.find((project) => project.id === remembered)?.id ?? response.data[0]?.id ?? null
      setSelectedProjectId(nextId)
      if (nextId) localStorage.setItem("promptpulse_selected_project_id", nextId)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load projects")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
  }, [])

  const value = useMemo<ProjectsContextValue>(() => ({
    projects,
    selectedProject: projects.find((project) => project.id === selectedProjectId) ?? projects[0] ?? null,
    selectedProjectId,
    selectProject(projectId: string) {
      setSelectedProjectId(projectId)
      localStorage.setItem("promptpulse_selected_project_id", projectId)
    },
    isLoading,
    error,
    refresh,
  }), [projects, selectedProjectId, isLoading, error])

  return <ProjectsContext.Provider value={value}>{children}</ProjectsContext.Provider>
}

export function useProjects() {
  const context = useContext(ProjectsContext)
  if (!context) {
    throw new Error("useProjects must be used inside ProjectsProvider")
  }
  return context
}
