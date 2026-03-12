"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { cn } from "@/lib/utils"
import {
  Shield,
  Lock,
  Key,
  Activity,
  Eye,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ChevronRight,
} from "lucide-react"
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  RadialBarChart,
  RadialBar,
} from "recharts"

interface SecurityCheck {
  id: string
  category: string
  icon: React.ElementType
  checks: {
    name: string
    status: "pass" | "warning" | "fail"
    description: string
    affectedApis: number
  }[]
}

const securityCategories: SecurityCheck[] = [
  {
    id: "auth",
    category: "Authentication",
    icon: Key,
    checks: [
      { name: "OAuth 2.0 Implementation", status: "pass", description: "Properly configured OAuth flow", affectedApis: 0 },
      { name: "API Key Rotation", status: "warning", description: "12 keys older than 90 days", affectedApis: 12 },
      { name: "JWT Validation", status: "pass", description: "Token validation enabled", affectedApis: 0 },
      { name: "Multi-factor Auth", status: "fail", description: "MFA not enforced on admin endpoints", affectedApis: 8 },
    ],
  },
  {
    id: "encryption",
    category: "Encryption",
    icon: Lock,
    checks: [
      { name: "TLS 1.3", status: "pass", description: "All endpoints use TLS 1.3", affectedApis: 0 },
      { name: "Certificate Validity", status: "pass", description: "All certificates valid", affectedApis: 0 },
      { name: "Data at Rest", status: "warning", description: "3 endpoints storing unencrypted PII", affectedApis: 3 },
      { name: "Key Management", status: "pass", description: "HSM-backed key storage", affectedApis: 0 },
    ],
  },
  {
    id: "access",
    category: "Access Control",
    icon: Shield,
    checks: [
      { name: "Rate Limiting", status: "fail", description: "45 endpoints without rate limits", affectedApis: 45 },
      { name: "IP Whitelisting", status: "warning", description: "Admin APIs accessible from any IP", affectedApis: 5 },
      { name: "RBAC Implementation", status: "pass", description: "Role-based access configured", affectedApis: 0 },
      { name: "Session Management", status: "pass", description: "Secure session handling", affectedApis: 0 },
    ],
  },
  {
    id: "data",
    category: "Sensitive Data",
    icon: Eye,
    checks: [
      { name: "PII Exposure", status: "fail", description: "7 endpoints exposing PII in responses", affectedApis: 7 },
      { name: "Data Masking", status: "warning", description: "Incomplete masking on debug endpoints", affectedApis: 2 },
      { name: "Logging Hygiene", status: "pass", description: "No sensitive data in logs", affectedApis: 0 },
      { name: "Data Classification", status: "pass", description: "All data properly classified", affectedApis: 0 },
    ],
  },
]

const securityScoreData = [
  { name: "Security Score", value: 78, fill: "oklch(0.82 0.18 195)" },
]

const trendData = [
  { date: "Jan", score: 65 },
  { date: "Feb", score: 68 },
  { date: "Mar", score: 72 },
  { date: "Apr", score: 70 },
  { date: "May", score: 75 },
  { date: "Jun", score: 78 },
]

export default function SecurityPage() {
  const totalPassed = securityCategories.reduce(
    (acc, cat) => acc + cat.checks.filter((c) => c.status === "pass").length,
    0
  )
  const totalWarnings = securityCategories.reduce(
    (acc, cat) => acc + cat.checks.filter((c) => c.status === "warning").length,
    0
  )
  const totalFailed = securityCategories.reduce(
    (acc, cat) => acc + cat.checks.filter((c) => c.status === "fail").length,
    0
  )

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Security Analysis</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Comprehensive security posture assessment for all APIs
            </p>
          </div>
        </div>

        {/* Score Overview */}
        <div className="grid grid-cols-4 gap-6">
          <div className="glass-card rounded-xl p-5 border border-primary/30 glow-cyan-sm">
            <div className="flex items-center gap-4">
              <div className="w-24 h-24">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart
                    cx="50%"
                    cy="50%"
                    innerRadius="70%"
                    outerRadius="100%"
                    data={securityScoreData}
                    startAngle={90}
                    endAngle={-270}
                  >
                    <RadialBar
                      dataKey="value"
                      cornerRadius={10}
                      background={{ fill: "oklch(0.22 0.02 260)" }}
                    />
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>
              <div>
                <p className="text-4xl font-bold font-mono text-primary">78</p>
                <p className="text-sm text-muted-foreground">Security Score</p>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-xl p-5 border border-success/30">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-success/20">
                <CheckCircle className="w-5 h-5 text-success" />
              </div>
              <span className="text-sm text-muted-foreground">Passed Checks</span>
            </div>
            <p className="text-3xl font-bold font-mono text-success">{totalPassed}</p>
          </div>

          <div className="glass-card rounded-xl p-5 border border-warning/30">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-warning/20">
                <AlertTriangle className="w-5 h-5 text-warning" />
              </div>
              <span className="text-sm text-muted-foreground">Warnings</span>
            </div>
            <p className="text-3xl font-bold font-mono text-warning">{totalWarnings}</p>
          </div>

          <div className="glass-card rounded-xl p-5 border border-critical/30">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-critical/20">
                <XCircle className="w-5 h-5 text-critical" />
              </div>
              <span className="text-sm text-muted-foreground">Failed Checks</span>
            </div>
            <p className="text-3xl font-bold font-mono text-critical">{totalFailed}</p>
          </div>
        </div>

        {/* Trend Chart */}
        <div className="glass-card rounded-xl p-5 border border-border/50">
          <h3 className="text-sm font-medium text-foreground mb-4">Security Score Trend</h3>
          <div className="h-[150px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.82 0.18 195)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="oklch(0.82 0.18 195)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "oklch(0.65 0.01 240)", fontSize: 11 }}
                />
                <YAxis
                  domain={[50, 100]}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "oklch(0.65 0.01 240)", fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "oklch(0.15 0.02 260)",
                    border: "1px solid oklch(0.25 0.02 260)",
                    borderRadius: "6px",
                    fontSize: "11px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="oklch(0.82 0.18 195)"
                  strokeWidth={2}
                  fill="url(#scoreGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Security Categories */}
        <div className="grid grid-cols-2 gap-6">
          {securityCategories.map((category) => (
            <div
              key={category.id}
              className="glass-card rounded-xl border border-border/50 overflow-hidden"
            >
              <div className="p-4 border-b border-border/50 bg-muted/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <category.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-sm font-medium text-foreground">
                    {category.category}
                  </h3>
                </div>
              </div>
              <div className="divide-y divide-border/30">
                {category.checks.map((check) => (
                  <div
                    key={check.name}
                    className="p-4 hover:bg-primary/5 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {check.status === "pass" && (
                          <CheckCircle className="w-4 h-4 text-success" />
                        )}
                        {check.status === "warning" && (
                          <AlertTriangle className="w-4 h-4 text-warning" />
                        )}
                        {check.status === "fail" && (
                          <XCircle className="w-4 h-4 text-critical" />
                        )}
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {check.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {check.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {check.affectedApis > 0 && (
                          <span
                            className={cn(
                              "text-xs font-mono px-2 py-0.5 rounded",
                              check.status === "fail"
                                ? "bg-critical/10 text-critical"
                                : "bg-warning/10 text-warning"
                            )}
                          >
                            {check.affectedApis} APIs
                          </span>
                        )}
                        <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
