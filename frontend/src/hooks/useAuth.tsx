import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from "react"
import { api } from "@/lib/api"

type User = {
  id: string
  email: string
  account_type: "SINGLE" | "AGENCY"
  plan: "FREE" | "STARTER" | "GROWTH" | "PRO"
  role?: "USER" | "ADMIN"
  is_verified?: boolean
}

type AuthContextValue = {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("geolens_access_token"))
  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem("geolens_user")
    return raw ? JSON.parse(raw) as User : null
  })

  useEffect(() => {
    if (token) localStorage.setItem("geolens_access_token", token)
    else localStorage.removeItem("geolens_access_token")
  }, [token])

  useEffect(() => {
    if (user) localStorage.setItem("geolens_user", JSON.stringify(user))
    else localStorage.removeItem("geolens_user")
  }, [user])

  const value = useMemo<AuthContextValue>(() => ({
    user,
    token,
    isAuthenticated: Boolean(token),
    async login(email: string, password: string) {
      const response = await api.post("/auth/login", { email, password })
      const accessToken = response.data.access_token ?? response.data.accessToken
      if (!accessToken) throw new Error("Login succeeded but no access token was returned")
      setToken(accessToken)
      setUser(response.data.user)
    },
    logout() {
      setToken(null)
      setUser(null)
      localStorage.removeItem("geolens_selected_project_id")
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
