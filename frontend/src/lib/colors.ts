/**
 * Global color tokens.
 *
 * Usage in tailwind.config.ts:
 *
 *   import { colors } from "./colors"
 *
 *   export default {
 *     theme: {
 *       extend: {
 *         colors,
 *       },
 *     },
 *   }
 *
 * Then anywhere in components: bg-brand-600, text-ink-500, border-ink-200, etc.
 * Component-level styling (padding, radius, shadows, layout) stays inside each
 * component's Tailwind classes — this file only owns color values.
 *
 * NOTE: there is no separate brand hue. The real site is monochrome —
 * black CTA button, black logo mark, black text — with color reserved only
 * for a small green status dot and genuine third-party logos (ChatGPT,
 * Gemini, Perplexity icons). `brand` mirrors `ink` so existing `brand-*`
 * classes keep working, just resolving to charcoal/black instead of the
 * earlier purple or blue guesses.
 */

type ColorScale = Record<number, string>

interface ColorTokens {
    brand: ColorScale
    ink: ColorScale
    success: ColorScale
    danger: ColorScale
}

export const colors: ColorTokens = {
    // Mirrors `ink` — the site's one "accent" is charcoal/black itself.
    brand: {
        50: "#fafafa",
        100: "#f5f5f6",
        200: "#e8e8ea",
        300: "#d4d4d8",
        400: "#a1a1aa",
        500: "#71717a",
        600: "#18181b", // primary — matches the hero's solid black CTA
        700: "#000000", // hover / emphasis
        800: "#000000",
        900: "#000000",
        950: "#000000",
    },

    // Neutrals matched to the dashboard's off-white surfaces, hairline borders,
    // and near-black text.
    ink: {
        0: "#ffffff",
        50: "#fafafa",
        100: "#f5f5f6",
        200: "#e8e8ea",
        300: "#d4d4d8",
        400: "#a1a1aa",
        500: "#71717a",
        600: "#52525b",
        700: "#3f3f46",
        800: "#27272a",
        900: "#18181b",
        950: "#0a0a0b",
    },

    // Semantic colors for status dots and dashboard movement signals.
    success: {
        50: "#f0fdf4",
        500: "#16a34a",
        600: "#15803d",
    },
    danger: {
        50: "#fef2f2",
        500: "#dc2626",
        600: "#b91c1c",
    },
}
