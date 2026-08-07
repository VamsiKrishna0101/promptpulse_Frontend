export type WorkspaceMode = "GEO" | "SEO"

export const WORKSPACE_MODE_STORAGE_KEY = "promptpulse:workspace-mode"

const GEO_PRIMARY_PATHS = new Set([
  "/dashboard",
  "/opportunities",
  "/prompts",
  "/sources",
  "/competitors",
  "/analytics",
  "/chat",
  "/ai-workspace",
  "/ai-workspace/content-briefs",
  "/ai-workspace/actions",
])

export function workspaceModeFromPath(pathname: string): WorkspaceMode | null {
  if (pathname === "/seo" || pathname.startsWith("/seo/")) return "SEO"
  if (GEO_PRIMARY_PATHS.has(pathname) || pathname.startsWith("/prompts/")) return "GEO"
  return null
}

export function readStoredWorkspaceMode(): WorkspaceMode {
  if (typeof window === "undefined") return "GEO"
  return window.localStorage.getItem(WORKSPACE_MODE_STORAGE_KEY) === "SEO" ? "SEO" : "GEO"
}

export function persistWorkspaceMode(mode: WorkspaceMode) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(WORKSPACE_MODE_STORAGE_KEY, mode)
}

export function workspaceHome(mode: WorkspaceMode) {
  return mode === "SEO" ? "/seo" : "/dashboard"
}
