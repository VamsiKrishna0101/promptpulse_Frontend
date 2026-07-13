const DEPLOYED_BACKEND_BASE_URL = "https://empty-backend-75341912220.asia-south1.run.app"
const DEPLOYED_AGENTS_BASE_URL = "https://agents-75341912220.asia-south1.run.app"

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
