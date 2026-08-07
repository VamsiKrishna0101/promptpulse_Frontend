export function compactNumber(value: number | null | undefined) {
    if (value == null || !Number.isFinite(value)) return "—"
    return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(value)
}

export function percent(value: number | null | undefined) {
    if (value == null || !Number.isFinite(value)) return "—"
    return `${(value * 100).toFixed(value > 0 && value < 0.1 ? 1 : 0)}%`
}

export function dateLabel(value: string | null | undefined) {
    if (!value) return "—"
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value
    return new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" }).format(date)
}

export function secondsLabel(value: number | null | undefined) {
    if (value == null || !Number.isFinite(value)) return "—"
    const minutes = Math.floor(value / 60)
    const seconds = Math.round(value % 60)
    return `${minutes}m ${seconds}s`
}

export function displayDomain(value: string) {
    return value.replace(/^https?:\/\//, "").replace(/\/$/, "")
}
