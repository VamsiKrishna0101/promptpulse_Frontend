export function scoreColor(score: number) {
  if (score >= 80) return "text-emerald-500"
  if (score >= 60) return "text-blue-500"
  if (score >= 40) return "text-amber-500"
  return "text-rose-500"
}

export function scoreBar(score: number) {
  if (score >= 80) return "bg-emerald-400"
  if (score >= 60) return "bg-blue-400"
  if (score >= 40) return "bg-amber-400"
  return "bg-rose-400"
}

export function severityClass(severity: string) {
  if (severity === "HIGH") return "border-rose-100 bg-rose-50 text-rose-600"
  if (severity === "MEDIUM") return "border-amber-100 bg-amber-50 text-amber-600"
  return "border-slate-100 bg-slate-50 text-slate-500"
}

export function priorityClass(priority: string) {
  if (priority === "HIGH") return "border-blue-100 bg-blue-50 text-blue-600"
  if (priority === "MEDIUM") return "border-sky-100 bg-sky-50 text-sky-600"
  return "border-slate-100 bg-slate-50 text-slate-500"
}

export function coverageClass(coverage: string) {
  if (coverage === "GAP") return "border-rose-100 bg-rose-50 text-rose-600"
  if (coverage === "WEAK") return "border-amber-100 bg-amber-50 text-amber-600"
  return "border-emerald-100 bg-emerald-50 text-emerald-600"
}

export function shortUrl(url: string) {
  try {
    const parsed = new URL(url)
    return `${parsed.hostname.replace(/^www\./, "")}${parsed.pathname === "/" ? "" : parsed.pathname}`
  } catch {
    return url
  }
}

export function pageStatusLabel(statusCode: number | null | undefined) {
  if (!statusCode) return "Blocked / timed out"
  if (statusCode >= 200 && statusCode < 400) return `HTTP ${statusCode}`
  if (statusCode === 404) return "HTTP 404 not found"
  if (statusCode >= 500) return `HTTP ${statusCode} server error`
  return `HTTP ${statusCode}`
}
