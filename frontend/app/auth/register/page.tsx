"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import Link from "next/link"

export default function RegisterPage() {
  const { register } = useAuth()
  const router = useRouter()
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await register(fullName, email, password)
      router.replace("/")
    } catch (err: any) {
      setError(err?.message || "Registration failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-cyber">
      <div className="w-full max-width-sm glass-card p-8 rounded-2xl border border-border/60">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-bold">NG</div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Create your account</h1>
            <p className="text-sm text-muted-foreground">Get started with NetraGuard</p>
          </div>
        </div>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="text-sm text-muted-foreground">Full name</label>
            <input
              className="w-full mt-1 h-11 rounded-lg bg-muted/40 border border-border px-3 text-foreground"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Email</label>
            <input
              className="w-full mt-1 h-11 rounded-lg bg-muted/40 border border-border px-3 text-foreground"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Password</label>
            <input
              className="w-full mt-1 h-11 rounded-lg bg-muted/40 border border-border px-3 text-foreground"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
            />
          </div>
          {error && <p className="text-sm text-critical">{error}</p>}
          <button
            type="submit"
            className="w-full h-11 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create account"}
          </button>
        </form>
        <p className="text-sm text-muted-foreground mt-4">
          Already have an account? <Link href="/auth/login" className="text-primary">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
