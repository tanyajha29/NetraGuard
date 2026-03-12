import { cn } from "@/lib/utils"

type StatusType = "active" | "deprecated" | "shadow" | "zombie"

interface StatusBadgeProps {
  status: StatusType
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = {
    active: {
      label: "Active",
      dotColor: "bg-success",
      textColor: "text-success",
      bgColor: "bg-success/10",
    },
    deprecated: {
      label: "Deprecated",
      dotColor: "bg-warning",
      textColor: "text-warning",
      bgColor: "bg-warning/10",
    },
    shadow: {
      label: "Shadow",
      dotColor: "bg-[oklch(0.75_0.15_50)]",
      textColor: "text-[oklch(0.75_0.15_50)]",
      bgColor: "bg-[oklch(0.75_0.15_50)]/10",
    },
    zombie: {
      label: "Zombie",
      dotColor: "bg-critical",
      textColor: "text-critical",
      bgColor: "bg-critical/10",
    },
  }

  const { label, dotColor, textColor, bgColor } = config[status]

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
        bgColor,
        textColor,
        className
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", dotColor)} />
      {label}
    </span>
  )
}
