"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { apiFetch, setToken, getToken } from "@/lib/api"

type User = {
  id: number
  full_name: string
  email: string
  role: string
}

type AuthContextValue = {
  user: User | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (full_name: string, email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(() => getToken())
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)

  const loadMe = async (tok: string | null) => {
    if (!tok) {
      setUser(null)
      return
    }
    try {
      setLoading(true)
      const me = await apiFetch<User>("/api/v1/auth/me")
      setUser(me)
    } catch {
      logout()
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMe(token)
  }, [token])

  const login = async (email: string, password: string) => {
    const res = await apiFetch<{ access_token: string }>("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
    setToken(res.access_token)
    setTokenState(res.access_token)
    await loadMe(res.access_token)
  }

  const register = async (full_name: string, email: string, password: string) => {
    await apiFetch("/api/v1/auth/register", {
      method: "POST",
      body: JSON.stringify({ full_name, email, password, role: "analyst" }),
    })
    await login(email, password)
  }

  const logout = () => {
    setTokenState(null)
    setUser(null)
    setToken(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
