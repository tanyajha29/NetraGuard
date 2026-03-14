"use client"

import { useEffect, useMemo, useState, useCallback } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { MetricCard } from "@/components/dashboard/metric-card"
import { AlertCard } from "@/components/dashboard/alert-card"
import { ApiTrafficChart } from "@/components/dashboard/api-traffic-chart"
import { RiskHeatmap } from "@/components/dashboard/risk-heatmap"
import { ApiDistributionChart } from "@/components/dashboard/api-distribution-chart"
import {
  Server,
  Activity,
  Skull,
  Eye,
  AlertTriangle,
} from "lucide-react"
import { apiFetch } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

type AlertItem = {
  id: number
  message: string
  severity: string
  api_asset_id?: number
  alert_type?: string
}

type Asset = {
  id: number
  current_status: string
  risk_level: string
  traffic_count: number
  risk_score?: number
  path: string
}

type Summary = {
  total_apis: number
  active_apis: number
  zombie_apis: number
  shadow_apis: number
  critical_findings: number
}

export default function DashboardPage() {
  const { toast } = useToast()
  const [alerts, setAlerts] = useState<AlertItem[]>([])
  const [inventory, setInventory] = useState<Asset[]>([])
  const [riskCounts, setRiskCounts] = useState<Record<string, number>>({})
  const [trafficPoints, setTrafficPoints] = useState<{ label: string; requests: number }[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const [inv, al, riskResp, trafficResp, summaryResp] = await Promise.all([
        apiFetch<Asset[]>("/api/v1/inventory"),
        apiFetch<AlertItem[]>("/api/v1/alerts"),
        apiFetch<Record<string, number>>("/api/v1/dashboard/risk").catch(() => ({})),
        apiFetch<{ path: string; count: number }[]>("/api/v1/dashboard/traffic").catch(() => []),
        apiFetch<Summary>("/api/v1/dashboard/summary").catch(() => null),
      ])
      setInventory(inv)
      setAlerts(al)
      setRiskCounts(riskResp || {})
      setTrafficPoints(
        (trafficResp || []).map((t, idx) => ({
          label: t.path || `slot-${idx}`,
          requests: t.count || 0,
          errors: Math.max(0, Math.floor((t.count || 0) * 0.05)),
        }))
      )
      if (summaryResp) setSummary(summaryResp)
    } catch (err: any) {
      toast({ title: "Failed to load data", description: err.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    const handler = () => load()
    window.addEventListener("netraguard-refresh", handler)
    return () => window.removeEventListener("netraguard-refresh", handler)
  }, [load])

  const stats = useMemo(() => {
    if (summary) {
      return {
        total: summary.total_apis ?? 0,
        active: summary.active_apis ?? 0,
        zombie: summary.zombie_apis ?? 0,
        shadow: summary.shadow_apis ?? 0,
        highRisk: summary.critical_findings ?? 0,
      }
    }
    const total = inventory.length
    const active = inventory.filter((i) => i.current_status === "active").length
    const zombie = inventory.filter((i) => i.current_status === "zombie").length
    const shadow = inventory.filter((i) => i.current_status === "shadow").length
    const highRisk = inventory.filter((i) => ["High", "Critical", "high", "critical"].includes(i.risk_level)).length
    return { total, active, zombie, shadow, highRisk }
  }, [inventory])

  const distributionData = useMemo(() => {
    const counts: Record<string, number> = { Active: 0, Deprecated: 0, Shadow: 0, Zombie: 0 }
    inventory.forEach((i) => {
      const status = i.current_status?.toLowerCase()
      if (status === "deprecated") counts.Deprecated += 1
      else if (status === "shadow") counts.Shadow += 1
      else if (status === "zombie") counts.Zombie += 1
      else counts.Active += 1
    })
    return [
      { name: "Active", value: counts.Active, color: "oklch(0.68 0.17 145)" },
      { name: "Deprecated", value: counts.Deprecated, color: "oklch(0.78 0.16 75)" },
      { name: "Shadow", value: counts.Shadow, color: "oklch(0.75 0.15 50)" },
      { name: "Zombie", value: counts.Zombie, color: "oklch(0.62 0.22 25)" },
    ]
  }, [inventory])

  const heatmapData = useMemo(() => {
    return inventory.slice(0, 20).map((asset, idx) => ({
      id: String(asset.id || idx),
      name: asset.path || asset.current_status || "api",
      risk: asset.risk_score || (asset.risk_level?.toLowerCase().includes("high") ? 80 : 40),
      category: asset.current_status || "Unknown",
    }))
  }, [inventory])

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Security Overview</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Real-time API security monitoring and threat detection
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            {loading ? "Loading..." : "Live from backend"}
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <MetricCard
            title="Total APIs"
            value={stats.total}
            icon={<Server className="w-5 h-5" />}
            trend={{ value: 0, direction: "neutral" }}
          />
          <MetricCard
            title="Active APIs"
            value={stats.active}
            icon={<Activity className="w-5 h-5" />}
            trend={{ value: 0, direction: "neutral" }}
            variant="success"
          />
          <MetricCard
            title="Zombie APIs"
            value={stats.zombie}
            icon={<Skull className="w-5 h-5" />}
            trend={{ value: 0, direction: "neutral" }}
            variant="critical"
          />
          <MetricCard
            title="Shadow APIs"
            value={stats.shadow}
            icon={<Eye className="w-5 h-5" />}
            trend={{ value: 0, direction: "neutral" }}
            variant="warning"
          />
          <MetricCard
            title="High Risk APIs"
            value={stats.highRisk}
            icon={<AlertTriangle className="w-5 h-5" />}
            trend={{ value: 0, direction: "neutral" }}
            variant="warning"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Charts */}
          <div className="lg:col-span-2 space-y-6">
            <ApiTrafficChart data={trafficPoints} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <RiskHeatmap data={heatmapData} />
              <ApiDistributionChart data={distributionData} />
            </div>
          </div>

          {/* Right Column - Alerts */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-foreground">Recent Alerts</h2>
              <button className="text-xs text-primary hover:text-primary/80 transition-colors">
                View All
              </button>
            </div>
            <div className="space-y-3">
              {(alerts || []).slice(0, 5).map((alert) => (
                <AlertCard
                  key={alert.id}
                  title={alert.message}
                  description={alert.alert_type || ""}
                  endpoint={alert.api_asset_id ? `Asset #${alert.api_asset_id}` : ""}
                  timestamp=""
                  severity={(alert.severity as any) || "info"}
                  action="Open"
                />
              ))}
              {!alerts.length && !loading && (
                <div className="text-sm text-muted-foreground">No alerts yet.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
