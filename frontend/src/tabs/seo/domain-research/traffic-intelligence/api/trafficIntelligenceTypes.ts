export type TrafficIntelligenceCountry = {
    country: string
    share: number
    monthly_traffic: { date: string; visits: number }[]
}

export type TrafficIntelligenceKeyword = {
    keyword: string
    estimatedValue: number
    searchVolume: number
    cpc: number | null
}

export type TrafficIntelligencePayload = {
    data_captured_at: string
    type: "overview" | string
    favicon: string | null
    previewDesktop: string | null
    previewMobile: string | null
    domain: string
    category: string | null
    country: string | null
    countryRank: number | null
    categoryRank: number | null
    rankGlobal: number | null
    title: string | null
    description: string | null
    totalVisits: number | null
    monthlyVisits: { month: string; visits: number }[]
    website_traffic_by_country: TrafficIntelligenceCountry[]
    countryShare: { country: string; share: number }[]
    engagement: {
        bounceRate: number | null
        month: number | null
        year: number | null
        pagesPerVisit: number | null
        visits: number | null
        timeOnSite: number | null
        dateFormat: string | null
    } | null
    socialTraffic: number | null
    socialOrganicTraffic: number | null
    socialPaidTraffic: number | null
    referralTraffic: number | null
    searchTraffic: number | null
    searchOrganicTraffic: number | null
    searchPaidTraffic: number | null
    directTraffic: number | null
    mailTraffic: number | null
    affiliateTraffic: number | null
    displayAdsTraffic: number | null
    genAiTraffic: number | null
    aiTrafficShareChatgpt: number | null
    aiTrafficShareClaude: number | null
    aiTrafficSharePerplexity: number | null
    aiTrafficShareGemini: number | null
    aiTrafficShareCopilot: number | null
    aiTrafficShareHistory: {
        date: string
        chatgpt_share: number | null
        claude_share: number | null
        perplexity_share: number | null
        gemini_share: number | null
        copilot_share: number | null
    }[]
    aiTopPrompts: { prompt: string; share?: number | null }[]
    topKeywords: TrafficIntelligenceKeyword[]
    similarSites: { domain: string; visits?: number | null }[] | null
    url: string
    searchUrl: string | null
    snapshotDate: string | null
    redirect: string | null
}
