import { useNavigate } from "react-router-dom"
import { useProjects } from "@/hooks/useProjects"
import {
    DomainSearchForm,
    type SearchFormValues,
} from "../domain-research/components/DomainSearchForm"
import { SeoDomainResearchSnapshotList } from "../domain-research/components/SeoDomainResearchSnapshotList"
import "../domain-research/domain-overview.css"
import type { SeoWorkspaceModule } from "./seoWorkspaceModules"

export function SavedDomainReportPicker({ module }: { module: SeoWorkspaceModule }) {
    const navigate = useNavigate()
    const { selectedProject, isLoading } = useProjects()

    const runLiveReport = (values: SearchFormValues) => {
        navigate(`${module.path}?${reportQuery(values)}`, { state: { runLive: true } })
    }

    const openSnapshot = (domain: string, country: string, languageCode: string, historyMonths: number) => {
        navigate(`${module.path}?${reportQuery({
            domain,
            country,
            language_code: languageCode,
            historyMonths,
            keywordLimit: 100,
        })}`)
    }

    const isTopPages = module.id === "top-pages"
    const submitLabel = isTopPages ? "Analyze top pages" : "Find competitors"
    const description = module.id === "top-pages"
        ? "Find the organic landing pages driving the most traffic for any domain."
        : "Discover the domains competing for the same organic search audience."
    const limitOptions = isTopPages
        ? [{ value: 100 as const, label: "Top 100 pages" }, { value: 250 as const, label: "Top 250 pages" }, { value: 500 as const, label: "Top 500 pages" }, { value: 1000 as const, label: "Top 1,000 pages" }]
        : [{ value: 100 as const, label: "Top 100 competitors" }, { value: 250 as const, label: "Top 250 competitors" }]

    return (
        <div className="domain-overview-shell font-sans">
            <main className="domain-overview-page domain-search-page" data-testid={`${module.id}-report-picker`}>
                <DomainSearchForm
                    onSearch={runLiveReport}
                    isLoading={false}
                    title={module.title}
                    description={description}
                    submitLabel={submitLabel}
                    eyebrow="Organic research"
                    footerTitle="Fresh search available"
                    footerDescription={`Enter a domain to run a live ${isTopPages ? "Top Pages" : "Competitor"} analysis, or choose a saved report below.`}
                    depthLabel={isTopPages ? "Page depth" : "Competitor depth"}
                    limitOptions={limitOptions}
                    showHistory={false}
                />

                {isLoading ? (
                    <div className="dashboard-card flex h-36 items-center justify-center text-xs font-semibold text-zinc-500">
                        Loading saved reports…
                    </div>
                ) : selectedProject ? (
                    <SeoDomainResearchSnapshotList projectId={selectedProject.id} onSelectSnapshot={openSnapshot} />
                ) : (
                    <div className="dashboard-card flex h-36 items-center justify-center text-xs font-semibold text-zinc-500">
                        Select a project to view saved domain reports.
                    </div>
                )}
            </main>
        </div>
    )
}

function reportQuery(values: SearchFormValues) {
    return new URLSearchParams({
        domain: values.domain,
        country: values.country,
        language_code: values.language_code,
        range: String(values.historyMonths),
        limit: String(values.keywordLimit),
    }).toString()
}
