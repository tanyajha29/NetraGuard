"use client"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export const getToken = () => {
  if (typeof window === "undefined") return null
  return localStorage.getItem("token")
}

export const setToken = (token: string | null) => {
  if (typeof window === "undefined") return
  if (!token) {
    localStorage.removeItem("token")
    return
  }
  localStorage.setItem("token", token)
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  }
  const res = await fetch(`${API_URL}${path}`, { ...options, headers })
  if (!res.ok) {
    const detail = await res.text()
    throw new Error(detail || `Request failed with ${res.status}`)
  }
  if (res.status === 204) return {} as T
  return res.json()
}
