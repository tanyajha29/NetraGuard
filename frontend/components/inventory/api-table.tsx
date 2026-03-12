"use client"

import { useState } from "react"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { RiskBadge } from "@/components/dashboard/risk-badge"
import { cn } from "@/lib/utils"
import { ChevronRight, ArrowUpDown, ExternalLink } from "lucide-react"

export interface ApiEndpoint {
  id: string
  endpoint: string
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
  traffic: number
  status: "active" | "deprecated" | "shadow" | "zombie"
  risk: "critical" | "high" | "medium" | "low" | "safe"
  lastUsed: string
  source: string
}

interface ApiTableProps {
  data: ApiEndpoint[]
  onRowClick?: (api: ApiEndpoint) => void
}

const methodColors = {
  GET: "text-success bg-success/10",
  POST: "text-primary bg-primary/10",
  PUT: "text-warning bg-warning/10",
  DELETE: "text-critical bg-critical/10",
  PATCH: "text-[oklch(0.75_0.15_300)] bg-[oklch(0.75_0.15_300)]/10",
}

export function ApiTable({ data, onRowClick }: ApiTableProps) {
  const [sortField, setSortField] = useState<keyof ApiEndpoint>("traffic")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")

  const sortedData = [...data].sort((a, b) => {
    const aValue = a[sortField]
    const bValue = b[sortField]
    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue
    }
    return sortDirection === "asc"
      ? String(aValue).localeCompare(String(bValue))
      : String(bValue).localeCompare(String(aValue))
  })

  const handleSort = (field: keyof ApiEndpoint) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  return (
    <div className="glass-card rounded-xl border border-border/50 overflow-hidden animate-fade-up">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/50 bg-muted/30">
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Endpoint
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Method
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground transition-colors"
                onClick={() => handleSort("traffic")}
              >
                <div className="flex items-center gap-1">
                  Traffic
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Risk
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground transition-colors"
                onClick={() => handleSort("lastUsed")}
              >
                <div className="flex items-center gap-1">
                  Last Used
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Source
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {sortedData.map((api) => (
              <tr
                key={api.id}
                className="hover:bg-primary/5 transition-colors cursor-pointer group"
                onClick={() => onRowClick?.(api)}
              >
                <td className="px-4 py-3">
                  <code className="text-sm font-mono text-foreground">
                    {api.endpoint}
                  </code>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded text-xs font-medium",
                      methodColors[api.method]
                    )}
                  >
                    {api.method}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm font-mono text-muted-foreground">
                    {api.traffic.toLocaleString()}/hr
                  </span>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={api.status} />
                </td>
                <td className="px-4 py-3">
                  <RiskBadge level={api.risk} />
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-muted-foreground">
                    {api.lastUsed}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-muted-foreground">
                    {api.source}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1.5 rounded hover:bg-muted transition-colors">
                      <ExternalLink className="w-4 h-4 text-muted-foreground" />
                    </button>
                    <button className="p-1.5 rounded hover:bg-muted transition-colors">
                      <ChevronRight className="w-4 h-4 text-primary" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
