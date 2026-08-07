import { useState } from "react"
import { ArrowLeft, ExternalLink, FileText, Presentation, RefreshCw } from "lucide-react"
import { countryFlagUrl } from "@/lib/countries"
import type { DomainResearchOverviewPayload } from "../api/domainResearchTypes"

type Props = {
    overview: DomainResearchOverviewPayload
    onRefresh: () => void
    onNewSearch: () => void
    onExportPptx: () => void
    onExportPdf: () => void
    isExportingPptx?: boolean
    isExportingPdf?: boolean
    isLoading: boolean
    lastOptions?: { historyMonths?: number; keywordLimit?: number } | null
}

export function DomainOverviewHeader({
    overview,
    onRefresh,
    onNewSearch,
    onExportPptx,
    onExportPdf,
    isExportingPptx = false,
    isExportingPdf = false,
    isLoading,
    lastOptions,
}: Props) {
    const [logoFailed, setLogoFailed] = useState(false)
    const { target } = overview

    return (
        <header className="dashboard-card domain-report-header">
            <div className="domain-report-header-main">
                <button type="button" onClick={onNewSearch} className="domain-header-back" aria-label="Start a new domain search">
                    <ArrowLeft className="h-4 w-4" />
                    <span>New search</span>
                </button>

                <div className="domain-header-divider" />

                <div className="domain-header-identity">
                    <span className="domain-header-logo">
                        {!logoFailed ? (
                            <img
                                src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(target.domain)}&sz=128`}
                                alt=""
                                onError={() => setLogoFailed(true)}
                            />
                        ) : (
                            <span>{target.domain.charAt(0)}</span>
                        )}
                    </span>
                    <div className="min-w-0">
                        <div className="flex min-w-0 items-center gap-2">
                            <h1 className="domain-header-title">{target.domain}</h1>
                            <a className="domain-header-external" href={`https://${target.domain}`} target="_blank" rel="noreferrer" aria-label={`Open ${target.domain}`}>
                                <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                        </div>
                        <div className="domain-header-meta">
                            <span className="domain-market-chip">
                                <img src={countryFlagUrl(target.countryIsoCode)} alt="" />
                                {target.locationName}
                            </span>
                            <span>{target.languageName}</span>
                            <span>{lastOptions?.historyMonths ?? overview.availableHistoryMonths} months</span>
                            <span>Top {lastOptions?.keywordLimit ?? 100}</span>
                        </div>
                    </div>
                </div>

                <div className="domain-header-actions">
                    <button
                        type="button"
                        onClick={onExportPptx}
                        disabled={isExportingPptx}
                        className="premium-action domain-header-action"
                        style={{ background: "#fffaf5", borderColor: "#fed7aa", color: "#b45309" }}
                        title="Export 16:9 PowerPoint Presentation"
                    >
                        {isExportingPptx ? (
                            <span className="h-3 w-3 animate-spin border-2 border-[#b45309]/30 border-t-[#b45309]" />
                        ) : (
                            <Presentation className="h-3.5 w-3.5 text-[#b45309]" />
                        )}
                        PPTX
                    </button>
                    <button
                        type="button"
                        onClick={onExportPdf}
                        disabled={isExportingPdf}
                        className="premium-action domain-header-action"
                        style={{ background: "#f0fdf4", borderColor: "#a7f3d0", color: "#047857" }}
                        title="Export Executive PDF Report"
                    >
                        {isExportingPdf ? (
                            <span className="h-3 w-3 animate-spin border-2 border-[#047857]/30 border-t-[#047857]" />
                        ) : (
                            <FileText className="h-3.5 w-3.5 text-[#047857]" />
                        )}
                        PDF
                    </button>
                    <button type="button" onClick={onRefresh} disabled={isLoading} className="domain-refresh-button">
                        <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
                        {isLoading ? "Refreshing" : "Refresh data"}
                    </button>
                </div>
            </div>
        </header>
    )
}
