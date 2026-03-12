"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { ApiTable, ApiEndpoint } from "@/components/inventory/api-table"
import { ApiDetailPanel } from "@/components/inventory/api-detail-panel"
import { Search, Filter, Download } from "lucide-react"
import { Button } from "@/components/ui/button"

const apiData: ApiEndpoint[] = [
  { id: "1", endpoint: "/api/v2/users", method: "GET", traffic: 15420, status: "active", risk: "safe", lastUsed: "Just now", source: "Gateway" },
  { id: "2", endpoint: "/api/v2/users/:id", method: "GET", traffic: 8230, status: "active", risk: "low", lastUsed: "2 min ago", source: "Gateway" },
  { id: "3", endpoint: "/api/v1/payments/process", method: "POST", traffic: 3450, status: "active", risk: "medium", lastUsed: "5 min ago", source: "Gateway" },
  { id: "4", endpoint: "/api/v1/payments/legacy", method: "POST", traffic: 12, status: "zombie", risk: "critical", lastUsed: "94 days ago", source: "Discovery" },
  { id: "5", endpoint: "/api/internal/debug", method: "GET", traffic: 0, status: "shadow", risk: "critical", lastUsed: "Never", source: "Scan" },
  { id: "6", endpoint: "/api/v2/orders", method: "GET", traffic: 6780, status: "active", risk: "safe", lastUsed: "Just now", source: "Gateway" },
  { id: "7", endpoint: "/api/v2/orders", method: "POST", traffic: 2340, status: "active", risk: "low", lastUsed: "1 min ago", source: "Gateway" },
  { id: "8", endpoint: "/api/v1/auth/login", method: "POST", traffic: 4560, status: "deprecated", risk: "medium", lastUsed: "10 min ago", source: "Gateway" },
  { id: "9", endpoint: "/api/v2/auth/login", method: "POST", traffic: 12400, status: "active", risk: "safe", lastUsed: "Just now", source: "Gateway" },
  { id: "10", endpoint: "/api/admin/users", method: "DELETE", traffic: 45, status: "active", risk: "high", lastUsed: "1 hour ago", source: "Gateway" },
  { id: "11", endpoint: "/api/v1/reports/export", method: "GET", traffic: 890, status: "deprecated", risk: "medium", lastUsed: "2 hours ago", source: "Gateway" },
  { id: "12", endpoint: "/api/webhooks/stripe", method: "POST", traffic: 1230, status: "active", risk: "low", lastUsed: "30 sec ago", source: "Gateway" },
  { id: "13", endpoint: "/api/internal/metrics", method: "GET", traffic: 5, status: "shadow", risk: "high", lastUsed: "Unknown", source: "Scan" },
  { id: "14", endpoint: "/api/v0/legacy/search", method: "GET", traffic: 3, status: "zombie", risk: "critical", lastUsed: "120 days ago", source: "Discovery" },
  { id: "15", endpoint: "/api/v2/products", method: "GET", traffic: 9870, status: "active", risk: "safe", lastUsed: "Just now", source: "Gateway" },
]

export default function InventoryPage() {
  const [selectedApi, setSelectedApi] = useState<ApiEndpoint | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const filteredData = apiData.filter((api) =>
    api.endpoint.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
