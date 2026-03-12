"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface MetricCardProps {
  title: string
  value: number
  icon: React.ReactNode
  trend?: {
    value: number
    direction: "up" | "down" | "neutral"
  }
  variant?: "default" | "warning" | "critical" | "success"
  className?: string
}

export function MetricCard({
  title,
  value,
  icon,
  trend,
  variant = "default",
  className,
}: MetricCardProps) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    const duration = 1000
    const steps = 30
    const increment = value / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= value) {
        setDisplayValue(value)
        clearInterval(timer)
      } else {
        setDisplayValue(Math.floor(current))
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [value])

  const variantStyles = {
    default: "border-border/50 hover:border-primary/50",
    warning: "border-warning/30 hover:border-warning/50",
    critical: "border-critical/30 hover:border-critical/50",
    success: "border-success/30 hover:border-success/50",
  }

  const iconStyles = {
    default: "text-primary bg-primary/10",
    warning: "text-warning bg-warning/10",
    critical: "text-critical bg-critical/10",
    success: "text-success bg-success/10",
  }

  return (
    <div
      className={cn(
        "glass-card rounded-xl p-5 border transition-all duration-300 hover:scale-[1.02] animate-fade-up",
        variantStyles[variant],
        className
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className={cn(
            "p-2.5 rounded-lg",
            iconStyles[variant]
          )}
        >
          {icon}
        </div>
        {trend && (
          <div
            className={cn(
              "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
              trend.direction === "up" && "text-success bg-success/10",
              trend.direction === "down" && "text-critical bg-critical/10",
              trend.direction === "neutral" && "text-muted-foreground bg-muted"
            )}
          >
            {trend.direction === "up" && <TrendingUp className="w-3 h-3" />}
            {trend.direction === "down" && <TrendingDown className="w-3 h-3" />}
            {trend.direction === "neutral" && <Minus className="w-3 h-3" />}
            {trend.value}%
          </div>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-muted-foreground text-sm">{title}</p>
        <p className="text-3xl font-bold text-foreground font-mono animate-count-up">
          {displayValue.toLocaleString()}
        </p>
      </div>
    </div>
  )
}
