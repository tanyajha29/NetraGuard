"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { token, loading } = useAuth()
  const router = useRouter()
  const path = usePathname()

  useEffect(() => {
    if (!loading && !token && !path.startsWith("/auth")) {
      router.replace("/auth/login")
    }
  }, [token, loading, path, router])

  if (!token && !path.startsWith("/auth")) {
    return null
  }
  return <>{children}</>
}
