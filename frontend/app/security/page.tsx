"use client"

import { useEffect, useMemo, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { apiFetch } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Lock, Key, AlertTriangle, BarChart } from "lucide-react"

type Summary = {
  missing_auth: number
  insecure_transport: number
  no_rate_limit_detected: number
  sensitive_data_exposed: number
  high_critical_findings: number
}

type Finding = {
  id: number
  finding_type: string
  severity: string
  title: string
  description: string
  recommendation: string
  created_at: string
}

export default function SecurityPage() {
  const { toast } = useToast()
  const [summary, setSummary] = useState<Summary | null>(null)
  const [findings, setFindings] = useState<Finding[]>([])
  const [apiId, setApiId] = useState<number | null>(null)
  const [apiOptions, setApiOptions] = useState<{ id: number; path: string }[]>([])

  useEffect(() => {
    apiFetch<Summary>("/api/v1/security/summary")
      .then(setSummary)
      .catch((err: any) => toast({ title: "Failed to load security summary", description: err.message, variant: "destructive" }))

    apiFetch<any[]>("/api/v1/apis")
      .then((apis) => {
        const opts = (apis || []).map((a: any) => ({ id: a.id, path: a.path || a.endpoint }))
        setApiOptions(opts)
        if (opts.length) setApiId(opts[0].id)
      })
      .catch(() => setApiOptions([]))
  }, [toast])

  useEffect(() => {
    if (!apiId) return
    apiFetch<{ findings: Finding[] }>(`/api/v1/security/${apiId}`)
      .then((data) => setFindings(data?.findings || []))
      .catch(() => setFindings([]))
  }, [apiId])

  const tiles = useMemo(
    () => [
      { label: "Missing Auth", value: summary?.missing_auth ?? 0, icon: Key },
      { label: "Insecure Transport", value: summary?.insecure_transport ?? 0, icon: Lock },
      { label: "No Rate Limit", value: summary?.no_rate_limit_detected ?? 0, icon: Shield },
      { label: "Sensitive Data", value: summary?.sensitive_data_exposed ?? 0, icon: AlertTriangle },
      { label: "High/Critical Findings", value: summary?.high_critical_findings ?? 0, icon: BarChart },
    ],
    [summary]
  )

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Security Analysis</h1>
            <p className="text-sm text-muted-foreground mt-1">Live findings across discovered APIs</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {tiles.map((t) => (
            <Card key={t.label} className="glass-card border-border/60">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t.label}</CardTitle>
                <t.icon className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{t.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="glass-card border border-border/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-4 h-4" /> Findings
            </CardTitle>
            <div className="text-sm text-muted-foreground">
              <select
                className="bg-muted/50 border border-border/60 rounded-md px-3 py-2 text-sm"
                value={apiId ?? ""}
                onChange={(e) => setApiId(Number(e.target.value))}
              >
                {apiOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.path}
                  </option>
                ))}
              </select>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {findings.length === 0 && (
              <p className="text-sm text-muted-foreground">Select an API to view findings.</p>
            )}
            {findings.map((f) => (
              <div key={f.id} className="border border-border/60 rounded-lg p-3">
                <div className="text-sm font-semibold">{f.title}</div>
                <div className="text-xs text-muted-foreground mb-1">
                  {f.severity} • {f.finding_type}
                </div>
                <p className="text-sm text-muted-foreground">{f.description}</p>
                <p className="text-xs text-foreground mt-2">Recommendation: {f.recommendation}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
