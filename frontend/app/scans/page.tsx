"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { ScanProgress } from "@/components/scans/scan-progress"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  Radar,
  Play,
  Pause,
  Clock,
  CheckCircle,
  AlertCircle,
  Server,
  Globe,
  Database,
} from "lucide-react"

interface ScanResult {
  id: string
  target: string
  source: string
  duration: string
  status: "completed" | "running" | "failed"
  findings: number
  timestamp: string
}

const scanHistory: ScanResult[] = [
  { id: "1", target: "api.production.com", source: "Gateway Logs", duration: "4m 32s", status: "completed", findings: 23, timestamp: "Today, 10:45 AM" },
  { id: "2", target: "staging.internal.io", source: "Traffic Analysis", duration: "2m 18s", status: "completed", findings: 8, timestamp: "Today, 09:30 AM" },
  { id: "3", target: "legacy-api.corp.net", source: "Code Repository", duration: "6m 45s", status: "completed", findings: 47, timestamp: "Yesterday, 04:15 PM" },
  { id: "4", target: "partner-api.external", source: "DNS Records", duration: "1m 55s", status: "failed", findings: 0, timestamp: "Yesterday, 02:00 PM" },
  { id: "5", target: "mobile-api.app.io", source: "Gateway Logs", duration: "3m 12s", status: "completed", findings: 15, timestamp: "Yesterday, 11:30 AM" },
  { id: "6", target: "dev.sandbox.local", source: "Network Scan", duration: "5m 08s", status: "completed", findings: 31, timestamp: "Mar 10, 2026" },
]

const scanTargets = [
  { name: "Production APIs", icon: Server, count: 847, selected: true },
  { name: "Internal Services", icon: Database, count: 234, selected: true },
  { name: "External Partners", icon: Globe, count: 56, selected: false },
]

export default function ScansPage() {
  const [isScanning, setIsScanning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentTarget, setCurrentTarget] = useState("")

  const targets = [
    "/api/v1/*",
    "/api/v2/*",
    "/api/internal/*",
    "/api/admin/*",
    "/api/webhooks/*",
    "/api/legacy/*",
  ]

  useEffect(() => {
    if (!isScanning) return

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setIsScanning(false)
          return 0
        }
        const targetIndex = Math.floor((prev / 100) * targets.length)
        setCurrentTarget(targets[targetIndex] || targets[0])
        return prev + 2
      })
    }, 200)

    return () => clearInterval(interval)
  }, [isScanning])

  const startScan = () => {
    setProgress(0)
    setIsScanning(true)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Discovery Scans</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Discover and catalog API endpoints across your infrastructure
            </p>
          </div>
          <Button
            onClick={isScanning ? () => setIsScanning(false) : startScan}
            className={cn(
              "px-6",
              isScanning
                ? "bg-warning hover:bg-warning/90"
                : "bg-primary hover:bg-primary/90 animate-pulse-glow"
            )}
          >
            {isScanning ? (
              <>
                <Pause className="w-4 h-4 mr-2" />
                Stop Scan
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Start Scan
              </>
            )}
          </Button>
        </div>

        {/* Scan Progress */}
        <ScanProgress
          isScanning={isScanning}
          progress={progress}
          currentTarget={currentTarget}
        />

        {/* Scan Targets */}
        <div className="grid grid-cols-3 gap-4">
          {scanTargets.map((target) => (
            <div
              key={target.name}
              className={cn(
                "glass-card rounded-xl p-4 border cursor-pointer transition-all",
                target.selected
                  ? "border-primary/50 bg-primary/5"
                  : "border-border/50 hover:border-primary/30"
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "p-2 rounded-lg",
                    target.selected ? "bg-primary/20" : "bg-muted"
                  )}
                >
                  <target.icon
                    className={cn(
                      "w-5 h-5",
                      target.selected ? "text-primary" : "text-muted-foreground"
                    )}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {target.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {target.count} endpoints
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Scan History */}
        <div className="space-y-4">
          <h2 className="text-lg font-medium text-foreground">Scan History</h2>
          <div className="glass-card rounded-xl border border-border/50 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50 bg-muted/30">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Scan ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Target
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Source
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Findings
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Timestamp
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {scanHistory.map((scan) => (
                  <tr
                    key={scan.id}
                    className="hover:bg-primary/5 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <code className="text-sm font-mono text-primary">
                        SCN-{scan.id.padStart(4, "0")}
                      </code>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-foreground">{scan.target}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-muted-foreground">{scan.source}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Clock className="w-3.5 h-3.5" />
                        {scan.duration}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div
                        className={cn(
                          "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium",
                          scan.status === "completed" &&
                            "bg-success/10 text-success",
                          scan.status === "running" &&
                            "bg-primary/10 text-primary",
                          scan.status === "failed" &&
                            "bg-critical/10 text-critical"
                        )}
                      >
                        {scan.status === "completed" && (
                          <CheckCircle className="w-3 h-3" />
                        )}
                        {scan.status === "running" && (
                          <Radar className="w-3 h-3 animate-spin" />
                        )}
                        {scan.status === "failed" && (
                          <AlertCircle className="w-3 h-3" />
                        )}
                        {scan.status.charAt(0).toUpperCase() + scan.status.slice(1)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "text-sm font-mono",
                          scan.findings > 20
                            ? "text-warning"
                            : scan.findings > 0
                            ? "text-foreground"
                            : "text-muted-foreground"
                        )}
                      >
                        {scan.findings}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-muted-foreground">
                        {scan.timestamp}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
