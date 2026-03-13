"use client"

import { useEffect, useMemo, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { ApiTable, ApiEndpoint } from "@/components/inventory/api-table"
import { ApiDetailPanel } from "@/components/inventory/api-detail-panel"
import { Search, Filter, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { apiFetch } from "@/lib/api"

export default function InventoryPage() {
  const [selectedApi, setSelectedApi] = useState<ApiEndpoint | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [apiData, setApiData] = useState<ApiEndpoint[]>([])

  useEffect(() => {
    apiFetch<ApiEndpoint[]>("/api/v1/inventory")
      .then((data) =>
        setApiData(
          data.map((item) => ({
            id: String(item.id),
            endpoint: item.path,
            method: item.method,
            traffic: item.traffic_count,
            status: item.current_status as any,
            risk: item.risk_level.toLowerCase() as any,
            lastUsed: item.last_seen_at ?? "Unknown",
            source: item.source_type ?? "scan",
          }))
        )
      )
      .catch(() => setApiData([]))
  }, [])

  const filteredData = useMemo(
    () => apiData.filter((api) => api.endpoint.toLowerCase().includes(searchQuery.toLowerCase())),
    [apiData, searchQuery]
  )

  return (
    <DashboardLayout>
      <div className="space-y-6">
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

        <div className="grid grid-cols-4 gap-4">
          <div className="glass-card rounded-lg p-4 border border-border/50">
            <p className="text-2xl font-bold font-mono text-foreground">{apiData.length}</p>
            <p className="text-sm text-muted-foreground">Total Endpoints</p>
          </div>
          <div className="glass-card rounded-lg p-4 border border-success/30">
            <p className="text-2xl font-bold font-mono text-success">
              {apiData.filter((a) => a.status === "active").length}
            </p>
            <p className="text-sm text-muted-foreground">Active</p>
          </div>
          <div className="glass-card rounded-lg p-4 border border-warning/30">
            <p className="text-2xl font-bold font-mono text-warning">
              {apiData.filter((a) => a.status === "shadow").length}
            </p>
            <p className="text-sm text-muted-foreground">Shadow APIs</p>
          </div>
          <div className="glass-card rounded-lg p-4 border border-critical/30">
            <p className="text-2xl font-bold font-mono text-critical">
              {apiData.filter((a) => a.status === "zombie").length}
            </p>
            <p className="text-sm text-muted-foreground">Zombie APIs</p>
          </div>
        </div>

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

        <ApiTable data={filteredData} onRowClick={setSelectedApi} />
      </div>

      <ApiDetailPanel api={selectedApi} onClose={() => setSelectedApi(null)} />

      {selectedApi && (
        <div
          className="fixed inset-0 bg-background/50 backdrop-blur-sm z-40"
          onClick={() => setSelectedApi(null)}
        />
      )}
    </DashboardLayout>
  )
}
