// const DEPLOYED_BACKEND_BASE_URL = "https://promptpulse-backend-892724717411.asia-south1.run.app"
// const DEPLOYED_AGENTS_BASE_URL = "https://promptpulse-agents-api-892724717411.asia-south1.run.app"
const DEPLOYED_BACKEND_BASE_URL = "http://localhost:3000"
const DEPLOYED_AGENTS_BASE_URL = "http://localhost:8080"

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "")
}

export const BACKEND_BASE_URL = trimTrailingSlash(
  import.meta.env.VITE_BACKEND_BASE_URL ?? DEPLOYED_BACKEND_BASE_URL,
)

export const API_BASE_URL = trimTrailingSlash(
  import.meta.env.VITE_API_BASE_URL ?? `${BACKEND_BASE_URL}/api`,
)

export const AGENTS_BASE_URL = trimTrailingSlash(
  import.meta.env.VITE_AGENTS_BASE_URL ?? DEPLOYED_AGENTS_BASE_URL,
)

export const AI_REPORTS_API_BASE_URL = trimTrailingSlash(
  import.meta.env.VITE_AI_REPORTS_API_BASE_URL ?? AGENTS_BASE_URL,
)
