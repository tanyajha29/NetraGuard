"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  FileText,
  Download,
  Calendar,
  Clock,
  BarChart3,
  Shield,
  TrendingUp,
  FileJson,
  File,
  Mail,
} from "lucide-react"
import { apiFetch, API_URL } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface Report {
  id: string
  name: string
  description: string
  type: "security" | "compliance" | "inventory" | "analytics"
  format: "PDF" | "JSON" | "CSV"
  lastGenerated: string
  schedule?: string
}

const typeConfig = {
  security: { icon: Shield, color: "text-critical", bg: "bg-critical/10" },
  compliance: { icon: FileText, color: "text-primary", bg: "bg-primary/10" },
  inventory: { icon: BarChart3, color: "text-success", bg: "bg-success/10" },
  analytics: { icon: TrendingUp, color: "text-warning", bg: "bg-warning/10" },
}

const formatConfig = {
  PDF: { icon: File, color: "text-critical" },
  JSON: { icon: FileJson, color: "text-warning" },
  CSV: { icon: FileText, color: "text-success" },
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([])
  const { toast } = useToast()

  useEffect(() => {
    apiFetch<any[]>("/api/v1/reports")
      .then((list) =>
        setReports(
          list.map((r) => ({
            id: String(r.id),
            name: `Report #${r.id}`,
            description: r.summary || "Automated scan report",
            type: "security",
            format: (r.format || "html").toUpperCase() as Report["format"],
            lastGenerated: new Date(r.generated_at || r.created_at || Date.now()).toLocaleDateString(),
            schedule: undefined,
            target_id: r.target_id,
          })) as any
        )
      )
      .catch((err: any) =>
        toast({ title: "Failed to load reports", description: err.message, variant: "destructive" })
      )
  }, [toast])

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Reports</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Generate and schedule security and compliance reports
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Mail className="w-4 h-4 mr-2" />
              Schedule Delivery
            </Button>
            <Button className="bg-primary hover:bg-primary/90">
              <FileText className="w-4 h-4 mr-2" />
              Generate Report
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="glass-card rounded-xl p-4 border border-border/50">
            <p className="text-2xl font-bold font-mono text-foreground">{reports.length}</p>
            <p className="text-sm text-muted-foreground">Available Reports</p>
          </div>
          <div className="glass-card rounded-xl p-4 border border-border/50">
            <p className="text-2xl font-bold font-mono text-foreground">
              {reports.filter((r) => r.schedule).length}
            </p>
            <p className="text-sm text-muted-foreground">Scheduled</p>
          </div>
          <div className="glass-card rounded-xl p-4 border border-border/50">
            <p className="text-2xl font-bold font-mono text-foreground">—</p>
            <p className="text-sm text-muted-foreground">Generated This Month</p>
          </div>
          <div className="glass-card rounded-xl p-4 border border-border/50">
            <p className="text-2xl font-bold font-mono text-foreground">—</p>
            <p className="text-sm text-muted-foreground">Email Recipients</p>
          </div>
        </div>

        {/* Reports Grid */}
        <div className="grid grid-cols-2 gap-4">
          {reports.map((report) => {
            const typeC = typeConfig[report.type]
            const formatC = formatConfig[report.format]
            const TypeIcon = typeC.icon
            const FormatIcon = formatC.icon

            return (
              <div
                key={report.id}
                className="glass-card rounded-xl p-5 border border-border/50 hover:border-primary/30 transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={cn("p-2.5 rounded-lg", typeC.bg)}>
                    <TypeIcon className={cn("w-5 h-5", typeC.color)} />
                  </div>
                  <div className="flex items-center gap-2">
                    <FormatIcon className={cn("w-4 h-4", formatC.color)} />
                    <span className="text-xs font-medium text-muted-foreground">
                      {report.format}
                    </span>
                  </div>
                </div>

                <h3 className="text-base font-medium text-foreground mb-1">
                  {report.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {report.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {report.lastGenerated}
                    </span>
                    {report.schedule && (
                      <span className="flex items-center gap-1 text-primary">
                        <Calendar className="w-3.5 h-3.5" />
                        {report.schedule}
                      </span>
                    )}
                  </div>
                  <a
                    className="opacity-0 group-hover:opacity-100 transition-opacity inline-flex"
                    href={`${API_URL}/api/v1/reports/${report.id}/download`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Button
                      variant="outline"
                      size="sm"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                  </a>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </DashboardLayout>
  )
}
