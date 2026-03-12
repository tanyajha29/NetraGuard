"use client"

import { useEffect, useMemo, useState } from "react"
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

type InventoryItem = {
  id: number
  path: string
  method: string
  traffic_count: number
  current_status: string
  risk_level: string
}

type AlertItem = {
  id: number
  message: string
  severity: string
  api_asset_id: number
}

export default function DashboardPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [alerts, setAlerts] = useState<AlertItem[]>([])

  useEffect(() => {
    apiFetch<InventoryItem[]>("/api/v1/inventory").then(setInventory).catch(() => setInventory([]))
    apiFetch<AlertItem[]>("/api/v1/alerts").then(setAlerts).catch(() => setAlerts([]))
  }, [])

  const stats = useMemo(() => {
    const total = inventory.length
    const active = inventory.filter((i) => i.current_status === "active").length
    const zombie = inventory.filter((i) => i.current_status === "zombie").length
    const shadow = inventory.filter((i) => i.current_status === "shadow").length
    const highRisk = inventory.filter((i) => ["High", "Critical", "critical", "high"].includes(i.risk_level)).length
    return { total, active, zombie, shadow, highRisk }
  }, [inventory])

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Security Overview</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Real-time API security monitoring and threat detection
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            Live data from backend
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <MetricCard title="Total APIs" value={stats.total} icon={<Server className="w-5 h-5" />} trend={{ value: 0, direction: "neutral" }} />
          <MetricCard title="Active APIs" value={stats.active} icon={<Activity className="w-5 h-5" />} trend={{ value: 0, direction: "neutral" }} variant="success" />
          <MetricCard title="Zombie APIs" value={stats.zombie} icon={<Skull className="w-5 h-5" />} trend={{ value: 0, direction: "neutral" }} variant="critical" />
          <MetricCard title="Shadow APIs" value={stats.shadow} icon={<Eye className="w-5 h-5" />} trend={{ value: 0, direction: "neutral" }} variant="warning" />
          <MetricCard title="High Risk APIs" value={stats.highRisk} icon={<AlertTriangle className="w-5 h-5" />} trend={{ value: 0, direction: "neutral" }} variant="warning" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <ApiTrafficChart />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <RiskHeatmap />
              <ApiDistributionChart />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-foreground">Recent Alerts</h2>
              <button className="text-xs text-primary hover:text-primary/80 transition-colors">
                View All
              </button>
            </div>
            <div className="space-y-3">
              {alerts.slice(0, 5).map((alert) => (
                <AlertCard
                  key={alert.id}
                  title={alert.message}
                  description={`Asset #${alert.api_asset_id}`}
                  endpoint=""
                  timestamp=""
                  severity={alert.severity as any}
                  action="Open"
                />
              ))}
              {!alerts.length && <p className="text-sm text-muted-foreground">No alerts yet.</p>}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
