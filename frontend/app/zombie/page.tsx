"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { RiskBadge } from "@/components/dashboard/risk-badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
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

interface ZombieApi {
  id: string
  endpoint: string
  method: string
  lastUsed: string
  daysSinceActive: number
  risk: "critical" | "high"
  vulnerabilities: string[]
  owner: string
  recommendation: string
}

const zombieApis: ZombieApi[] = [
  {
    id: "1",
    endpoint: "/api/v1/payments/legacy",
    method: "POST",
    lastUsed: "Dec 8, 2025",
    daysSinceActive: 94,
    risk: "critical",
    vulnerabilities: ["No authentication", "Exposed PII", "Outdated encryption"],
    owner: "Legacy Team",
    recommendation: "Immediate decommission recommended",
  },
  {
    id: "2",
    endpoint: "/api/v0/users/bulk",
    method: "POST",
    lastUsed: "Nov 15, 2025",
    daysSinceActive: 117,
    risk: "critical",
    vulnerabilities: ["SQL injection risk", "No rate limiting"],
    owner: "Unknown",
    recommendation: "Security review required",
  },
  {
    id: "3",
    endpoint: "/api/internal/admin/export",
    method: "GET",
    lastUsed: "Jan 5, 2026",
    daysSinceActive: 66,
    risk: "high",
    vulnerabilities: ["Weak authentication"],
    owner: "Admin Team",
    recommendation: "Restrict access or deprecate",
  },
  {
    id: "4",
    endpoint: "/api/v1/reports/generate",
    method: "POST",
    lastUsed: "Oct 22, 2025",
    daysSinceActive: 141,
    risk: "critical",
    vulnerabilities: ["No input validation", "Memory leak risk"],
    owner: "Analytics",
    recommendation: "Replace with v2 endpoint",
  },
  {
    id: "5",
    endpoint: "/api/legacy/search",
    method: "GET",
    lastUsed: "Sep 30, 2025",
    daysSinceActive: 163,
    risk: "high",
    vulnerabilities: ["Outdated dependencies"],
    owner: "Search Team",
    recommendation: "Migrate to new search service",
  },
]

export default function ZombiePage() {
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
            <p className="text-3xl font-bold font-mono text-critical">23</p>
          </div>
          <div className="glass-card rounded-xl p-5 border border-warning/30">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-warning/20">
                <AlertTriangle className="w-5 h-5 text-warning" />
              </div>
              <span className="text-sm text-muted-foreground">Critical Risk</span>
            </div>
            <p className="text-3xl font-bold font-mono text-warning">8</p>
          </div>
          <div className="glass-card rounded-xl p-5 border border-border/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-muted">
                <Clock className="w-5 h-5 text-muted-foreground" />
              </div>
              <span className="text-sm text-muted-foreground">Avg. Days Inactive</span>
            </div>
            <p className="text-3xl font-bold font-mono text-foreground">116</p>
          </div>
          <div className="glass-card rounded-xl p-5 border border-border/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-muted">
                <ShieldOff className="w-5 h-5 text-muted-foreground" />
              </div>
              <span className="text-sm text-muted-foreground">Vulnerabilities</span>
            </div>
            <p className="text-3xl font-bold font-mono text-foreground">47</p>
          </div>
        </div>

        {/* Zombie List */}
        <div className="space-y-4">
          <h2 className="text-lg font-medium text-foreground">Detected Zombie APIs</h2>
          <div className="space-y-3">
            {zombieApis.map((api) => (
              <div
                key={api.id}
                className={cn(
                  "glass-card rounded-xl p-5 border transition-all hover:scale-[1.01] cursor-pointer group",
                  api.risk === "critical"
                    ? "border-critical/30 hover:border-critical/50"
                    : "border-warning/30 hover:border-warning/50"
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className={cn(
                          "p-1.5 rounded",
                          api.risk === "critical"
                            ? "bg-critical/20"
                            : "bg-warning/20"
                        )}
                      >
                        <Skull
                          className={cn(
                            "w-4 h-4",
                            api.risk === "critical"
                              ? "text-critical"
                              : "text-warning"
                          )}
                        />
                      </div>
                      <code className="text-sm font-mono text-foreground">
                        {api.endpoint}
                      </code>
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded text-xs font-medium",
                          api.method === "POST"
                            ? "bg-primary/10 text-primary"
                            : "bg-success/10 text-success"
                        )}
                      >
                        {api.method}
                      </span>
                      <RiskBadge level={api.risk} />
                    </div>

                    <div className="flex items-center gap-6 text-sm text-muted-foreground mb-3">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        Last used: {api.lastUsed}
                      </span>
                      <span className="font-mono text-critical">
                        {api.daysSinceActive} days inactive
                      </span>
                      <span>Owner: {api.owner}</span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {api.vulnerabilities.map((vuln) => (
                        <span
                          key={vuln}
                          className="px-2 py-1 rounded bg-critical/10 text-critical text-xs"
                        >
                          {vuln}
                        </span>
                      ))}
                    </div>

                    <p className="text-sm text-warning mt-3 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      {api.recommendation}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="outline" size="sm">
                      <Lock className="w-4 h-4 mr-1" />
                      Restrict
                    </Button>
                    <Button
                      size="sm"
                      className="bg-critical hover:bg-critical/90"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Decommission
                    </Button>
                    <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
