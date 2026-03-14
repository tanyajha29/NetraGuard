"use client"

import { cn } from "@/lib/utils"
import { AlertTriangle, AlertCircle, Info, ChevronRight } from "lucide-react"

type AlertSeverity = "critical" | "warning" | "info"

interface AlertCardProps {
  title: string
  description: string
  endpoint: string
  timestamp: string
  severity: AlertSeverity | string
  action?: string
  className?: string
}

export function AlertCard({
  title,
  description,
  endpoint,
  timestamp,
  severity,
  action,
  className,
}: AlertCardProps) {
  const severityConfig: Record<string, { icon: any; bgColor: string; borderColor: string; iconColor: string; glowClass: string }> = {
    critical: {
      icon: AlertCircle,
      bgColor: "bg-critical/10",
      borderColor: "border-critical/30",
      iconColor: "text-critical",
      glowClass: "glow-critical",
    },
    warning: {
      icon: AlertTriangle,
      bgColor: "bg-warning/10",
      borderColor: "border-warning/30",
      iconColor: "text-warning",
      glowClass: "glow-warning",
    },
    info: {
      icon: Info,
      bgColor: "bg-primary/10",
      borderColor: "border-primary/30",
      iconColor: "text-primary",
      glowClass: "glow-cyan-sm",
    },
  }

  const key = (severity || "info").toString().toLowerCase()
  const config = severityConfig[key] || severityConfig.info
  const Icon = config.icon

  return (
    <div
      className={cn(
        "glass-card rounded-lg p-4 border transition-all duration-300 hover:scale-[1.01] animate-slide-in-right cursor-pointer group",
        config.borderColor,
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "p-2 rounded-lg flex-shrink-0",
            config.bgColor,
            config.glowClass
          )}
        >
          <Icon className={cn("w-4 h-4", config.iconColor)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-sm font-medium text-foreground truncate">
              {title}
            </h4>
            <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
              {timestamp}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
            {description}
          </p>
          <div className="flex items-center justify-between">
            <code className="text-xs font-mono text-primary/80 bg-primary/5 px-2 py-0.5 rounded truncate max-w-[200px]">
              {endpoint}
            </code>
            {action && (
              <button className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors opacity-0 group-hover:opacity-100">
                {action}
                <ChevronRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
