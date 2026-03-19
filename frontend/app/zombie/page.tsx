"use client"

import { useEffect, useMemo, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { RiskBadge } from "@/components/dashboard/risk-badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { apiFetch } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import {
  Skull,
  AlertTriangle,
  Clock,
  ShieldOff,
  Trash2,
  Eye,
  Lock,
  ChevronRight,
} from "lucide-react"

type ZombieApi = {
  id: number
  endpoint: string
  method: string
  daysSinceActive: number
  risk: "critical" | "high" | "medium" | "low"
  recommendation?: string
  traffic_count?: number
  service_name?: string
}

export default function ZombiePage() {
  const { toast } = useToast()
  const [apis, setApis] = useState<ZombieApi[]>([])

  useEffect(() => {
    apiFetch<any[]>("/api/v1/zombie")
      .then((data) => {
        const mapped = (data || []).map((r: any) => ({
          id: r.id,
          endpoint: r.path,
          method: r.method,
          daysSinceActive: r.days_inactive ?? r.daysInactive ?? 0,
          risk: ((r.risk_level || "high") as string).toLowerCase() as ZombieApi["risk"],
          recommendation: r.recommendation,
          traffic_count: r.traffic_count,
          service_name: r.service_name,
        }))
        setApis(mapped)
      })
      .catch((err: any) => {
        toast({ title: "Using demo zombie data", description: err.message, variant: "default" })
        setApis([])
      })
  }, [toast])

  const stats = useMemo(() => {
    const total = apis.length
    const critical = apis.filter((a) => ["critical", "high"].includes(a.risk)).length
    const avgDays =
      total === 0 ? 0 : Math.round(apis.reduce((sum, a) => sum + (a.daysSinceActive || 0), 0) / total)
    return { total, critical, avgDays }
  }, [apis])

  const displayed = apis

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Zombie API Detection</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Identify and manage inactive or abandoned API endpoints
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Eye className="w-4 h-4 mr-2" />
              Review All
            </Button>
            <Button className="bg-critical hover:bg-critical/90">
              <Trash2 className="w-4 h-4 mr-2" />
              Bulk Decommission
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="glass-card rounded-xl p-5 border border-critical/30 glow-critical">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-critical/20">
                <Skull className="w-5 h-5 text-critical" />
              </div>
              <span className="text-sm text-muted-foreground">Total Zombies</span>
            </div>
            <p className="text-3xl font-bold font-mono text-critical">{stats.total}</p>
          </div>
          <div className="glass-card rounded-xl p-5 border border-warning/30">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-warning/20">
                <AlertTriangle className="w-5 h-5 text-warning" />
              </div>
              <span className="text-sm text-muted-foreground">Critical Risk</span>
            </div>
            <p className="text-3xl font-bold font-mono text-warning">{stats.critical}</p>
          </div>
          <div className="glass-card rounded-xl p-5 border border-border/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-muted">
                <Clock className="w-5 h-5 text-muted-foreground" />
              </div>
              <span className="text-sm text-muted-foreground">Avg. Days Inactive</span>
            </div>
            <p className="text-3xl font-bold font-mono text-foreground">{stats.avgDays}</p>
          </div>
          <div className="glass-card rounded-xl p-5 border border-border/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-muted">
                <ShieldOff className="w-5 h-5 text-muted-foreground" />
              </div>
              <span className="text-sm text-muted-foreground">Vulnerabilities</span>
            </div>
            <p className="text-3xl font-bold font-mono text-foreground">{displayed.length ? "Live" : "—"}</p>
          </div>
        </div>

        {/* Zombie List */}
        <div className="space-y-4">
          <h2 className="text-lg font-medium text-foreground">Detected Zombie APIs</h2>
          <div className="space-y-3">
            {displayed.map((api) => (
              <div
                key={api.id}
                className={cn(
                  "glass-card rounded-xl p-5 border transition-all hover:scale-[1.01] cursor-pointer group",
                  api.risk === "critical"
                    ? "border-critical/40 shadow-[0_10px_30px_-12px_rgba(255,69,96,0.45)]"
                    : "border-border/50"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-critical/10">
                      <Skull className="w-5 h-5 text-critical" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {api.method} {api.endpoint}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Last seen {api.daysSinceActive} days ago &bull; {api.service_name || "Unassigned"}
                      </p>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" className="text-xs">
                    Investigate
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <RiskBadge risk={api.risk === "critical" ? "Critical" : "High"} />
                  <div className="px-2 py-1 rounded-full text-xs bg-muted/50 border border-border/60">
                    {api.traffic_count ?? 0} recent calls
                  </div>
                  <div className="px-2 py-1 rounded-full text-xs bg-muted/50 border border-border/60">
                    {api.method}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {api.recommendation || "Review and schedule remediation"}
                </p>
              </div>
            ))}
            {!displayed.length && (
              <div className="glass-card p-4 rounded-xl border border-border/60 text-sm text-muted-foreground">
                No zombie APIs detected yet. Run a scan to populate results.
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
