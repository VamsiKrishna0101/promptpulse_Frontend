export type AiEngineKey =
    | "chatgpt"
    | "gemini"
    | "google"
    | "perplexity"
    | "copilot"
    | "claude"
    | "default"

export const MODEL_ICON_DOMAINS: Record<string, string> = {
    chatgpt: "chatgpt.com",
    gemini: "gemini.google.com",
    google: "google.com",
    google_ai_overview: "google.com",
    google_ai_mode: "google.com",
    perplexity: "perplexity.ai",
    copilot: "copilot.microsoft.com",
    claude: "claude.ai",
}

export const MODEL_FILTER_OPTIONS = [
    { label: "All Models", value: "" },
    { label: "ChatGPT", value: "chatgpt" },
    { label: "Gemini", value: "gemini" },
    { label: "Perplexity", value: "perplexity" },
    { label: "Google AI Mode", value: "google_ai_mode" },
    { label: "Copilot", value: "copilot" },
]

export function engineKey(model: string): AiEngineKey {
    const value = model.toLowerCase()

    if (value.includes("copilot") || value.includes("bing")) return "copilot"
    if (value.includes("gpt") || value.includes("openai") || value.includes("chatgpt")) return "chatgpt"
    if (value.includes("google_ai") || value.includes("ai overview") || value.includes("ai mode")) return "google"
    if (value.includes("gemini") || value.includes("bard")) return "gemini"
    if (value.includes("perplexity")) return "perplexity"
    if (value.includes("claude")) return "claude"

    return "default"
}

export function modelIconDomain(model: string) {
    return MODEL_ICON_DOMAINS[engineKey(model)]
}

export function faviconUrl(domain: string | null | undefined, size = 32) {
    const cleanDomain = domain?.trim().replace(/^https?:\/\//, "").replace(/\/$/, "")
    if (!cleanDomain) return null

    return `https://www.google.com/s2/favicons?domain_url=${encodeURIComponent(`https://${cleanDomain}`)}&sz=${size}`
}

export function modelIconUrl(model: string, size = 32) {
    return faviconUrl(modelIconDomain(model), size)
}

export function formatModelName(raw: string) {
    if (!raw) return "Unknown"

    const clean = raw.toLowerCase().replace(/-ui$/i, "")
    const key = engineKey(clean)

    if (clean.includes("google_ai_mode") || clean.includes("ai mode")) return "Google AI Mode"
    if (clean.includes("google_ai_overview") || clean.includes("ai overview")) return "Google AI Overview"
    if (key === "chatgpt") return "ChatGPT"
    if (key === "gemini") return "Gemini"
    if (key === "perplexity") return "Perplexity"
    if (key === "copilot") return "Copilot"
    if (key === "claude") return "Claude"
    if (key === "google") return "Google AI"

    return clean
        .split(/[-_\s]+/)
        .filter(Boolean)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
}
