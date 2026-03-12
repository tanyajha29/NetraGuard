"use client"

import { X, Shield, Activity, GitBranch, Clock, AlertTriangle, CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { RiskBadge } from "@/components/dashboard/risk-badge"
import { ApiEndpoint } from "./api-table"
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  BarChart,
} from "recharts"

interface ApiDetailPanelProps {
  api: ApiEndpoint | null
  onClose: () => void
}

const trafficData = [
  { hour: "00", requests: 120 },
  { hour: "04", requests: 80 },
  { hour: "08", requests: 450 },
  { hour: "12", requests: 680 },
  { hour: "16", requests: 520 },
  { hour: "20", requests: 340 },
]

const requestDistribution = [
  { status: "2xx", count: 8450, color: "oklch(0.68 0.17 145)" },
  { status: "4xx", count: 234, color: "oklch(0.78 0.16 75)" },
  { status: "5xx", count: 45, color: "oklch(0.62 0.22 25)" },
]

const securityChecks = [
  { name: "Authentication", status: "pass", description: "OAuth 2.0 implemented" },
  { name: "Encryption", status: "pass", description: "TLS 1.3 enabled" },
  { name: "Rate Limiting", status: "warning", description: "No rate limit configured" },
  { name: "Input Validation", status: "pass", description: "Schema validation active" },
  { name: "Sensitive Data", status: "fail", description: "PII exposed in response" },
]

export function ApiDetailPanel({ api, onClose }: ApiDetailPanelProps) {
  if (!api) return null

  return (
    <div className="fixed inset-y-0 right-0 w-[480px] bg-card border-l border-border shadow-2xl z-50 animate-slide-in-right overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-card/95 backdrop-blur border-b border-border p-4 z-10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-foreground">API Details</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
        <code className="text-sm font-mono text-primary bg-primary/10 px-2 py-1 rounded">
          {api.endpoint}
        </code>
      </div>

      <div className="p-4 space-y-6">
        {/* Status Overview */}
        <div className="grid grid-cols-2 gap-4">
          <div className="glass-card rounded-lg p-3 border border-border/50">
            <p className="text-xs text-muted-foreground mb-1">Status</p>
            <StatusBadge status={api.status} />
          </div>
          <div className="glass-card rounded-lg p-3 border border-border/50">
            <p className="text-xs text-muted-foreground mb-1">Risk Level</p>
            <RiskBadge level={api.risk} />
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 rounded-lg bg-muted/30">
            <Activity className="w-4 h-4 mx-auto mb-1 text-primary" />
            <p className="text-lg font-bold font-mono text-foreground">{api.traffic.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Requests/hr</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/30">
            <Clock className="w-4 h-4 mx-auto mb-1 text-warning" />
            <p className="text-lg font-bold font-mono text-foreground">142ms</p>
            <p className="text-xs text-muted-foreground">Avg Latency</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/30">
            <GitBranch className="w-4 h-4 mx-auto mb-1 text-success" />
            <p className="text-lg font-bold font-mono text-foreground">12</p>
            <p className="text-xs text-muted-foreground">Dependencies</p>
          </div>
        </div>

        {/* Traffic Chart */}
        <div className="glass-card rounded-lg p-4 border border-border/50">
          <h3 className="text-sm font-medium text-foreground mb-3">Traffic Over Time</h3>
          <div className="h-[120px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trafficData}>
                <defs>
                  <linearGradient id="trafficGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.82 0.18 195)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="oklch(0.82 0.18 195)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="hour"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "oklch(0.65 0.01 240)", fontSize: 10 }}
                />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "oklch(0.15 0.02 260)",
                    border: "1px solid oklch(0.25 0.02 260)",
                    borderRadius: "6px",
                    fontSize: "11px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="requests"
                  stroke="oklch(0.82 0.18 195)"
                  strokeWidth={2}
                  fill="url(#trafficGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Response Distribution */}
        <div className="glass-card rounded-lg p-4 border border-border/50">
          <h3 className="text-sm font-medium text-foreground mb-3">Response Distribution</h3>
          <div className="h-[80px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={requestDistribution} layout="vertical">
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="status"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "oklch(0.65 0.01 240)", fontSize: 11 }}
                  width={40}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "oklch(0.15 0.02 260)",
                    border: "1px solid oklch(0.25 0.02 260)",
                    borderRadius: "6px",
                    fontSize: "11px",
                  }}
                />
                <Bar dataKey="count" radius={4}>
                  {requestDistribution.map((entry, index) => (
                    <Bar key={index} dataKey="count" fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Security Posture */}
        <div className="glass-card rounded-lg p-4 border border-border/50">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-medium text-foreground">Security Posture</h3>
          </div>
          <div className="space-y-2">
            {securityChecks.map((check) => (
              <div
                key={check.name}
                className="flex items-center justify-between p-2 rounded-lg bg-muted/20"
              >
                <div className="flex items-center gap-2">
                  {check.status === "pass" && (
                    <CheckCircle className="w-4 h-4 text-success" />
                  )}
                  {check.status === "warning" && (
                    <AlertTriangle className="w-4 h-4 text-warning" />
                  )}
                  {check.status === "fail" && (
                    <XCircle className="w-4 h-4 text-critical" />
                  )}
                  <span className="text-sm text-foreground">{check.name}</span>
                </div>
                <span className="text-xs text-muted-foreground">{check.description}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <Button className="w-full bg-critical hover:bg-critical/90 text-critical-foreground">
            Mark as Zombie
          </Button>
          <Button variant="outline" className="w-full">
            Schedule Decommission
          </Button>
          <Button variant="outline" className="w-full">
            Restrict Access
          </Button>
        </div>
      </div>
    </div>
  )
}
