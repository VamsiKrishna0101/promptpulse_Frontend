import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { AgentHub } from "./components/AgentHub"
import { ReportsPage } from "./components/reports/ReportsPage"
import { GeoArticlesTab } from "@/tabs/geoarticles/GeoArticlesTab"
import { ActionQueuePage } from "./components/action-queue/ActionQueuePage"
import { RedditIntelligencePage } from "./components/reddit-intelligence/RedditIntelligencePage"

export type WorkspaceView = "hub" | "reports" | "contentBriefs" | "actionQueue" | "reddit"

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

  if (view === "actionQueue") {
    return <ActionQueuePage onBack={() => setView("hub")} />
  }

  if (view === "reddit") {
    return <RedditIntelligencePage onBack={() => setView("hub")} />
  }

  if (view === "contentBriefs") {
    return (
      <div data-product-tour-id="ai-workspace-content-briefs" className="min-h-full bg-zinc-50/40">
        <GeoArticlesTab />
      </div>
    )
  }

  return (
    <div data-product-tour-id="ai-workspace-shell" className="min-h-full bg-zinc-50/40 p-1">
      <AgentHub
        onOpenReports={() => setView("reports")}
        onOpenActionQueue={() => setView("actionQueue")}
        onOpenReddit={() => setView("reddit")}
        onOpenContentBriefs={() => navigate("/ai-workspace/content-briefs")}
      />
    </div>
  )
}
