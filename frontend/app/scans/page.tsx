"use client"

import { useEffect, useState } from "react"
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
} from "lucide-react"
import { apiFetch } from "@/lib/api"

type Target = { id: number; name: string; base_url: string }
type ScanRow = {
  id: number
  target_id: number
  status: string
  started_at: string
  ended_at: string | null
  total_apis: number
  created_at: string
}

export default function ScansPage() {
  const [isScanning, setIsScanning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentTarget, setCurrentTarget] = useState("")
  const [targets, setTargets] = useState<Target[]>([])
  const [selectedTarget, setSelectedTarget] = useState<number | null>(null)
  const [newTarget, setNewTarget] = useState({ name: "", base_url: "" })
  const [scanHistory, setScanHistory] = useState<ScanRow[]>([])
  const [logFile, setLogFile] = useState("logs_test1.json")

  // fetch targets & scans
  useEffect(() => {
    apiFetch<Target[]>("/api/v1/targets").then((t) => {
      setTargets(t)
      if (t.length) setSelectedTarget(t[0].id)
    }).catch(() => setTargets([]))
    apiFetch<ScanRow[]>("/api/v1/scans").then(setScanHistory).catch(() => setScanHistory([]))
  }, [])

  // fake progress UI while task runs
  useEffect(() => {
    if (!isScanning) return
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          setIsScanning(false)
          return 0
        }
        setCurrentTarget(`${selectedTarget ?? ""} :: ${logFile}`)
        return p + 5
      })
    }, 200)
    return () => clearInterval(interval)
  }, [isScanning, selectedTarget, logFile])

  const startScan = async () => {
    if (!selectedTarget) return
    setIsScanning(true)
    setProgress(5)
    try {
      await apiFetch("/api/v1/scans/start", {
        method: "POST",
        body: { target_id: selectedTarget, trigger_type: "manual", log_file: logFile },
      })
      const latest = await apiFetch<ScanRow[]>("/api/v1/scans")
      setScanHistory(latest)
    } catch (err) {
      console.error(err)
    } finally {
      setIsScanning(false)
    }
  }

  const createTarget = async () => {
    if (!newTarget.name || !newTarget.base_url) return
    await apiFetch("/api/v1/targets", {
      method: "POST",
      body: { ...newTarget, is_active: true },
    })
    const refreshed = await apiFetch<Target[]>("/api/v1/targets")
    setTargets(refreshed)
    setSelectedTarget(refreshed[0]?.id ?? null)
    setNewTarget({ name: "", base_url: "" })
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Discovery Scans</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Register targets and launch discovery/log scans
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass-card p-4 rounded-xl border border-border/60 space-y-3">
            <p className="text-sm text-muted-foreground">Select target</p>
            <select
              className="w-full h-10 rounded-lg bg-muted/50 border border-border px-3 text-foreground"
              value={selectedTarget ?? ""}
              onChange={(e) => setSelectedTarget(Number(e.target.value))}
            >
              {targets.map((t) => (
                <option key={t.id} value={t.id}>{t.name} ({t.base_url})</option>
              ))}
            </select>
            <p className="text-sm text-muted-foreground">Log file (demo)</p>
            <select
              className="w-full h-10 rounded-lg bg-muted/50 border border-border px-3 text-foreground"
              value={logFile}
              onChange={(e) => setLogFile(e.target.value)}
            >
              <option value="logs_test1.json">logs_test1.json</option>
              <option value="logs_test2.json">logs_test2.json</option>
              <option value="logs_test3.json">logs_test3.json</option>
            </select>
          </div>

          <div className="glass-card p-4 rounded-xl border border-border/60 space-y-2 md:col-span-2">
            <p className="text-sm text-muted-foreground">Register new target</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <input
                className="h-10 rounded-lg bg-muted/50 border border-border px-3 text-foreground"
                placeholder="Name"
                value={newTarget.name}
                onChange={(e) => setNewTarget({ ...newTarget, name: e.target.value })}
              />
              <input
                className="h-10 rounded-lg bg-muted/50 border border-border px-3 text-foreground"
                placeholder="Base URL (http://localhost:8100)"
                value={newTarget.base_url}
                onChange={(e) => setNewTarget({ ...newTarget, base_url: e.target.value })}
              />
              <Button onClick={createTarget} className="h-10">Save Target</Button>
            </div>
          </div>
        </div>

        <ScanProgress
          isScanning={isScanning}
          progress={progress}
          currentTarget={currentTarget}
        />

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
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Total APIs
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Started
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Finished
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {scanHistory.map((scan) => (
                  <tr key={scan.id} className="hover:bg-primary/5 transition-colors">
                    <td className="px-4 py-3">
                      <code className="text-sm font-mono text-primary">SCN-{String(scan.id).padStart(4, "0")}</code>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-foreground">
                        {targets.find((t) => t.id === scan.target_id)?.name || `Target #${scan.target_id}`}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div
                        className={cn(
                          "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium",
                          scan.status === "completed" && "bg-success/10 text-success",
                          scan.status === "running" && "bg-primary/10 text-primary",
                          scan.status !== "completed" && scan.status !== "running" && "bg-critical/10 text-critical"
                        )}
                      >
                        {scan.status === "completed" && <CheckCircle className="w-3 h-3" />}
                        {scan.status === "running" && <Radar className="w-3 h-3 animate-spin" />}
                        {scan.status !== "completed" && scan.status !== "running" && <AlertCircle className="w-3 h-3" />}
                        {scan.status}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-mono">{scan.total_apis ?? 0}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Clock className="w-3.5 h-3.5" />
                        {scan.started_at ? new Date(scan.started_at).toLocaleString() : "—"}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-muted-foreground">
                        {scan.ended_at ? new Date(scan.ended_at).toLocaleString() : "—"}
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
