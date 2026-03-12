"use client"

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

interface Report {
  id: string
  name: string
  description: string
  type: "security" | "compliance" | "inventory" | "analytics"
  format: "PDF" | "JSON" | "CSV"
  lastGenerated: string
  schedule?: string
}

const reports: Report[] = [
  {
    id: "1",
    name: "Weekly Security Summary",
    description: "Overview of security posture, alerts, and remediation progress",
    type: "security",
    format: "PDF",
    lastGenerated: "Mar 10, 2026",
    schedule: "Every Monday",
  },
  {
    id: "2",
    name: "API Inventory Report",
    description: "Complete catalog of all discovered APIs with status and risk levels",
    type: "inventory",
    format: "CSV",
    lastGenerated: "Mar 12, 2026",
  },
  {
    id: "3",
    name: "Zombie API Analysis",
    description: "Detailed analysis of inactive and deprecated endpoints",
    type: "security",
    format: "PDF",
    lastGenerated: "Mar 11, 2026",
    schedule: "Monthly",
  },
  {
    id: "4",
    name: "Compliance Audit",
    description: "Security compliance status against industry standards",
    type: "compliance",
    format: "PDF",
    lastGenerated: "Mar 1, 2026",
    schedule: "Monthly",
  },
  {
    id: "5",
    name: "Traffic Analytics",
    description: "API traffic patterns, trends, and anomaly detection",
    type: "analytics",
    format: "JSON",
    lastGenerated: "Mar 12, 2026",
  },
  {
    id: "6",
    name: "Risk Assessment Report",
    description: "Comprehensive risk scoring and vulnerability assessment",
    type: "security",
    format: "PDF",
    lastGenerated: "Mar 8, 2026",
  },
]

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
            <p className="text-2xl font-bold font-mono text-foreground">24</p>
            <p className="text-sm text-muted-foreground">Generated This Month</p>
          </div>
          <div className="glass-card rounded-xl p-4 border border-border/50">
            <p className="text-2xl font-bold font-mono text-foreground">12</p>
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
                  <Button
                    variant="outline"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </DashboardLayout>
  )
}
