import { colors } from "@/lib/colors"

export const domainResearchTokens = {
    canvas: colors.ink[50],
    ink: colors.ink[950],
    muted: colors.ink[500],
    border: colors.ink[200],
    grid: colors.ink[100],

    traffic: {
        organic: colors.brand[600], // black — primary series
        paid: colors.ink[300],      // muted gray — secondary series
    },

    // Darkest = most valuable. Monochrome gradient reads as a natural scale.
    positions: {
        top3: "#f59e0b",
        positions4To10: "#1d4ed8",
        positions11To20: "#3b82f6",
        positions21To50: "#7db7f0",
        positions51To100: "#cbd5e1",
    },

    status: {
        positive: colors.success[600],
        opportunity: colors.ink[600], // no warning scale yet — neutral-dark stands in
        negative: colors.danger[600],
    },
} as const

export const domainResearchSurface =
    "rounded-2xl border border-ink-200/90 bg-white shadow-[0_10px_30px_-24px_rgba(10,10,11,0.35)]"

export const domainResearchControl =
    "rounded-lg border border-ink-200 bg-white text-ink-700 shadow-sm transition hover:border-ink-300 hover:bg-ink-50 focus:outline-none focus:ring-2 focus:ring-ink-300/60"
