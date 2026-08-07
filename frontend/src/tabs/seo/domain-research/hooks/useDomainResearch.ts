import { useState, useCallback } from "react"
import { domainResearchApi, type DomainResearchScope } from "../api/domainResearchApi"
import type {
    BacklinksOverviewPayload,
    DomainResearchOverviewPayload,
    OrganicKeywordsPayload,
    TopPagesPayload,
    CompetitorsPayload
} from "../api/domainResearchTypes"
import type { TrafficIntelligencePayload } from "../traffic-intelligence/api/trafficIntelligenceTypes"

export type DomainResearchData = {
    overview: DomainResearchOverviewPayload
    organicKeywords: OrganicKeywordsPayload
    topPages: TopPagesPayload
    competitors: CompetitorsPayload
    backlinks: BacklinksOverviewPayload | null
    trafficIntelligence?: TrafficIntelligencePayload | null
}

export type AnalyzeOptions = {
    keywordLimit?: 100 | 250 | 500 | 1000
    historyMonths?: number
    /** If true, explicitly refresh from DataForSEO. Normal report opening is cache-only. */
    forceRefresh?: boolean
}

// Always null on mount — user must explicitly search
export function useDomainResearch(projectId: string | null) {
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)
    const [data, setData] = useState<DomainResearchData | null>(null)
    const [lastScope, setLastScope] = useState<DomainResearchScope | null>(null)

    const clearData = useCallback(() => {
        setData(null)
        setLastScope(null)
        setError(null)
    }, [])

    const analyzeDomain = useCallback(async (
        scope: DomainResearchScope,
        options: AnalyzeOptions = {}
    ) => {
        if (!projectId) return
        setIsLoading(true)
        setError(null)

        const limit = options.keywordLimit ?? 100
        const range = options.historyMonths ?? 1
        const forceRefresh = options.forceRefresh ?? false

        try {
            let overview: DomainResearchOverviewPayload
            let organicKeywords: OrganicKeywordsPayload
            let topPages: TopPagesPayload
            let competitors: CompetitorsPayload

            let backlinks: BacklinksOverviewPayload | null = null
            
            if (forceRefresh) {
                // Live fetch from DataForSEO
                ;[overview, organicKeywords, topPages, competitors, backlinks] = await Promise.all([
                    domainResearchApi.refreshOverview(projectId, { ...scope, range }),
                    domainResearchApi.refreshOrganicKeywords(projectId, scope, limit),
                    domainResearchApi.refreshTopPages(projectId, scope, 100),
                    domainResearchApi.refreshCompetitors(projectId, scope, 100),
                    domainResearchApi.refreshBacklinksOverview(projectId, scope).catch(() => null),
                ])
            } else {
                // Read from DB cache
                ;[overview, organicKeywords, topPages, competitors, backlinks] = await Promise.all([
                    domainResearchApi.getOverview(projectId, scope),
                    domainResearchApi.getOrganicKeywords(projectId, scope),
                    domainResearchApi.getTopPages(projectId, scope),
                    domainResearchApi.getCompetitors(projectId, scope),
                    domainResearchApi.getBacklinksOverview(projectId, scope).catch(() => null),
                ])
            }

            setData({ overview, organicKeywords, topPages, competitors, backlinks })
            setLastScope(scope)
        } catch (err: any) {
            const msg = err?.response?.data?.error || err.message || "Failed to analyze domain"
            setError(msg)
            setData(null)
            setLastScope(null)
        } finally {
            setIsLoading(false)
        }
    }, [projectId])

    return {
        isLoading,
        error,
        data,
        lastScope,
        analyzeDomain,
        clearData,
    }
}
