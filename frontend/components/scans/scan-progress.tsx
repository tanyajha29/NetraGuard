"use client"

import { cn } from "@/lib/utils"
import { Radar } from "lucide-react"

interface ScanProgressProps {
  isScanning: boolean
  progress: number
  currentTarget?: string
  className?: string
}

export function ScanProgress({
  isScanning,
  progress,
  currentTarget,
  className,
}: ScanProgressProps) {
  return (
    <div
      className={cn(
        "glass-card rounded-xl p-6 border border-primary/30 relative overflow-hidden",
        isScanning && "glow-cyan",
        className
      )}
    >
      {/* Radar Animation Background */}
      {isScanning && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative w-48 h-48">
            <div className="absolute inset-0 rounded-full border border-primary/20" />
            <div className="absolute inset-4 rounded-full border border-primary/15" />
            <div className="absolute inset-8 rounded-full border border-primary/10" />
            <div
              className="absolute inset-0 rounded-full animate-radar"
              style={{
                background:
                  "conic-gradient(from 0deg, transparent 0deg, oklch(0.82 0.18 195 / 0.3) 30deg, transparent 60deg)",
              }}
            />
          </div>
        </div>
      )}

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "p-2.5 rounded-lg bg-primary/10",
                isScanning && "animate-pulse"
              )}
            >
              <Radar
                className={cn(
                  "w-5 h-5 text-primary",
                  isScanning && "animate-radar"
                )}
              />
            </div>
            <div>
              <h3 className="text-lg font-medium text-foreground">
                {isScanning ? "Scan in Progress" : "Ready to Scan"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {isScanning
                  ? "Discovering API endpoints..."
                  : "Start a new discovery scan"}
              </p>
            </div>
          </div>
          {isScanning && (
            <span className="text-2xl font-bold font-mono text-primary">
              {progress}%
            </span>
          )}
        </div>

        {isScanning && (
          <>
            {/* Progress Bar */}
            <div className="h-2 bg-muted rounded-full overflow-hidden mb-3">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500 glow-cyan"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Current Target */}
            {currentTarget && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Scanning:</span>
                <code className="font-mono text-primary">{currentTarget}</code>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
