import type { SavedReportDetail } from "@/lib/aiReportsApi"

// Exact types mapped from LangGraph AI outputs
export type ComponentInsight = {
  component: string
  score: number | string
  raw_value: string
  interpretation_signal: string
  weight?: number
}

export type ModelInsight = {
  model: string
  model_label?: string
  status: string
  summary: string
  strengths: string[]
  risks: string[]
  recommended_action: string
  runs?: number
  mention_rate?: number
  mention_rate_delta?: number
  average_position?: number
  top_competitor?: { name: string; mention_rate: number }
  top_sources?: { domain: string; citations: number }[]
}

export type PromptInsight = {
  prompt: string
  summary: string
  volume_score?: number
  priority_score?: number
  intent?: string
  position_delta?: number
  mention_rate_delta?: number
  current_mention_rate?: number
  top_competitor?: { name: string; mention_rate: number }
}

export type CompetitorInsight = {
  competitor: string
  threat_level: string
  summary: string
  recommended_response: string
  why_they_are_winning: string[]
  current_mention_rate?: number
  mention_rate_delta?: number
  current_average_position?: number
  position_delta?: number
  prompts_won_against_brand?: number
}

export type SourceInsight = {
  domain: string
  citations: number
  delta: number
  url_type: string
  mentioned_competitors: string[]
}

export type ContentInsight = {
  theme?: string
  content_type?: string
  suggested_title?: string
  priority_reason?: string
  title?: string
  body?: string
}

export type RiskSignal = {
  label: string
  type: string
  supporting_detail: string
  delta?: number
  model?: string
  competitor?: string
  brand_mention_rate?: number
  top_competitor_mention_rate?: number
}

export type FocusSignal = {
  title: string
  reason: string
  expected_impact: string
  priority: number
}

export type LeaderboardEntry = {
  name: string
  rank: number
  type: string
  delta: number
  mention_rate: number
}

export type PromptSummary = {
  total_prompts_tracked: number
  declined_prompts_count: number
  improved_prompts_count: number
  unchanged_prompts_count: number
}

export type OverallMovement = {
  visibility_score: number
  visibility_score_delta: number
  brand_mention_rate: number
  brand_mention_rate_delta: number
  average_position: number
  average_position_delta: number
  sentiment_score: number
  sentiment_delta: number
  total_runs: number
}

export type ReportViewModel = {
  brandName: string
  periodLabel: string
  headline: string
  summary: string
  confidence: string
  metrics: { label: string; value: string }[]
  overallMovement: OverallMovement | null
  topRisks: RiskSignal[]
  topFocus: FocusSignal[]
  leaderboard: LeaderboardEntry[]
  promptSummary: PromptSummary | null
  executive: {
    wins: string[]
    risks: string[]
    focus: string[]
    timeline: string[]
  }
  visibility: {
    explanation: string
    strongest: string
    weakest: string
    components: ComponentInsight[]
  }
  intelligence: {
    modelHeadline: string
    modelSummary: string
    models: ModelInsight[]
    prompts: PromptInsight[]
    promptRecommendation: string
    competitors: CompetitorInsight[]
    competitorTakeaway: string
    sources: SourceInsight[]
    sourceSummary: string
    sourceInsight: string
    sentiment: string[]
    sentimentReadout: string
    positiveShare: number
    neutralShare: number
    negativeShare: number
  }
  recommendations: {
    priority: string[]
    quickWins: string[]
    longTerm: string[]
    sourceActions: string[]
    contentSequence: ContentInsight[]
    content: string
    analytics: string
    opportunityTheme: string
  }
}

function safeArray<T>(val: unknown): T[] {
  return Array.isArray(val) ? val : []
}

function safeString(val: unknown, fallback = ""): string {
  return typeof val === "string" ? val : fallback
}

function safeNumber(val: unknown): number | undefined {
  return typeof val === "number" && Number.isFinite(val) ? val : undefined
}

export function mapReport(detail: SavedReportDetail): ReportViewModel {
  // Support both the nested structure and the new flattened structure
  const report = (detail.report || detail || {}) as any
  
  // Cast specific sections
  const context = (report.report_context || {}) as any
  const execInput = (report.executive_summary_input || {}) as any
  const movement = (execInput.overall_movement || {}) as any
  const visibilityInput = (report.visibility_score_input || {}) as any
  const scoreInput = (visibilityInput.overall_score || {}) as any
  
  const executive = (report.executive_summary_output || {}) as any
  const visibility = (report.visibility_score_output || {}) as any
  const models = (report.model_analysis_output || {}) as any
  const prompts = (report.prompt_movement_output || {}) as any
  const competitors = (report.competitor_share_output || {}) as any
  const sources = (report.source_citation_output || {}) as any
  const sentiment = (report.sentiment_positioning_output || {}) as any
  const opportunities = (report.opportunity_engine_output || {}) as any
  const content = (report.content_recommendations_output || {}) as any
  const web = (report.web_analytics_output || {}) as any

  const score = movement.visibility_score ?? scoreInput.score ?? "N/A"
  const delta = movement.visibility_score_delta ?? scoreInput.delta ?? 0
  const mentionRate = movement.brand_mention_rate ?? "N/A"
  const avgPosition = movement.average_position ?? "N/A"

  // Merge Prompts
  const promptInputList = [
    ...safeArray<any>(report.prompt_movement_input?.top_gaining_prompts),
    ...safeArray<any>(report.prompt_movement_input?.top_declining_prompts)
  ]
  const promptOutputList = [
    ...safeArray<any>(prompts.top_gains_summary),
    ...safeArray<any>(prompts.top_declines_summary)
  ]
  const enrichedPrompts: PromptInsight[] = promptOutputList.map(po => {
    const pi = promptInputList.find(p => p.prompt_text === po.prompt) || {}
    return {
      prompt: safeString(po.prompt || pi.prompt_text),
      summary: safeString(po.summary),
      volume_score: pi.volume_score,
      priority_score: pi.priority_score,
      intent: safeString(pi.intent),
      position_delta: pi.position_delta,
      mention_rate_delta: pi.mention_rate_delta,
      current_mention_rate: pi.current_mention_rate,
      top_competitor: pi.top_competitor,
    }
  })

  // Merge Models
  const modelsOutput = safeArray<any>(models.model_insights)
  const modelsInput = safeArray<any>(report.model_analysis_input?.models)
  const enrichedModels: ModelInsight[] = modelsOutput.map(mo => {
    const mi = modelsInput.find(m => m.model === mo.model) || {}
    return {
      model: safeString(mo.model || mi.model),
      model_label: safeString(mi.model_label || mo.model_label),
      status: safeString(mo.status),
      summary: safeString(mo.summary),
      strengths: safeArray<string>(mo.strengths),
      risks: safeArray<string>(mo.risks),
      recommended_action: safeString(mo.recommended_action),
      runs: safeNumber(mi.runs),
      mention_rate: safeNumber(mi.mention_rate),
      mention_rate_delta: safeNumber(mi.mention_rate_delta),
      average_position: safeNumber(mi.average_position),
      top_competitor: mi.top_competitor,
      top_sources: safeArray<any>(mi.top_sources)
    }
  })

  // Merge Competitors
  const compOutputList = safeArray<any>(competitors.competitor_insights)
  const compInputList = safeArray<any>(report.competitor_share_input?.competitors)
  const enrichedCompetitors: CompetitorInsight[] = compOutputList.map(co => {
    const ci = compInputList.find(c => c.competitor_name === co.competitor || c.competitor_name === co.name) || {}
    return {
      competitor: safeString(co.competitor || ci.competitor_name),
      threat_level: safeString(co.threat_level || ci.threat_level),
      summary: safeString(co.summary),
      recommended_response: safeString(co.recommended_response),
      why_they_are_winning: safeArray<string>(co.why_they_are_winning),
      current_mention_rate: ci.current_mention_rate,
      mention_rate_delta: ci.mention_rate_delta,
      current_average_position: ci.current_average_position,
      position_delta: ci.position_delta,
      prompts_won_against_brand: ci.prompts_won_against_brand
    }
  })

  // Sources
  const sourceInputList = safeArray<any>(report.source_citation_input?.top_cited_domains).slice(0, 8)
  const enrichedSources: SourceInsight[] = sourceInputList.map(si => ({
    domain: safeString(si.domain),
    citations: typeof si.citations === 'number' ? si.citations : 0,
    delta: typeof si.delta === 'number' ? si.delta : 0,
    url_type: safeString(si.url_type),
    mentioned_competitors: safeArray<string>(si.mentioned_competitors)
  }))

  // Score Components
  const compInsightsOut = safeArray<any>(visibility.component_insights)
  const compInsightsIn = safeArray<any>(visibilityInput.score_components)
  const componentInsights: ComponentInsight[] = compInsightsIn.length > 0 
    ? compInsightsIn.map(c => ({
        component: safeString(c.component || c.label),
        score: c.score,
        raw_value: safeString(c.raw_value),
        interpretation_signal: safeString(c.interpretation_signal),
        weight: c.weight
      }))
    : compInsightsOut.map(c => ({
        component: safeString(c.component),
        score: c.score,
        raw_value: safeString(c.raw_value),
        interpretation_signal: safeString(c.interpretation_signal)
      }))

  const sentimentInsights = [
    ...safeArray<any>(sentiment.positive_theme_insights),
    ...safeArray<any>(sentiment.neutral_theme_insights)
  ].map(s => safeString(s.summary || s))

  // Leaderboard from competitor_share_input
  const leaderboard: LeaderboardEntry[] = safeArray<any>(report.competitor_share_input?.competitor_leaderboard).map(e => ({
    name: safeString(e.name),
    rank: e.rank ?? 0,
    type: safeString(e.type),
    delta: e.delta ?? 0,
    mention_rate: e.mention_rate ?? 0,
  }))

  // Prompt summary
  const promptSummaryRaw = (report.prompt_movement_input?.prompt_summary || null) as any
  const promptSummary: PromptSummary | null = promptSummaryRaw ? {
    total_prompts_tracked: promptSummaryRaw.total_prompts_tracked ?? 0,
    declined_prompts_count: promptSummaryRaw.declined_prompts_count ?? 0,
    improved_prompts_count: promptSummaryRaw.improved_prompts_count ?? 0,
    unchanged_prompts_count: promptSummaryRaw.unchanged_prompts_count ?? 0,
  } : null

  // Overall movement
  const om = movement
  const overallMovement: OverallMovement | null = om.visibility_score !== undefined ? {
    visibility_score: om.visibility_score ?? score,
    visibility_score_delta: om.visibility_score_delta ?? delta,
    brand_mention_rate: om.brand_mention_rate ?? mentionRate,
    brand_mention_rate_delta: om.brand_mention_rate_delta ?? 0,
    average_position: om.average_position ?? avgPosition,
    average_position_delta: om.average_position_delta ?? 0,
    sentiment_score: om.sentiment_score ?? 0,
    sentiment_delta: om.sentiment_delta ?? 0,
    total_runs: om.total_runs ?? om.successful_runs ?? 0,
  } : null

  // Risk signals
  const topRisks: RiskSignal[] = safeArray<any>(execInput.top_risk_signals).map(r => ({
    label: safeString(r.label),
    type: safeString(r.type),
    supporting_detail: safeString(r.supporting_detail),
    delta: r.delta,
    model: r.model,
    competitor: r.competitor,
    brand_mention_rate: r.brand_mention_rate,
    top_competitor_mention_rate: r.top_competitor_mention_rate,
  }))

  // Focus signals
  const topFocus: FocusSignal[] = safeArray<any>(execInput.recommended_focus_signals).map(f => ({
    title: safeString(f.title),
    reason: safeString(f.reason),
    expected_impact: safeString(f.expected_impact),
    priority: f.priority ?? 0,
  }))

  return {
    brandName: safeString(context.brand_name || detail.brand_name, "Brand"),
    periodLabel: safeString(context.period_label, "Recent Period"),
    headline: safeString(executive.headline || visibility.headline, "AI Visibility Report"),
    summary: safeString(executive.short_summary || executive.summary || visibility.score_explanation, "Analysis complete."),
    confidence: safeString(executive.confidence_note, "Confidence depends on available prompt and model coverage."),
    overallMovement,
    topRisks,
    topFocus,
    leaderboard,
    promptSummary,
    
    metrics: [
      { label: "Visibility", value: `${score}` },
      { label: "Mention Rate", value: `${mentionRate}%` },
      { label: "Avg Position", value: `${avgPosition}` },
      { label: "Score Delta", value: `${delta > 0 ? "+" : ""}${delta}` },
    ],
    
    executive: {
      wins: safeArray<string>(executive.why_it_changed),
      risks: safeArray<string>(executive.main_risks),
      focus: safeArray<string>(executive.recommended_focus),
      timeline: safeArray<string>(executive.what_changed),
    },
    
    visibility: {
      explanation: safeString(visibility.score_explanation || visibility.what_this_means),
      strongest: safeString(visibility.strongest_area),
      weakest: safeString(visibility.weakest_area),
      components: componentInsights,
    },
    
    intelligence: {
      modelHeadline: safeString(models.headline),
      modelSummary: safeString(models.summary),
      models: enrichedModels,
      prompts: enrichedPrompts,
      promptRecommendation: safeString(prompts.prompt_recommendation),
      competitors: enrichedCompetitors,
      competitorTakeaway: safeString(competitors.main_takeaway || competitors.summary),
      sources: enrichedSources,
      sourceSummary: safeString(sources.summary),
      sourceInsight: safeString(sources.owned_source_insight || sources.third_party_source_insight),
      sentiment: sentimentInsights,
      sentimentReadout: safeString(sentiment.sentiment_readout || sentiment.summary),
      positiveShare: safeNumber(sentiment.positive_share) ?? safeNumber(sentiment.positiveShare) ?? 0,
      neutralShare: safeNumber(sentiment.neutral_share) ?? safeNumber(sentiment.neutralShare) ?? 0,
      negativeShare: safeNumber(sentiment.negative_share) ?? safeNumber(sentiment.negativeShare) ?? 0,
    },
    
    recommendations: {
      priority: safeArray<string>(opportunities.recommended_sequence),
      quickWins: safeArray<string>(executive.recommended_focus),
      longTerm: safeArray<string>(sentiment.messaging_recommendations),
      sourceActions: safeArray<string>(sources.recommended_source_actions),
      contentSequence: safeArray<ContentInsight>(content.content_sequence),
      content: safeString(content.summary || content.headline),
      analytics: safeString(web.summary || web.headline),
      opportunityTheme: safeString(opportunities.opportunity_theme_summary || opportunities.summary),
    },
  }
}
