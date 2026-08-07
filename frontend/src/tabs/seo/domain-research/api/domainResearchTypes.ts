export type SeoMarket = {
    locationCode: number
    locationName: string
    countryIsoCode: string
    languageCode: string
    languageName: string
}

export type DomainResearchTarget = {
    domain: string
    locationCode: number
    locationName: string
    countryIsoCode: string
    languageCode: string
    languageName: string
}

export type ClickstreamDemographics = {
    female: number
    male: number
    age18to24: number
    age25to34: number
    age35to44: number
    age45to54: number
    age55to64: number
    age65Plus: number
} | null

export type SearchSummary = {
    traffic: number
    keywords: number
    trafficValueUsd: number
    clickstreamTraffic: number
    clickstreamDemographics: ClickstreamDemographics
}

export type RankingDistribution = {
    top3: number
    positions4To10: number
    positions11To20: number
    positions21To50: number
    positions51To100: number
}

export type SearchChanges = {
    new: number
    improved: number
    declined: number
    lost: number
}

export type ProviderMetadata = {
    provider: "dataforseo"
    environment: "sandbox" | "production"
    estimated: true
}

export type DomainResearchOverviewPayload = {
    target: DomainResearchTarget
    summary: {
        organic: SearchSummary
        paid: SearchSummary
    }
    rankingDistribution: RankingDistribution
    changes: SearchChanges
    history: {
        date: string
        organic: SearchSummary
        paid: SearchSummary
        rankingDistribution: RankingDistribution
        changes: SearchChanges
    }[]
    availableHistoryMonths: number
    source: ProviderMetadata
}

export type OrganicKeywordsPayload = {
    target: DomainResearchTarget
    summary: {
        totalKeywords: number
        returnedKeywords: number
        top3: number
        top10: number
        top20: number
        estimatedTraffic: number
        estimatedTrafficValueUsd: number
        new: number
        improved: number
        declined: number
        lost: number
    }
    keywords: {
        keyword: string
        position: number | null
        absolutePosition: number | null
        previousPosition: number | null
        movement: "NEW" | "UP" | "DOWN" | "UNCHANGED" | "LOST"
        positionChange: number | null
        searchVolume: number
        cpcUsd: number
        competition: number | null
        competitionLevel: string | null
        difficulty: number | null
        intent: string | null
        url: string | null
        relativeUrl: string | null
        title: string | null
        traffic: number
        trafficValueUsd: number
        serpFeatures: string[]
        isFeaturedSnippet: boolean
    }[]
    source: ProviderMetadata & { databaseRefresh: "weekly" }
}

export type TopPagesPayload = {
    target: DomainResearchTarget
    summary: {
        totalPages: number
        returnedPages: number
        analyzedTraffic: number
        analyzedTrafficValueUsd: number
        pagesWithTop3Rankings: number
        growingPages: number
        decliningPages: number
    }
    pages: {
        url: string
        path: string
        estimatedTraffic: number
        trafficValueUsd: number
        rankingKeywords: number
        top1Keywords: number
        top3Keywords: number
        top10Keywords: number
        top20Keywords: number
        top50Keywords: number
        top100Keywords: number
        newKeywords: number
        improvedKeywords: number
        declinedKeywords: number
        lostKeywords: number
        status: "WINNER" | "GROWING" | "DECLINING" | "OPPORTUNITY"
        clickstreamTraffic: number
        clickstreamDemographics: ClickstreamDemographics
    }[]
    source: ProviderMetadata & { databaseRefresh: "weekly" }
}

export type CompetitorsPayload = {
    target: DomainResearchTarget & { totalKeywords: number }
    summary: {
        totalCompetitors: number
        returnedCompetitors: number
        primaryCompetitors: number
        challengers: number
        sharedKeywordUniverse: number
        strongestCompetitor: string | null
    }
    competitors: {
        domain: string
        averagePosition: number
        sharedKeywords: number
        sharedCoveragePercent: number
        totalKeywords: number
        estimatedTraffic: number
        trafficValueUsd: number
        top3Keywords: number
        top10Keywords: number
        targetSharedTraffic: number
        competitorSharedTraffic: number
        sharedTrafficGap: number
        newKeywords: number
        improvedKeywords: number
        declinedKeywords: number
        lostKeywords: number
        strength: "PRIMARY" | "CHALLENGER" | "EMERGING"
        clickstreamTraffic: number
        clickstreamDemographics: ClickstreamDemographics
    }[]
    source: ProviderMetadata & {
        databaseRefresh: "weekly"
        maxRankGroup: 20
    }
}

export type BacklinksOverviewPayload = {
    target: string
    scope: "domain" | "page"
    summary: {
        rank: number | null
        backlinks: number | null
        referringPages: number | null
        referringDomains: number | null
        brokenBacklinks: number | null
        brokenPages: number | null
        backlinksSpamScore: number | null
        targetSpamScore: number | null
        newBacklinks: number | null
        lostBacklinks: number | null
        newReferringDomains: number | null
        lostReferringDomains: number | null
    }
    trends: {
        date: string
        backlinks: number | null
        referringDomains: number | null
        rank: number | null
    }[]
    newLostTrends: {
        date: string
        newBacklinks: number | null
        lostBacklinks: number | null
        newReferringDomains: number | null
        lostReferringDomains: number | null
    }[]
    source: ProviderMetadata
}

export type BacklinkRow = {
    domainFrom: string | null
    urlFrom: string | null
    urlTo: string | null
    anchor: string | null
    itemType: string | null
    isDofollow: boolean | null
    relAttributes: string[]
    rank: number | null
    domainFromRank: number | null
    pageFromRank: number | null
    spamScore: number | null
    firstSeen: string | null
    lastSeen: string | null
    isNew: boolean
    isLost: boolean
    isBroken: boolean
    linksCount: number | null
}

type BacklinkCollection<T> = {
    page: number
    pageSize: number
    totalCount: number
    totalPages: number
    items: T[]
}

export type BacklinksReportPayload = Omit<BacklinksOverviewPayload, "summary"> & {
    reportMode: "normal" | "detailed"
    summary: BacklinksOverviewPayload["summary"] & {
        dofollowBacklinks: number | null
        nofollowBacklinks: number | null
        referringMainDomains: number | null
        referringIps: number | null
        linkTypes: Record<string, number>
        linkAttributes: Record<string, number>
        topLevelDomains: Record<string, number>
        countries: Record<string, number>
    }
    backlinks: BacklinkCollection<BacklinkRow>
    referringDomains: BacklinkCollection<{
        domain: string | null
        backlinks: number | null
        referringPages: number | null
        rank: number | null
        spamScore: number | null
        firstSeen: string | null
        brokenBacklinks: number | null
        brokenPages: number | null
    }>
    topPages: BacklinkCollection<{
        page: string | null
        backlinks: number | null
        referringDomains: number | null
        rank: number | null
        brokenBacklinks: number | null
    }>
    anchors: BacklinkCollection<{
        anchor: string
        rank: number | null
        backlinks: number | null
        referringDomains: number | null
        referringPages: number | null
        firstSeen: string | null
        lostDate: string | null
    }> | null
    competitors: BacklinkCollection<{
        domain: string | null
        rank: number | null
        intersections: number | null
        backlinks: number | null
        referringDomains: number | null
    }> | null
    snapshot?: {
        id: string
        fetchedAt: string
        expiresAt: string
        cacheStatus: "HIT" | "STALE" | "REFRESHED"
    }
}

export type BacklinksReportListItem = {
    id: string
    target: string
    scope: "domain" | "page"
    reportMode: "normal" | "detailed"
    rank: number | null
    backlinks: number | null
    referringDomains: number | null
    fetchedAt: string
}
