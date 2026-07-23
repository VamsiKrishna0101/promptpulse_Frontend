import axios from "axios"
import { API_BASE_URL } from "@/config/baseUrls"

export { API_BASE_URL }

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("promptpulse_access_token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let refreshRequest: Promise<string | null> | null = null

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const responseStatus = error.response?.status
    const original = error.config as (typeof error.config & { _authRetry?: boolean }) | undefined
    const isRefreshRequest = typeof original?.url === "string" && original.url.endsWith("/auth/refresh")

    if (responseStatus !== 401 || !original || original._authRetry || isRefreshRequest) {
      return Promise.reject(error)
    }

    const refreshToken = localStorage.getItem("promptpulse_refresh_token")
    if (!refreshToken) {
      expireLocalSession()
      return Promise.reject(error)
    }

    original._authRetry = true
    refreshRequest ??= axios.post<{ access_token?: string; refresh_token?: string }>(
      `${API_BASE_URL}/auth/refresh`,
      { refresh_token: refreshToken },
      { headers: { "Content-Type": "application/json" } },
    ).then(({ data }) => {
      const accessToken = data.access_token
      if (!accessToken) throw new Error("Session refresh failed")
      localStorage.setItem("promptpulse_access_token", accessToken)
      if (data.refresh_token) localStorage.setItem("promptpulse_refresh_token", data.refresh_token)
      return accessToken
    }).catch(() => null).finally(() => {
      refreshRequest = null
    })

    const accessToken = await refreshRequest
    if (!accessToken) {
      expireLocalSession()
      return Promise.reject(error)
    }

    original.headers = original.headers ?? {}
    original.headers.Authorization = `Bearer ${accessToken}`
    return api.request(original)
  },
)

function expireLocalSession() {
  localStorage.removeItem("promptpulse_access_token")
  localStorage.removeItem("promptpulse_refresh_token")
  localStorage.removeItem("promptpulse_user")
  localStorage.removeItem("promptpulse_selected_project_id")
  window.dispatchEvent(new CustomEvent("promptpulse:auth-expired"))
  const publicAuthPaths = ["/login", "/signup", "/forgot-password"]
  if (!publicAuthPaths.includes(window.location.pathname)) {
    window.location.assign("/login?session=expired")
  }
}
