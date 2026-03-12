"use client"

import { Sidebar } from "./sidebar"
import { Topbar } from "./topbar"
import { AuthGuard } from "../auth/auth-guard"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <AuthGuard>
      <div className="flex h-screen bg-background overflow-hidden">
        <Sidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Topbar />
          <main className="flex-1 overflow-y-auto p-6 bg-gradient-cyber">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  )
}
