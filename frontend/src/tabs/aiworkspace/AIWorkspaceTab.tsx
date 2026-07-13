import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { AgentHub } from "./components/AgentHub"
import { ReportsPage } from "./components/reports/ReportsPage"
import { GeoArticlesTab } from "@/tabs/geoarticles/GeoArticlesTab"

export type WorkspaceView = "hub" | "reports" | "contentBriefs"

export function AIWorkspaceTab() {
  const location = useLocation()
  const navigate = useNavigate()
  const routeView: WorkspaceView = location.pathname === "/ai-workspace/content-briefs" ? "contentBriefs" : "hub"
  const [view, setView] = useState<WorkspaceView>(routeView)

  useEffect(() => {
    setView(routeView)
  }, [routeView])

  if (view === "reports") {
    return <ReportsPage onBack={() => setView("hub")} />
  }

  if (view === "contentBriefs") {
    return (
      <div data-product-tour-id="ai-workspace-content-briefs">
        <GeoArticlesTab />
      </div>
    )
  }

  return (
    <div data-product-tour-id="ai-workspace-shell">
      <AgentHub
        onOpenReports={() => setView("reports")}
        onOpenContentBriefs={() => navigate("/ai-workspace/content-briefs")}
      />
    </div>
  )
}
