"use client"

import { Search, Bell, ChevronDown, Radar, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"

const environments = ["Production", "Staging", "Development"]

export function Topbar() {
  const [environment, setEnvironment] = useState("Production")
  const [isScanning, setIsScanning] = useState(false)
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleScan = () => {
    setIsScanning(true)
    setTimeout(() => setIsScanning(false), 3000)
  }

  return (
    <header className="h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-between h-full px-6">
        {/* Search */}
        <div className="flex items-center flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search APIs, alerts, endpoints..."
              className="w-full h-10 pl-10 pr-4 rounded-lg bg-muted/50 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          {/* Environment Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-9 px-3 bg-muted/30 border-border hover:bg-muted/50"
              >
                <div className="w-2 h-2 rounded-full bg-success mr-2" />
                {environment}
                <ChevronDown className="w-4 h-4 ml-2 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              {environments.map((env) => (
                <DropdownMenuItem
                  key={env}
                  onClick={() => setEnvironment(env)}
                  className="cursor-pointer"
                >
                  <div
                    className={`w-2 h-2 rounded-full mr-2 ${
                      env === "Production"
                        ? "bg-success"
                        : env === "Staging"
                        ? "bg-warning"
                        : "bg-muted-foreground"
                    }`}
                  />
                  {env}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Start Scan Button */}
          <Button
            onClick={handleScan}
            disabled={isScanning}
            className={`h-9 px-4 bg-primary text-primary-foreground hover:bg-primary/90 ${
              isScanning ? "" : "animate-pulse-glow"
            }`}
          >
            <Radar
              className={`w-4 h-4 mr-2 ${isScanning ? "animate-radar" : ""}`}
            />
            {isScanning ? "Scanning..." : "Start Scan"}
          </Button>

          {/* Notifications */}
          <button className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-critical border-2 border-background" />
          </button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm text-foreground">{user?.full_name ?? "Analyst"}</span>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem className="cursor-pointer">
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                Team Management
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer text-destructive"
                onClick={() => {
                  logout()
                  router.replace("/auth/login")
                }}
              >
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
