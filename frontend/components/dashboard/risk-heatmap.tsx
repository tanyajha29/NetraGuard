"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

interface HeatmapCell {
  id: string
  name: string
  risk: number // 0-100
  category: string
}

function getRiskColor(risk: number): string {
  if (risk <= 25) return "bg-success"
  if (risk <= 50) return "bg-[oklch(0.70_0.16_85)]"
  if (risk <= 75) return "bg-warning"
  return "bg-critical"
}

function getRiskLabel(risk: number): string {
  if (risk <= 25) return "Safe"
  if (risk <= 50) return "Medium"
  if (risk <= 75) return "High"
  return "Critical"
}

export function RiskHeatmap({ data }: { data?: HeatmapCell[] }) {
  const [hoveredCell, setHoveredCell] = useState<HeatmapCell | null>(null)
  const heatmapData =
    data && data.length
      ? data
      : [
          { id: "1", name: "/api/users", risk: 15, category: "Auth" },
          { id: "2", name: "/api/payments", risk: 85, category: "Finance" },
          { id: "3", name: "/api/orders", risk: 45, category: "Commerce" },
          { id: "4", name: "/api/products", risk: 20, category: "Commerce" },
          { id: "5", name: "/api/auth/login", risk: 30, category: "Auth" },
          { id: "6", name: "/api/admin", risk: 95, category: "Admin" },
          { id: "7", name: "/api/reports", risk: 55, category: "Analytics" },
          { id: "8", name: "/api/webhooks", risk: 70, category: "Integration" },
          { id: "9", name: "/api/files", risk: 60, category: "Storage" },
          { id: "10", name: "/api/search", risk: 25, category: "Search" },
          { id: "11", name: "/api/notifications", risk: 35, category: "Messaging" },
          { id: "12", name: "/api/analytics", risk: 40, category: "Analytics" },
          { id: "13", name: "/api/legacy/v1", risk: 90, category: "Legacy" },
          { id: "14", name: "/api/internal", risk: 75, category: "Internal" },
          { id: "15", name: "/api/health", risk: 5, category: "System" },
          { id: "16", name: "/api/config", risk: 80, category: "System" },
          { id: "17", name: "/api/export", risk: 65, category: "Data" },
          { id: "18", name: "/api/import", risk: 50, category: "Data" },
          { id: "19", name: "/api/backup", risk: 35, category: "System" },
          { id: "20", name: "/api/logs", risk: 45, category: "Monitoring" },
        ]

  return (
    <div className="glass-card rounded-xl p-5 border border-border/50 animate-fade-up">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-medium text-foreground">API Risk Heatmap</h3>
          <p className="text-xs text-muted-foreground">Risk levels across endpoints</p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-success" />
            <span className="text-muted-foreground">Safe</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-warning" />
            <span className="text-muted-foreground">Medium</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-critical" />
            <span className="text-muted-foreground">Critical</span>
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="grid grid-cols-5 gap-1.5">
          {heatmapData.map((cell) => (
            <div
              key={cell.id}
              className={cn(
                "relative h-10 rounded cursor-pointer transition-all duration-200 hover:scale-105 hover:z-10",
                getRiskColor(cell.risk),
                cell.risk > 75 && "glow-critical",
                cell.risk > 50 && cell.risk <= 75 && "glow-warning"
              )}
              style={{ opacity: 0.6 + (cell.risk / 100) * 0.4 }}
              onMouseEnter={() => setHoveredCell(cell)}
              onMouseLeave={() => setHoveredCell(null)}
            />
          ))}
        </div>

        {hoveredCell && (
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 z-20 glass rounded-lg p-3 min-w-[200px] animate-fade-up">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-foreground">{hoveredCell.category}</span>
              <span
                className={cn(
                  "text-xs font-medium px-1.5 py-0.5 rounded",
                  hoveredCell.risk > 75
                    ? "bg-critical/20 text-critical"
                    : hoveredCell.risk > 50
                    ? "bg-warning/20 text-warning"
                    : "bg-success/20 text-success"
                )}
              >
                {getRiskLabel(hoveredCell.risk)}
              </span>
            </div>
            <code className="text-xs font-mono text-primary block mb-1">
              {hoveredCell.name}
            </code>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all", getRiskColor(hoveredCell.risk))}
                  style={{ width: `${hoveredCell.risk}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground font-mono">{hoveredCell.risk}%</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
