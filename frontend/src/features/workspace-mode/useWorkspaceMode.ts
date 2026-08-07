import { useCallback, useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import {
  persistWorkspaceMode,
  readStoredWorkspaceMode,
  workspaceHome,
  workspaceModeFromPath,
  type WorkspaceMode,
} from "./workspaceMode"

export function useWorkspaceMode() {
  const location = useLocation()
  const navigate = useNavigate()
  const [mode, setMode] = useState<WorkspaceMode>(
    () => workspaceModeFromPath(location.pathname) ?? readStoredWorkspaceMode(),
  )

  useEffect(() => {
    const pathMode = workspaceModeFromPath(location.pathname)
    if (!pathMode) return
    setMode(pathMode)
    persistWorkspaceMode(pathMode)
  }, [location.pathname])

  const switchWorkspace = useCallback((nextMode: WorkspaceMode) => {
    setMode(nextMode)
    persistWorkspaceMode(nextMode)
    navigate(workspaceHome(nextMode))
  }, [navigate])

  return { mode, switchWorkspace }
}
