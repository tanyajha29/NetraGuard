"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  CheckCircle,
  Circle,
  Clock,
  AlertTriangle,
  ArrowRight,
  User,
  Calendar,
  MessageSquare,
  ChevronDown,
  Play,
  Pause,
} from "lucide-react"

interface WorkflowStep {
  id: string
  name: string
  status: "completed" | "in-progress" | "pending" | "blocked"
  assignee?: string
  completedAt?: string
}

interface Workflow {
  id: string
  title: string
  endpoint: string
  priority: "critical" | "high" | "medium"
  createdAt: string
  steps: WorkflowStep[]
  comments: number
}

const workflows: Workflow[] = [
  {
    id: "1",
    title: "Decommission Legacy Payment API",
    endpoint: "/api/v1/payments/legacy",
    priority: "critical",
    createdAt: "Mar 10, 2026",
    comments: 8,
    steps: [
      { id: "1a", name: "Zombie Detected", status: "completed", completedAt: "Mar 10" },
      { id: "1b", name: "Impact Analysis", status: "completed", assignee: "Sarah Chen", completedAt: "Mar 11" },
      { id: "1c", name: "Stakeholder Review", status: "in-progress", assignee: "Mike Johnson" },
      { id: "1d", name: "Deprecation Notice", status: "pending" },
      { id: "1e", name: "Traffic Redirect", status: "pending" },
      { id: "1f", name: "Decommission", status: "pending" },
    ],
  },
  {
    id: "2",
    title: "Secure Debug Endpoint",
    endpoint: "/api/internal/debug",
    priority: "critical",
    createdAt: "Mar 11, 2026",
    comments: 5,
    steps: [
      { id: "2a", name: "Shadow API Detected", status: "completed", completedAt: "Mar 11" },
      { id: "2b", name: "Security Assessment", status: "completed", assignee: "Alex Kim", completedAt: "Mar 11" },
      { id: "2c", name: "Access Restriction", status: "in-progress", assignee: "DevOps Team" },
      { id: "2d", name: "Documentation", status: "pending" },
      { id: "2e", name: "Monitoring Setup", status: "pending" },
    ],
  },
  {
    id: "3",
    title: "Add Rate Limiting to Export API",
    endpoint: "/api/users/export",
    priority: "high",
    createdAt: "Mar 9, 2026",
    comments: 3,
    steps: [
      { id: "3a", name: "Issue Identified", status: "completed", completedAt: "Mar 9" },
      { id: "3b", name: "Solution Design", status: "completed", assignee: "Tech Lead", completedAt: "Mar 10" },
      { id: "3c", name: "Implementation", status: "blocked", assignee: "Backend Team" },
      { id: "3d", name: "Testing", status: "pending" },
      { id: "3e", name: "Deployment", status: "pending" },
    ],
  },
  {
    id: "4",
    title: "Migrate v1 Auth Endpoints",
    endpoint: "/api/v1/auth/*",
    priority: "medium",
    createdAt: "Mar 8, 2026",
    comments: 12,
    steps: [
      { id: "4a", name: "Deprecation Notice", status: "completed", completedAt: "Mar 8" },
      { id: "4b", name: "Client Notification", status: "completed", completedAt: "Mar 9" },
      { id: "4c", name: "Traffic Analysis", status: "completed", assignee: "Analytics", completedAt: "Mar 10" },
      { id: "4d", name: "Migration Guide", status: "completed", assignee: "Docs Team", completedAt: "Mar 11" },
      { id: "4e", name: "Sunset Period", status: "in-progress" },
      { id: "4f", name: "Final Decommission", status: "pending" },
    ],
  },
]

const priorityConfig = {
  critical: { bg: "bg-critical/10", text: "text-critical", border: "border-critical/30" },
  high: { bg: "bg-warning/10", text: "text-warning", border: "border-warning/30" },
  medium: { bg: "bg-primary/10", text: "text-primary", border: "border-primary/30" },
}

const statusConfig = {
  completed: { icon: CheckCircle, color: "text-success", bg: "bg-success" },
  "in-progress": { icon: Clock, color: "text-primary", bg: "bg-primary" },
  pending: { icon: Circle, color: "text-muted-foreground", bg: "bg-muted" },
  blocked: { icon: AlertTriangle, color: "text-critical", bg: "bg-critical" },
}

export default function RemediationPage() {
  const getProgress = (workflow: Workflow) => {
    const completed = workflow.steps.filter((s) => s.status === "completed").length
    return Math.round((completed / workflow.steps.length) * 100)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Remediation Workflows</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Track and manage API security remediation tasks
            </p>
          </div>
          <Button className="bg-primary hover:bg-primary/90">
            <Play className="w-4 h-4 mr-2" />
            New Workflow
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="glass-card rounded-xl p-4 border border-border/50">
            <p className="text-2xl font-bold font-mono text-foreground">{workflows.length}</p>
            <p className="text-sm text-muted-foreground">Active Workflows</p>
          </div>
          <div className="glass-card rounded-xl p-4 border border-critical/30">
            <p className="text-2xl font-bold font-mono text-critical">
              {workflows.filter((w) => w.priority === "critical").length}
            </p>
            <p className="text-sm text-muted-foreground">Critical Priority</p>
          </div>
          <div className="glass-card rounded-xl p-4 border border-warning/30">
            <p className="text-2xl font-bold font-mono text-warning">
              {workflows.reduce((acc, w) => acc + w.steps.filter((s) => s.status === "blocked").length, 0)}
            </p>
            <p className="text-sm text-muted-foreground">Blocked Steps</p>
          </div>
          <div className="glass-card rounded-xl p-4 border border-success/30">
            <p className="text-2xl font-bold font-mono text-success">
              {workflows.reduce((acc, w) => acc + w.steps.filter((s) => s.status === "completed").length, 0)}
            </p>
            <p className="text-sm text-muted-foreground">Completed Steps</p>
          </div>
        </div>

        {/* Workflows */}
        <div className="space-y-4">
          {workflows.map((workflow) => {
            const config = priorityConfig[workflow.priority]
            const progress = getProgress(workflow)

            return (
              <div
                key={workflow.id}
                className={cn(
                  "glass-card rounded-xl border overflow-hidden transition-all hover:scale-[1.005]",
                  config.border
                )}
              >
                {/* Workflow Header */}
                <div className="p-4 border-b border-border/30">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-base font-medium text-foreground">
                          {workflow.title}
                        </h3>
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded text-xs font-medium capitalize",
                            config.bg,
                            config.text
                          )}
                        >
                          {workflow.priority}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <code className="font-mono text-primary bg-primary/5 px-2 py-0.5 rounded">
                          {workflow.endpoint}
                        </code>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {workflow.createdAt}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3.5 h-3.5" />
                          {workflow.comments} comments
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-lg font-bold font-mono text-foreground">{progress}%</p>
                        <p className="text-xs text-muted-foreground">Complete</p>
                      </div>
                      <Button variant="outline" size="sm">
                        <ChevronDown className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Steps */}
                <div className="p-4 bg-muted/10">
                  <div className="flex items-center gap-2 overflow-x-auto pb-2">
                    {workflow.steps.map((step, index) => {
                      const stepConfig = statusConfig[step.status]
                      const Icon = stepConfig.icon

                      return (
                        <div key={step.id} className="flex items-center flex-shrink-0">
                          <div
                            className={cn(
                              "flex items-center gap-2 px-3 py-2 rounded-lg border transition-all",
                              step.status === "completed" && "bg-success/5 border-success/20",
                              step.status === "in-progress" && "bg-primary/5 border-primary/20 glow-cyan-sm",
                              step.status === "pending" && "bg-muted/30 border-border/50",
                              step.status === "blocked" && "bg-critical/5 border-critical/20"
                            )}
                          >
                            <Icon className={cn("w-4 h-4", stepConfig.color)} />
                            <div>
                              <p className="text-sm font-medium text-foreground whitespace-nowrap">
                                {step.name}
                              </p>
                              {step.assignee && (
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                  <User className="w-3 h-3" />
                                  {step.assignee}
                                </p>
                              )}
                            </div>
                          </div>
                          {index < workflow.steps.length - 1 && (
                            <ArrowRight className="w-4 h-4 mx-2 text-muted-foreground flex-shrink-0" />
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </DashboardLayout>
  )
}
