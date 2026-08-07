import { api } from "@/lib/api"

import type {
    BacklinksOverviewPayload,
    BacklinksReportListItem,
    BacklinksReportPayload,
    CompetitorsPayload,
    DomainResearchOverviewPayload,
    OrganicKeywordsPayload,
    TopPagesPayload,
} from "./domainResearchTypes"

export type DomainResearchScope = {
    domain: string
    country: string
    language_code: string
    range?: number // 1-12 months
}

export type SnapshotParams = {
    page?: number
    page_size?: number
}

export const domainResearchApi = {
    async listBacklinksReports(projectId: string): Promise<{ reports: BacklinksReportListItem[]; total: number }> {
        const { data } = await api.get(`/seo/backlinks/${projectId}/reports`)
        return data
    },

    async getBacklinksReport(
        projectId: string,
        target: string,
        scope: "domain" | "page",
        reportMode: "normal" | "detailed",
    ): Promise<BacklinksReportPayload> {
        const { data } = await api.get(`/seo/backlinks/${projectId}/report`, {
            params: { target, scope, report_mode: reportMode },
        })
        return data
    },

    async refreshBacklinksReport(
        projectId: string,
        target: string,
        scope: "domain" | "page",
        reportMode: "normal" | "detailed",
    ): Promise<BacklinksReportPayload> {
        const { data } = await api.post(`/seo/backlinks/${projectId}/report/refresh`, {
            target,
            scope,
            report_mode: reportMode,
        })
        return data
    },
    async getLocations(): Promise<any[]> {
        const { data } = await api.get("/seo/domain-research/locations")
        return data.locations
    },

    async listSnapshots(projectId: string, params?: SnapshotParams): Promise<any> {
        const { data } = await api.get(`/seo/domain-research/${projectId}/snapshots`, { params })
        return data
    },

    async getOverview(projectId: string, scope: DomainResearchScope): Promise<DomainResearchOverviewPayload> {
        const { data } = await api.get(`/seo/domain-research/${projectId}/overview`, {
            params: { ...scope, range: scope.range || 12 },
        })
        return data
    },

    async getOrganicKeywords(projectId: string, scope: DomainResearchScope): Promise<OrganicKeywordsPayload> {
        const { data } = await api.get(`/seo/domain-research/${projectId}/organic-keywords`, {
            params: scope,
        })
        return data
    },

    async getTopPages(projectId: string, scope: DomainResearchScope): Promise<TopPagesPayload> {
        const { data } = await api.get(`/seo/domain-research/${projectId}/top-pages`, {
            params: scope,
        })
        return data
    },

    async getCompetitors(projectId: string, scope: DomainResearchScope): Promise<CompetitorsPayload> {
        const { data } = await api.get(`/seo/domain-research/${projectId}/competitors`, {
            params: scope,
        })
        return data
    },

    async getKeywordGap(
        projectId: string,
        scope: DomainResearchScope,
        competitorDomain: string
    ): Promise<any> {
        const { data } = await api.get(`/seo/domain-research/${projectId}/keyword-gap`, {
            params: { ...scope, competitor_domain: competitorDomain },
        })
        return data
    },

    async getBacklinksOverview(projectId: string, scope: DomainResearchScope): Promise<BacklinksOverviewPayload> {
        const { data } = await api.get(`/seo/backlinks/${projectId}/overview`, {
            params: { target: scope.domain, scope: "domain" },
        })
        return data
    },

    async refreshBacklinksOverview(projectId: string, scope: DomainResearchScope): Promise<BacklinksOverviewPayload> {
        const { data } = await api.post(`/seo/backlinks/${projectId}/overview/refresh`, {
            target: scope.domain,
            scope: "domain",
        })
        return data
    },

    async refreshOverview(projectId: string, scope: DomainResearchScope & { range?: number }): Promise<DomainResearchOverviewPayload> {
        const { data } = await api.post(`/seo/domain-research/${projectId}/overview/refresh`, {
            domain: scope.domain,
            country: scope.country,
            language_code: scope.language_code,
            range: scope.range ?? 6,
        })
        return data
    },

    async refreshOrganicKeywords(
        projectId: string,
        scope: DomainResearchScope,
        limit: 100 | 250 | 500 | 1000 = 100
    ): Promise<OrganicKeywordsPayload> {
        const { data } = await api.post(`/seo/domain-research/${projectId}/organic-keywords/refresh`, {
            domain: scope.domain,
            country: scope.country,
            language_code: scope.language_code,
            limit,
        })
        return data
    },

    async refreshTopPages(
        projectId: string,
        scope: DomainResearchScope,
        limit: 25 | 50 | 100 | 250 | 500 | 1000 = 100
    ): Promise<TopPagesPayload> {
        const { data } = await api.post(`/seo/domain-research/${projectId}/top-pages/refresh`, {
            domain: scope.domain,
            country: scope.country,
            language_code: scope.language_code,
            limit,
        })
        return data
    },

    async refreshCompetitors(
        projectId: string,
        scope: DomainResearchScope,
        limit: 25 | 50 | 100 | 250 = 100
    ): Promise<CompetitorsPayload> {
        const { data } = await api.post(`/seo/domain-research/${projectId}/competitors/refresh`, {
            domain: scope.domain,
            country: scope.country,
            language_code: scope.language_code,
            limit,
        })
        return data
    },
}
