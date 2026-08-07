const DEPLOYED_BACKEND_BASE_URL = "https://promptpulse-backend-892724717411.asia-south1.run.app"
const DEPLOYED_AGENTS_BASE_URL = "https://promptpulse-agents-api-892724717411.asia-south1.run.app"
const DEFAULT_BACKEND_BASE_URL = import.meta.env.DEV ? "http://localhost:3000" : DEPLOYED_BACKEND_BASE_URL
const DEFAULT_AGENTS_BASE_URL = import.meta.env.DEV ? "http://localhost:8080" : DEPLOYED_AGENTS_BASE_URL

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "")
}

export const BACKEND_BASE_URL = trimTrailingSlash(
  import.meta.env.VITE_BACKEND_BASE_URL ?? DEFAULT_BACKEND_BASE_URL,
)

export const API_BASE_URL = trimTrailingSlash(
  import.meta.env.VITE_API_BASE_URL ?? `${BACKEND_BASE_URL}/api`,
)

export const AGENTS_BASE_URL = trimTrailingSlash(
  import.meta.env.VITE_AGENTS_BASE_URL ?? DEFAULT_AGENTS_BASE_URL,
)

export const AI_REPORTS_API_BASE_URL = trimTrailingSlash(
  import.meta.env.VITE_AI_REPORTS_API_BASE_URL ?? AGENTS_BASE_URL,
)

export const VOICE_AI_API_BASE_URL = trimTrailingSlash(
  import.meta.env.VITE_VOICE_AI_API_URL ?? "http://localhost:4000/api/voice",
)
