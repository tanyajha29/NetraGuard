"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { apiFetch } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type Node = { id: number; label: string; risk?: string; status?: string; traffic?: number }
type Edge = { source: number; target: number }

export default function GraphPage() {
  const { toast } = useToast()
  const [nodes, setNodes] = useState<Node[]>([])
  const [edges, setEdges] = useState<Edge[]>([])

  useEffect(() => {
    apiFetch<{ nodes: Node[]; edges: Edge[] }>("/api/v1/graph/dependencies")
      .then((data) => {
        setNodes(data?.nodes || [])
        setEdges(data?.edges || [])
      })
      .catch((err: any) => toast({ title: "Failed to load dependency graph", description: err.message, variant: "destructive" }))
  }, [toast])

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">API Dependency Graph</h1>
            <p className="text-sm text-muted-foreground mt-1">Live graph derived from scan dependency edges</p>
          </div>
        </div>

        <Card className="glass-card border border-border/60">
          <CardHeader>
            <CardTitle>Nodes</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {nodes.map((n) => (
              <div key={n.id} className="border border-border/60 rounded-lg p-3">
                <div className="text-sm font-semibold">{n.label}</div>
                <div className="text-xs text-muted-foreground">
                  Risk: {n.risk || "unknown"} • Status: {n.status || "unknown"} • Traffic: {n.traffic ?? 0}
                </div>
              </div>
            ))}
            {!nodes.length && <p className="text-sm text-muted-foreground">No nodes yet. Run a scan first.</p>}
          </CardContent>
        </Card>

        <Card className="glass-card border border-border/60">
          <CardHeader>
            <CardTitle>Edges</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {edges.map((e, idx) => (
              <div key={idx} className="text-sm text-muted-foreground">
                {e.source} → {e.target}
              </div>
            ))}
            {!edges.length && <p className="text-sm text-muted-foreground">No edges recorded yet.</p>}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
