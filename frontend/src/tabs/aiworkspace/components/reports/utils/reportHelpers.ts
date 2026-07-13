export function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {}
}

export function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : []
}

export function text(value: unknown, fallback = "Not available") {
  if (value === null || value === undefined || value === "") return fallback
  if (typeof value === "string") return value
  if (typeof value === "number" || typeof value === "boolean") return String(value)
  return fallback
}

export function metric(value: unknown, suffix = "") {
  if (typeof value !== "number") return "NA"
  return `${Math.round(value * 10) / 10}${suffix}`
}

export function dateLabel(value?: string) {
  if (!value) return "No date"
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value))
}

export function first(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = record[key]
    if (value !== undefined && value !== null && value !== "") return value
  }
  return undefined
}

export function periodLabel(period: string) {
  if (period === "7d") return "Last 7 Days"
  if (period === "14d") return "Last 14 Days"
  if (period === "30d") return "Last 30 Days"
  return period
}
