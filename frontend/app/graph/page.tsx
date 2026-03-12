"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Filter,
  Download,
  RefreshCw,
} from "lucide-react"

interface Node {
  id: string
  name: string
  type: "active" | "deprecated" | "shadow" | "zombie"
  x: number
  y: number
  vx: number
  vy: number
  connections: string[]
}

const initialNodes: Omit<Node, "x" | "y" | "vx" | "vy">[] = [
  { id: "1", name: "/api/users", type: "active", connections: ["2", "3", "5"] },
  { id: "2", name: "/api/auth", type: "active", connections: ["1", "4"] },
  { id: "3", name: "/api/orders", type: "active", connections: ["1", "6", "7"] },
  { id: "4", name: "/api/sessions", type: "active", connections: ["2"] },
  { id: "5", name: "/api/profiles", type: "deprecated", connections: ["1"] },
  { id: "6", name: "/api/payments", type: "active", connections: ["3", "8"] },
  { id: "7", name: "/api/products", type: "active", connections: ["3", "9"] },
  { id: "8", name: "/api/v1/payments", type: "zombie", connections: ["6"] },
  { id: "9", name: "/api/inventory", type: "active", connections: ["7"] },
  { id: "10", name: "/api/debug", type: "shadow", connections: [] },
  { id: "11", name: "/api/legacy", type: "zombie", connections: [] },
  { id: "12", name: "/api/analytics", type: "active", connections: ["1", "3"] },
  { id: "13", name: "/api/reports", type: "deprecated", connections: ["12"] },
  { id: "14", name: "/api/webhooks", type: "active", connections: ["3", "6"] },
  { id: "15", name: "/api/notifications", type: "active", connections: ["1", "14"] },
]

const nodeColors = {
  active: { fill: "oklch(0.68 0.17 145)", stroke: "oklch(0.78 0.17 145)" },
  deprecated: { fill: "oklch(0.78 0.16 75)", stroke: "oklch(0.88 0.16 75)" },
  shadow: { fill: "oklch(0.75 0.15 50)", stroke: "oklch(0.85 0.15 50)" },
  zombie: { fill: "oklch(0.62 0.22 25)", stroke: "oklch(0.72 0.22 25)" },
}

export default function GraphPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [nodes, setNodes] = useState<Node[]>([])
  const [hoveredNode, setHoveredNode] = useState<Node | null>(null)
  const [zoom, setZoom] = useState(1)
  const [selectedFilter, setSelectedFilter] = useState<string>("all")
  const animationRef = useRef<number>()

  // Initialize nodes with random positions
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const width = canvas.offsetWidth
    const height = canvas.offsetHeight

    const initializedNodes: Node[] = initialNodes.map((node) => ({
      ...node,
      x: Math.random() * (width - 100) + 50,
      y: Math.random() * (height - 100) + 50,
      vx: 0,
      vy: 0,
    }))

    setNodes(initializedNodes)
  }, [])

  // Force-directed simulation
  const simulate = useCallback(() => {
    setNodes((prevNodes) => {
      const newNodes = prevNodes.map((node) => ({ ...node }))

      // Apply forces
      for (let i = 0; i < newNodes.length; i++) {
        const node = newNodes[i]

        // Repulsion between all nodes
        for (let j = 0; j < newNodes.length; j++) {
          if (i === j) continue
          const other = newNodes[j]
          const dx = node.x - other.x
          const dy = node.y - other.y
          const dist = Math.sqrt(dx * dx + dy * dy) || 1
          const force = 2000 / (dist * dist)
          node.vx += (dx / dist) * force
          node.vy += (dy / dist) * force
        }

        // Attraction to connected nodes
        for (const connId of node.connections) {
          const conn = newNodes.find((n) => n.id === connId)
          if (!conn) continue
          const dx = conn.x - node.x
          const dy = conn.y - node.y
          const dist = Math.sqrt(dx * dx + dy * dy) || 1
          const force = (dist - 150) * 0.01
          node.vx += (dx / dist) * force
          node.vy += (dy / dist) * force
        }

        // Center gravity
        const canvasEl = canvasRef.current
        if (canvasEl) {
          const centerX = canvasEl.offsetWidth / 2
          const centerY = canvasEl.offsetHeight / 2
          node.vx += (centerX - node.x) * 0.0005
          node.vy += (centerY - node.y) * 0.0005
        }

        // Apply velocity with damping
        node.vx *= 0.9
        node.vy *= 0.9
        node.x += node.vx
        node.y += node.vy

        // Boundaries
        const canvasBounds = canvasRef.current
        if (canvasBounds) {
          node.x = Math.max(30, Math.min(canvasBounds.offsetWidth - 30, node.x))
          node.y = Math.max(30, Math.min(canvasBounds.offsetHeight - 30, node.y))
        }
      }

      return newNodes
    })
  }, [])

  // Animation loop
  useEffect(() => {
    const animate = () => {
      simulate()
      animationRef.current = requestAnimationFrame(animate)
    }
    animate()
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [simulate])

  // Draw canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = canvas.offsetWidth * dpr
    canvas.height = canvas.offsetHeight * dpr
    ctx.scale(dpr, dpr)

    // Clear
    ctx.fillStyle = "oklch(0.12 0.02 260)"
    ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)

    const filteredNodes = selectedFilter === "all"
      ? nodes
      : nodes.filter((n) => n.type === selectedFilter)

    // Draw edges
    ctx.strokeStyle = "oklch(0.30 0.02 260)"
    ctx.lineWidth = 1
    for (const node of filteredNodes) {
      for (const connId of node.connections) {
        const conn = filteredNodes.find((n) => n.id === connId)
        if (!conn) continue
        ctx.beginPath()
        ctx.moveTo(node.x * zoom, node.y * zoom)
        ctx.lineTo(conn.x * zoom, conn.y * zoom)
        ctx.stroke()
      }
    }

    // Draw nodes
    for (const node of filteredNodes) {
      const colors = nodeColors[node.type]
      const isHovered = hoveredNode?.id === node.id
      const radius = isHovered ? 14 : 10

      // Glow for zombie/shadow
      if (node.type === "zombie" || node.type === "shadow") {
        ctx.shadowColor = colors.fill
        ctx.shadowBlur = 15
      }

      ctx.beginPath()
      ctx.arc(node.x * zoom, node.y * zoom, radius, 0, Math.PI * 2)
      ctx.fillStyle = colors.fill
      ctx.fill()
      ctx.strokeStyle = colors.stroke
      ctx.lineWidth = 2
      ctx.stroke()

      ctx.shadowBlur = 0

      // Label on hover
      if (isHovered) {
        ctx.font = "11px Inter, sans-serif"
        ctx.fillStyle = "oklch(0.93 0.01 240)"
        ctx.textAlign = "center"
        ctx.fillText(node.name, node.x * zoom, node.y * zoom - 20)
      }
    }
  }, [nodes, hoveredNode, zoom, selectedFilter])

  // Mouse hover detection
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX - rect.left) / zoom
    const y = (e.clientY - rect.top) / zoom

    const filteredNodes = selectedFilter === "all"
      ? nodes
      : nodes.filter((n) => n.type === selectedFilter)

    const hovered = filteredNodes.find((node) => {
      const dx = node.x - x
      const dy = node.y - y
      return Math.sqrt(dx * dx + dy * dy) < 15
    })

    setHoveredNode(hovered || null)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between flex-shrink-0">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">API Dependency Graph</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Visual map of API relationships and dependencies
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setZoom((z) => Math.min(z + 0.2, 2))}>
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setZoom((z) => Math.max(z - 0.2, 0.5))}>
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setZoom(1)}>
              <Maximize2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Legend & Filters */}
        <div className="flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-6">
            {Object.entries(nodeColors).map(([type, colors]) => (
              <button
                key={type}
                onClick={() => setSelectedFilter(selectedFilter === type ? "all" : type)}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors",
                  selectedFilter === type
                    ? "bg-primary/20"
                    : "hover:bg-muted/50"
                )}
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: colors.fill }}
                />
                <span className="text-sm text-muted-foreground capitalize">{type}</span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{nodes.length} nodes</span>
            <span>{nodes.reduce((acc, n) => acc + n.connections.length, 0)} connections</span>
          </div>
        </div>

        {/* Graph Canvas */}
        <div className="flex-1 glass-card rounded-xl border border-border/50 overflow-hidden relative min-h-[500px]">
          <canvas
            ref={canvasRef}
            className="w-full h-full cursor-crosshair"
            onMouseMove={handleMouseMove}
            style={{ minHeight: 500 }}
          />

          {/* Hover Info */}
          {hoveredNode && (
            <div className="absolute bottom-4 left-4 glass rounded-lg p-4 min-w-[200px] animate-fade-up">
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: nodeColors[hoveredNode.type].fill }}
                />
                <span className="text-xs font-medium text-muted-foreground uppercase">
                  {hoveredNode.type}
                </span>
              </div>
              <code className="text-sm font-mono text-primary block mb-2">
                {hoveredNode.name}
              </code>
              <p className="text-xs text-muted-foreground">
                {hoveredNode.connections.length} connections
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
