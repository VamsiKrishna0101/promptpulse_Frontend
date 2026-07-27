import type {
  OpportunityBucket,
  OpportunityConfidence,
  OpportunityImpact,
  RecommendationOutcome,
  SourceActionability,
} from "@/hooks/useOpportunities"

export function outcomeMeta(outcome: RecommendationOutcome) {
  if (outcome === "RECOMMENDED") return { label: "Recommended", cls: "border-emerald-200 bg-emerald-50 text-emerald-700" }
  if (outcome === "LISTED") return { label: "Listed", cls: "border-sky-200 bg-sky-50 text-sky-700" }
  if (outcome === "NEGATIVE") return { label: "Negative", cls: "border-rose-200 bg-rose-50 text-rose-700" }
  return { label: "Absent", cls: "border-slate-200 bg-slate-50 text-slate-600" }
}

export function impactMeta(impact: OpportunityImpact) {
  if (impact === "HIGH") return "bg-[#071225] text-white"
  if (impact === "MEDIUM") return "border border-sky-200 bg-sky-50 text-sky-700"
  return "border border-slate-200 bg-slate-50 text-slate-600"
}

export function confidenceLabel(confidence: OpportunityConfidence) {
  if (confidence === "NEEDS_REVIEW") return "Review evidence"
  return `${confidence.toLowerCase()} confidence`
}

export function actionabilityLabel(actionability: SourceActionability) {
  if (actionability === "NOT_ACTIONABLE") return "Monitor only"
  return `${actionability.toLowerCase()} actionability`
}

export function bucketLabel(bucket: OpportunityBucket) {
  if (bucket === "QUICK_WIN") return "Quick win"
  if (bucket === "SOURCE_GAP") return "Source authority"
  if (bucket === "CONTENT_GAP") return "Content coverage"
  if (bucket === "AUTHORITY_GAP") return "Authority gap"
  return "Monitor"
}

