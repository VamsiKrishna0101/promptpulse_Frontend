import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from "react"
import { api } from "@/lib/api"

type User = {
  id: string
  email: string
  account_type: "SINGLE" | "AGENCY"
  plan: "FREE" | "STARTER" | "GROWTH" | "PRO"
  effective_plan?: "FREE" | "STARTER" | "GROWTH" | "PRO"
  role?: "USER" | "ADMIN"
  is_verified?: boolean
  credits_balance?: number
}

type AuthContextValue = {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  register: (input: { email: string; password: string; account_type?: "SINGLE" | "AGENCY" }) => Promise<void>
  verifyEmailOtp: (email: string, otp: string) => Promise<void>
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("promptpulse_access_token"))
  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem("promptpulse_user")
    return raw ? JSON.parse(raw) as User : null
  })

  useEffect(() => {
    if (token) localStorage.setItem("promptpulse_access_token", token)
    else localStorage.removeItem("promptpulse_access_token")
  }, [token])

  useEffect(() => {
    if (user) localStorage.setItem("promptpulse_user", JSON.stringify(user))
    else localStorage.removeItem("promptpulse_user")
  }, [user])

  useEffect(() => {
    const handleExpired = () => {
      setToken(null)
      setUser(null)
    }
    window.addEventListener("promptpulse:auth-expired", handleExpired)
    return () => window.removeEventListener("promptpulse:auth-expired", handleExpired)
  }, [])

  // Refresh the cached user on every session start. This is important for
  // role changes made by an administrator while the browser still has an old
  // USER object in localStorage.
  useEffect(() => {
    if (!token) return
    let active = true
    api.get<{ user?: User }>("/profile/me")
      .then(response => {
        if (!active || !response.data.user) return
        setUser(previous => previous ? { ...previous, ...response.data.user } : response.data.user ?? null)
      })
      .catch(() => {
        // The API interceptor handles expired sessions. Keep the cached user
        // during temporary network failures so the app remains usable.
      })
    return () => {
      active = false
    }
  }, [token])

  const value = useMemo<AuthContextValue>(() => ({
    user,
    token,
    isAuthenticated: Boolean(token),
    async register(input) {
      await api.post("/auth/register", {
        email: input.email,
        password: input.password,
        account_type: input.account_type ?? "SINGLE",
      })
    },
    async verifyEmailOtp(email: string, otp: string) {
      const response = await api.post("/auth/verify", { email, otp })
      const accessToken = response.data.access_token ?? response.data.accessToken
      if (!accessToken) throw new Error("Email verified but no access token was returned")
      setToken(accessToken)
      if (response.data.refresh_token ?? response.data.refreshToken) {
        localStorage.setItem("promptpulse_refresh_token", response.data.refresh_token ?? response.data.refreshToken)
      }
      setUser(response.data.user)
    },
    async login(email: string, password: string) {
      const response = await api.post("/auth/login", { email, password })
      const accessToken = response.data.access_token ?? response.data.accessToken
      if (!accessToken) throw new Error("Login succeeded but no access token was returned")
      setToken(accessToken)
      if (response.data.refresh_token ?? response.data.refreshToken) {
        localStorage.setItem("promptpulse_refresh_token", response.data.refresh_token ?? response.data.refreshToken)
      }
      setUser(response.data.user)
    },
    logout() {
      setToken(null)
      setUser(null)
      localStorage.removeItem("promptpulse_refresh_token")
      localStorage.removeItem("promptpulse_selected_project_id")
    },
  }), [token, user])

  return <AuthContext.Provider value={value}> {children} </AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider")
  }
  return context
}
