import { cn } from "@/lib/utils"

type RiskLevel = "critical" | "high" | "medium" | "low" | "safe"

interface RiskBadgeProps {
  level: RiskLevel
  className?: string
}

export function RiskBadge({ level, className }: RiskBadgeProps) {
  const config = {
    critical: {
      label: "Critical",
      bgColor: "bg-critical/20",
      textColor: "text-critical",
      borderColor: "border-critical/30",
    },
    high: {
      label: "High",
      bgColor: "bg-critical/15",
      textColor: "text-critical",
      borderColor: "border-critical/20",
    },
    medium: {
      label: "Medium",
      bgColor: "bg-warning/15",
      textColor: "text-warning",
      borderColor: "border-warning/30",
    },
    low: {
      label: "Low",
      bgColor: "bg-primary/15",
      textColor: "text-primary",
      borderColor: "border-primary/30",
    },
    safe: {
      label: "Safe",
      bgColor: "bg-success/15",
      textColor: "text-success",
      borderColor: "border-success/30",
    },
  }

  const { label, bgColor, textColor, borderColor } = config[level]

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border",
        bgColor,
        textColor,
        borderColor,
        className
      )}
    >
      {label}
    </span>
  )
}
