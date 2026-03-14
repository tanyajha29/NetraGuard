"use client"

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

type Slice = { name: string; value: number; color: string }

const fallback: Slice[] = [
  { name: "Active", value: 10, color: "oklch(0.68 0.17 145)" },
  { name: "Deprecated", value: 2, color: "oklch(0.78 0.16 75)" },
  { name: "Shadow", value: 3, color: "oklch(0.75 0.15 50)" },
  { name: "Zombie", value: 1, color: "oklch(0.62 0.22 25)" },
]

export function ApiDistributionChart({ data = fallback }: { data?: Slice[] }) {
  const total = data.reduce((acc, item) => acc + item.value, 0) || 1

  return (
    <div className="glass-card rounded-xl p-5 border border-border/50 animate-fade-up">
      <div className="mb-4">
        <h3 className="text-sm font-medium text-foreground">API Status Distribution</h3>
        <p className="text-xs text-muted-foreground">Overview of API states</p>
      </div>
      <div className="flex items-center gap-6">
        <div className="w-[140px] h-[140px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={65}
                paddingAngle={3}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "oklch(0.15 0.02 260)",
                  border: "1px solid oklch(0.25 0.02 260)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                labelStyle={{ color: "oklch(0.93 0.01 240)" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex-1 space-y-3">
          {data.map((item) => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-muted-foreground">{item.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground font-mono">
                  {item.value}
                </span>
                <span className="text-xs text-muted-foreground">
                  ({((item.value / total) * 100).toFixed(1)}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
