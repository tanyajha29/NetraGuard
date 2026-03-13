"use client"

import { useEffect, useMemo, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { ApiTable, ApiEndpoint } from "@/components/inventory/api-table"
import { ApiDetailPanel } from "@/components/inventory/api-detail-panel"
import { Search, Filter, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { apiFetch } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

type BackendAsset = {
  id: number
  path: string
  method: string
  traffic_count: number
  current_status: string
  risk_level: string
  last_seen_at?: string
  source_type?: string
}

export default function InventoryPage() {
  const [selectedApi, setSelectedApi] = useState<ApiEndpoint | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [data, setData] = useState<ApiEndpoint[]>([])
  const { toast } = useToast()

  useEffect(() => {
    apiFetch<BackendAsset[]>("/api/v1/inventory")
      .then((items) =>
        setData(
          items.map((a) => ({
            id: String(a.id),
            endpoint: a.path,
            method: a.method,
            traffic: a.traffic_count,
            status: a.current_status as any,
            risk: (a.risk_level || "low").toLowerCase() as any,
            lastUsed: a.last_seen_at || "unknown",
            source: a.source_type || "discovery",
          }))
        )
      )
      .catch((err: any) =>
        toast({ title: "Failed to load inventory", description: err.message, variant: "destructive" })
      )
  }, [toast])

  const filteredData = useMemo(
    () => data.filter((api) => api.endpoint.toLowerCase().includes(searchQuery.toLowerCase())),
    [data, searchQuery]
  )

  const stat = (status: string) => filteredData.filter((a) => a.status === status).length

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">API Inventory</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Complete catalog of discovered and monitored API endpoints
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="glass-card rounded-lg p-4 border border-border/50">
            <p className="text-2xl font-bold font-mono text-foreground">{filteredData.length}</p>
            <p className="text-sm text-muted-foreground">Total Endpoints</p>
          </div>
          <div className="glass-card rounded-lg p-4 border border-success/30">
            <p className="text-2xl font-bold font-mono text-success">
              {stat("active")}
            </p>
            <p className="text-sm text-muted-foreground">Active</p>
          </div>
          <div className="glass-card rounded-lg p-4 border border-warning/30">
            <p className="text-2xl font-bold font-mono text-warning">
              {stat("shadow")}
            </p>
            <p className="text-sm text-muted-foreground">Shadow APIs</p>
          </div>
          <div className="glass-card rounded-lg p-4 border border-critical/30">
            <p className="text-2xl font-bold font-mono text-critical">
              {stat("zombie")}
            </p>
            <p className="text-sm text-muted-foreground">Zombie APIs</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search endpoints..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-lg bg-muted/50 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
          />
        </div>

        {/* Table */}
        <ApiTable data={filteredData} onRowClick={setSelectedApi} />
      </div>

      {/* Detail Panel */}
      <ApiDetailPanel api={selectedApi} onClose={() => setSelectedApi(null)} />

      {/* Overlay */}
      {selectedApi && (
        <div
          className="fixed inset-0 bg-background/50 backdrop-blur-sm z-40"
          onClick={() => setSelectedApi(null)}
        />
      )}
    </DashboardLayout>
  )
}
