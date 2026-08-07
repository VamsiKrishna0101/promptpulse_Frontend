import { Navigate, useLocation } from "react-router-dom"
import { SeoWorkspaceModulePage } from "./SeoWorkspaceModulePage"
import { SeoWorkspaceOverview } from "./SeoWorkspaceOverview"
import { seoModuleFromPath } from "./seoWorkspaceModules"
import { DomainResearchPage } from "../domain-research/DomainResearchPage"
import { CachedDomainReportPage } from "./CachedDomainReportPage"
import { SavedDomainReportPicker } from "./SavedDomainReportPicker"
import { SiteAuditPage } from "../site-audit/SiteAuditPage"
import { BacklinksPage } from "../backlinks/BacklinksPage"
import { KeywordResearchPage } from "../keyword-research/KeywordResearchPage"

export function SeoWorkspacePage() {
  const location = useLocation()
  const module = seoModuleFromPath(location.pathname)

  if (module.id === "overview") return <SeoWorkspaceOverview />
  if (module.id === "domain-research") return <DomainResearchPage />
  if (module.id === "site-audit") return <SiteAuditPage />
  if (module.id === "backlinks") return <BacklinksPage />
  if (location.pathname.startsWith("/seo/rank-tracker")) return <Navigate to="/seo/keyword-research" replace />
  if (module.id === "keyword-research") return <KeywordResearchPage />
  if (["top-pages", "organic-competitors"].includes(module.id)) {
    return new URLSearchParams(location.search).has("domain")
      ? <CachedDomainReportPage module={module} />
      : <SavedDomainReportPicker module={module} />
  }
  return <SeoWorkspaceModulePage module={module} />
}
