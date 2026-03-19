"use client"

import { useEffect, useMemo, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { apiFetch } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle, Circle, Clock, AlertTriangle, ArrowRight, User, Calendar, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"

type Task = {
  id: number
  api_asset_id?: number
  api_path?: string
  status: string
  assigned_to?: string
  due_date?: string
  notes?: string
  reason?: string
  created_at?: string
  updated_at?: string
}

export default function RemediationPage() {
  const { toast } = useToast()
  const [tasks, setTasks] = useState<Task[]>([])

  useEffect(() => {
    apiFetch<Task[]>("/api/v1/remediation/tasks")
      .then(setTasks)
      .catch((err: any) => {
        toast({ title: "Failed to load tasks", description: err.message, variant: "destructive" })
        setTasks([])
      })
  }, [toast])

  const grouped = useMemo(() => {
    const byStatus: Record<string, Task[]> = {}
    tasks.forEach((t) => {
      const key = t.status || "open"
      byStatus[key] = byStatus[key] || []
      byStatus[key].push(t)
    })
    return byStatus
  }, [tasks])

  const statusIcon = (status: string) => {
    const s = status.toLowerCase()
    if (s === "completed" || s === "resolved") return <CheckCircle className="w-4 h-4 text-success" />
    if (s === "in-progress" || s === "open") return <Clock className="w-4 h-4 text-warning" />
    return <Circle className="w-4 h-4 text-muted-foreground" />
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Remediation Workflows</h1>
            <p className="text-sm text-muted-foreground mt-1">Track actions for zombie/shadow/high-risk APIs</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {Object.entries(grouped).map(([status, list]) => (
            <div key={status} className="glass-card rounded-xl border border-border/50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {statusIcon(status)}
                  <h3 className="text-sm font-semibold capitalize">{status}</h3>
                </div>
                <span className="text-xs text-muted-foreground">{list.length} tasks</span>
              </div>
              <div className="space-y-3">
                {list.map((t) => (
                  <div
                    key={t.id}
                    className={cn(
                      "rounded-lg border border-border/60 p-3 bg-muted/30",
                      status === "open" && "border-warning/50"
                    )}
                  >
                    <div className="text-sm font-semibold text-foreground">
                      {t.api_path || `API #${t.api_asset_id}`}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{t.reason || t.notes || "Review required"}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
                      {t.assigned_to && (
                        <span className="inline-flex items-center gap-1">
                          <User className="w-3 h-3" /> {t.assigned_to}
                        </span>
                      )}
                      {t.due_date && (
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {new Date(t.due_date).toLocaleDateString()}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" /> {t.notes ? "Notes" : "No notes"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="text-[11px] text-muted-foreground">
                        Created {t.created_at ? new Date(t.created_at).toLocaleDateString() : "—"}
                      </div>
                      <Button size="sm" variant="ghost" className="text-xs">
                        View
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                ))}
                {!list.length && (
                  <div className="text-xs text-muted-foreground border border-border/60 rounded-lg p-3">
                    No tasks in this state
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
