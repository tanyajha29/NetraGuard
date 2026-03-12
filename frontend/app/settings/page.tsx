"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  User,
  Bell,
  Shield,
  Key,
  Globe,
  Database,
  Webhook,
  Mail,
  Palette,
  Save,
} from "lucide-react"

const settingsSections = [
  {
    id: "profile",
    name: "Profile",
    icon: User,
    description: "Manage your account settings",
  },
  {
    id: "notifications",
    name: "Notifications",
    icon: Bell,
    description: "Configure alert preferences",
  },
  {
    id: "security",
    name: "Security",
    icon: Shield,
    description: "Authentication and access control",
  },
  {
    id: "api-keys",
    name: "API Keys",
    icon: Key,
    description: "Manage API authentication",
  },
  {
    id: "integrations",
    name: "Integrations",
    icon: Webhook,
    description: "Connected services and webhooks",
  },
  {
    id: "data-sources",
    name: "Data Sources",
    icon: Database,
    description: "Configure scan targets",
  },
]

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your NetraGuard configuration
            </p>
          </div>
          <Button className="bg-primary hover:bg-primary/90">
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Settings Navigation */}
          <div className="space-y-2">
            {settingsSections.map((section) => (
              <button
                key={section.id}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all",
                  section.id === "profile"
                    ? "bg-primary/10 border border-primary/30"
                    : "hover:bg-muted/50"
                )}
              >
                <div
                  className={cn(
                    "p-2 rounded-lg",
                    section.id === "profile"
                      ? "bg-primary/20"
                      : "bg-muted"
                  )}
                >
                  <section.icon
                    className={cn(
                      "w-4 h-4",
                      section.id === "profile"
                        ? "text-primary"
                        : "text-muted-foreground"
                    )}
                  />
                </div>
                <div>
                  <p
                    className={cn(
                      "text-sm font-medium",
                      section.id === "profile"
                        ? "text-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    {section.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {section.description}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {/* Settings Content */}
          <div className="col-span-2 space-y-6">
            {/* Profile Section */}
            <div className="glass-card rounded-xl p-6 border border-border/50">
              <h2 className="text-lg font-medium text-foreground mb-4">Profile Settings</h2>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <Button variant="outline" size="sm">Change Avatar</Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground mb-1.5 block">
                      Full Name
                    </label>
                    <input
                      type="text"
                      defaultValue="Sarah Chen"
                      className="w-full h-10 px-3 rounded-lg bg-muted/50 border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1.5 block">
                      Email
                    </label>
                    <input
                      type="email"
                      defaultValue="sarah.chen@company.com"
                      className="w-full h-10 px-3 rounded-lg bg-muted/50 border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm text-muted-foreground mb-1.5 block">
                    Role
                  </label>
                  <input
                    type="text"
                    defaultValue="Security Engineer"
                    className="w-full h-10 px-3 rounded-lg bg-muted/50 border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>
            </div>

            {/* Notification Preferences */}
            <div className="glass-card rounded-xl p-6 border border-border/50">
              <h2 className="text-lg font-medium text-foreground mb-4">Notification Preferences</h2>
              
              <div className="space-y-4">
                {[
                  { name: "Critical Alerts", description: "Immediate notification for critical security issues", enabled: true },
                  { name: "Zombie Detection", description: "Alerts when new zombie APIs are detected", enabled: true },
                  { name: "Scan Completion", description: "Notify when discovery scans complete", enabled: false },
                  { name: "Weekly Reports", description: "Weekly security summary emails", enabled: true },
                ].map((pref) => (
                  <div
                    key={pref.name}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/20"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">{pref.name}</p>
                      <p className="text-xs text-muted-foreground">{pref.description}</p>
                    </div>
                    <button
                      className={cn(
                        "relative w-11 h-6 rounded-full transition-colors",
                        pref.enabled ? "bg-primary" : "bg-muted"
                      )}
                    >
                      <span
                        className={cn(
                          "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform",
                          pref.enabled ? "left-6" : "left-1"
                        )}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Appearance */}
            <div className="glass-card rounded-xl p-6 border border-border/50">
              <h2 className="text-lg font-medium text-foreground mb-4">Appearance</h2>
              
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground mb-1">Theme</p>
                  <p className="text-xs text-muted-foreground">
                    Choose your preferred color theme
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="w-10 h-10 rounded-lg bg-[oklch(0.12_0.02_260)] border-2 border-primary flex items-center justify-center">
                    <Palette className="w-4 h-4 text-primary" />
                  </button>
                  <button className="w-10 h-10 rounded-lg bg-white border border-border flex items-center justify-center">
                    <Palette className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
