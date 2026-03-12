"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Bell,
  AlertCircle,
  AlertTriangle,
  Info,
  Filter,
  CheckCircle,
  Clock,
  Skull,
  Eye,
  ShieldOff,
  Activity,
  ChevronRight,
} from "lucide-react"

interface Alert {
  id: string
  type: "zombie" | "shadow" | "security" | "anomaly" | "discovery"
  severity: "critical" | "warning" | "info"
  title: string
  description: string
  endpoint: string
  timestamp: string
  status: "open" | "investigating" | "resolved"
}

const alerts: Alert[] = [
  {
    id: "1",
    type: "zombie",
    severity: "critical",
    title: "Zombie API Detected",
    description: "Legacy payment endpoint has been inactive for 90+ days but still accessible",
    endpoint: "/api/v1/payments/legacy",
    timestamp: "2 minutes ago",
    status: "open",
  },
  {
    id: "2",
    type: "shadow",
    severity: "critical",
    title: "Shadow API Exposed",
    description: "Undocumented endpoint discovered with no authentication",
    endpoint: "/api/internal/debug",
    timestamp: "15 minutes ago",
    status: "investigating",
  },
  {
    id: "3",
    type: "security",
    severity: "warning",
    title: "Authentication Missing",
    description: "Public endpoint detected without proper auth middleware",
    endpoint: "/api/users/export",
    timestamp: "1 hour ago",
    status: "open",
  },
  {
    id: "4",
    type: "anomaly",
    severity: "warning",
    title: "High Traffic Anomaly",
    description: "Unusual spike in requests detected - 340% above baseline",
    endpoint: "/api/v2/users",
    timestamp: "2 hours ago",
    status: "investigating",
  },
  {
    id: "5",
    type: "discovery",
    severity: "info",
    title: "New API Discovered",
    description: "Previously unknown endpoint found during latest scan",
    endpoint: "/api/beta/features",
    timestamp: "3 hours ago",
    status: "open",
  },
  {
    id: "6",
    type: "security",
    severity: "critical",
    title: "Rate Limiting Bypass",
    description: "Possible rate limit bypass detected on admin endpoint",
    endpoint: "/api/admin/users",
    timestamp: "4 hours ago",
    status: "resolved",
  },
  {
    id: "7",
    type: "zombie",
    severity: "warning",
    title: "Deprecated Endpoint Active",
    description: "v1 endpoint receiving traffic despite deprecation",
    endpoint: "/api/v1/auth/login",
    timestamp: "5 hours ago",
    status: "open",
  },
  {
    id: "8",
    type: "anomaly",
    severity: "info",
    title: "Latency Increase",
    description: "Average response time increased by 45ms",
    endpoint: "/api/v2/search",
    timestamp: "6 hours ago",
    status: "resolved",
  },
]

const typeIcons = {
  zombie: Skull,
  shadow: Eye,
  security: ShieldOff,
  anomaly: Activity,
  discovery: Bell,
}

const severityConfig = {
  critical: {
    icon: AlertCircle,
    bg: "bg-critical/10",
    border: "border-critical/30",
    text: "text-critical",
    glow: "glow-critical",
  },
  warning: {
    icon: AlertTriangle,
    bg: "bg-warning/10",
    border: "border-warning/30",
    text: "text-warning",
    glow: "glow-warning",
  },
  info: {
    icon: Info,
    bg: "bg-primary/10",
    border: "border-primary/30",
    text: "text-primary",
    glow: "glow-cyan-sm",
  },
}

export default function AlertsPage() {
  const [filter, setFilter] = useState<"all" | "critical" | "warning" | "info">("all")
  const [statusFilter, setStatusFilter] = useState<"all" | "open" | "investigating" | "resolved">("all")

  const filteredAlerts = alerts.filter((alert) => {
    if (filter !== "all" && alert.severity !== filter) return false
    if (statusFilter !== "all" && alert.status !== statusFilter) return false
    return true
  })

  const openCount = alerts.filter((a) => a.status === "open").length
  const criticalCount = alerts.filter((a) => a.severity === "critical").length

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Alerts & Incidents</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Real-time security alerts and incident tracking
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-critical/10 text-critical text-sm">
              <AlertCircle className="w-4 h-4" />
              <span className="font-medium">{criticalCount}</span>
              <span className="text-critical/70">Critical</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-warning/10 text-warning text-sm">
              <Clock className="w-4 h-4" />
              <span className="font-medium">{openCount}</span>
              <span className="text-warning/70">Open</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Severity:</span>
            <div className="flex items-center gap-1">
              {(["all", "critical", "warning", "info"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                    filter === f
                      ? "bg-primary/20 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="w-px h-6 bg-border" />

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Status:</span>
            <div className="flex items-center gap-1">
              {(["all", "open", "investigating", "resolved"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                    statusFilter === s
                      ? "bg-primary/20 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="relative">
          <div className="absolute left-[27px] top-0 bottom-0 w-px bg-border" />

          <div className="space-y-4">
            {filteredAlerts.map((alert) => {
              const config = severityConfig[alert.severity]
              const TypeIcon = typeIcons[alert.type]

              return (
                <div
                  key={alert.id}
                  className={cn(
                    "relative pl-14 pr-4 py-4 glass-card rounded-xl border transition-all hover:scale-[1.01] cursor-pointer group animate-fade-up",
                    config.border
                  )}
                >
                  {/* Timeline Node */}
                  <div
                    className={cn(
                      "absolute left-4 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center z-10",
                      config.bg,
                      config.glow
                    )}
                  >
                    <TypeIcon className={cn("w-4 h-4", config.text)} />
                  </div>

                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-sm font-medium text-foreground">
                          {alert.title}
                        </h3>
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded-full text-xs font-medium",
                            alert.status === "open" && "bg-critical/10 text-critical",
                            alert.status === "investigating" && "bg-warning/10 text-warning",
                            alert.status === "resolved" && "bg-success/10 text-success"
                          )}
                        >
                          {alert.status.charAt(0).toUpperCase() + alert.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {alert.description}
                      </p>
                      <div className="flex items-center gap-4">
                        <code className="text-xs font-mono text-primary bg-primary/5 px-2 py-0.5 rounded">
                          {alert.endpoint}
                        </code>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {alert.timestamp}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {alert.status !== "resolved" && (
                        <Button variant="outline" size="sm">
                          {alert.status === "open" ? "Investigate" : "Resolve"}
                        </Button>
                      )}
                      <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
