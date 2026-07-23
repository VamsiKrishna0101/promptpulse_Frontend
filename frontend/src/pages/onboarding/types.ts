// Hybrid billing model: paid workspaces use included credits plus PAYG top-ups;
// the free trial keeps a small product allowance before payment is required.

export type Plan = "FREE" | "PAYG"

export type BrandResearchData = {
  tagline:              string | null
  description:          string
  industry:             string
  founded:              string | null
  headquarters:         string | null
  employee_count:       string | null
  business_model:       string
  target_audience:      string
  key_products_services: string
  pricing_model:        string | null
  competitors:          string
  recent_news_or_updates: string | null
  social_presence:      string | null
  tone_and_brand_voice: string
  unique_value_proposition: string
}

export type BrandResearchResult = {
  brand_name:      string
  brand_url:       string
  research_source?: "website_crawler" | "firecrawl_fallback" | "parallel_fallback"
  crawler_source?:  "website_crawler" | "firecrawl_fallback"
  pages_crawled?:  number
  important_links?: string[]
  social_links?:   string[]
  crawler_notes?:  string[]
  crawler_error?:  string
  summary_error?:  string
  data:            BrandResearchData
}

export type SuggestedPrompt = {
  topic:  string
  type:   string
  text:   string
  source: "GENERATED" | "CUSTOMER"
}

export type ProjectEngine = "CHATGPT" | "GEMINI" | "PERPLEXITY" | "GOOGLE_AI_MODE" | "COPILOT"

// Kept for legacy callers; current onboarding uses the wallet/trial rules.
export const PROMPT_LIMIT_BY_PLAN: Record<string, number> = {
  FREE:  999999,
  PAYG:  999999,
  // Legacy keys kept for backward compatibility
  STARTER: 999999,
  GROWTH:  999999,
  PRO:     999999,
}

export const PROJECT_LIMIT_BY_PLAN: Record<string, number> = {
  FREE:  999999,
  PAYG:  999999,
  // Legacy keys kept for backward compatibility
  STARTER: 999999,
  GROWTH:  999999,
  PRO:     999999,
}
