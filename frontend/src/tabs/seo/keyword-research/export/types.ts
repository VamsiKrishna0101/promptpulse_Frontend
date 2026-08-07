export const EXPORT_THEME = {
  font: "Arial",
  colors: {
    darkBg: "0F172A",
    darkCard: "1E293B",
    darkCardBorder: "334155",
    slideBg: "FFFFFF",
    cardBg: "F8FAFC",
    cardBorder: "E2E8F0",
    textPrimary: "0F172A",
    textSecondary: "475569",
    textMuted: "94A3B8",
    accent: "D97706",
    accentBg: "FEF3C7",
    accentBorder: "FDE68A",
    emerald: "059669",
    emeraldBg: "ECFDF5",
    blue: "2563EB",
    blueBg: "EFF6FF",
    purple: "7C3AED",
    purpleBg: "F5F3FF",
    white: "FFFFFF",
  },
  // RGB triplets for jsPDF
  pdfColors: {
    navy: [15, 23, 42] as [number, number, number],
    cardDark: [30, 41, 59] as [number, number, number],
    ink: [15, 23, 42] as [number, number, number],
    text: [71, 85, 105] as [number, number, number],
    muted: [148, 163, 184] as [number, number, number],
    border: [226, 232, 240] as [number, number, number],
    panel: [248, 250, 252] as [number, number, number],
    white: [255, 255, 255] as [number, number, number],
    emerald: [5, 150, 105] as [number, number, number],
    emeraldBg: [236, 253, 245] as [number, number, number],
    amber: [217, 119, 6] as [number, number, number],
    amberBg: [254, 243, 199] as [number, number, number],
    blue: [37, 99, 235] as [number, number, number],
  },
}

export function formatVolume(val: number | null | undefined): string {
  if (val == null) return "—"
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`
  if (val >= 1_000) return `${(val / 1_000).toFixed(1)}K`
  return String(val)
}

export function formatCpc(val: number | null | undefined): string {
  if (val == null) return "—"
  return `$${Number(val).toFixed(2)}`
}

export function formatDifficulty(val: number | null | undefined): string {
  if (val == null) return "—"
  return `${Math.round(val)}%`
}

export function formatCompetition(val: number | string | null | undefined): string {
  if (val == null) return "—"
  const num = typeof val === "string" ? parseFloat(val) : val
  if (isNaN(num)) return String(val)
  return `${Math.round(num * 100)}%`
}

export function formatIntent(val: string | null | undefined): string {
  if (!val) return "Informational"
  const clean = val.toLowerCase()
  if (clean.includes("comm")) return "Commercial"
  if (clean.includes("trans")) return "Transactional"
  if (clean.includes("nav")) return "Navigational"
  return "Informational"
}

export function sanitizeFileName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "dataset"
}
