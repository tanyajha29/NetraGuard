"use client"

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

const data = [
  { time: "00:00", requests: 2400, errors: 120 },
  { time: "02:00", requests: 1398, errors: 80 },
  { time: "04:00", requests: 980, errors: 40 },
  { time: "06:00", requests: 3908, errors: 150 },
  { time: "08:00", requests: 4800, errors: 200 },
  { time: "10:00", requests: 3800, errors: 180 },
  { time: "12:00", requests: 4300, errors: 220 },
  { time: "14:00", requests: 5200, errors: 280 },
  { time: "16:00", requests: 4900, errors: 240 },
  { time: "18:00", requests: 4100, errors: 190 },
  { time: "20:00", requests: 3200, errors: 140 },
  { time: "22:00", requests: 2800, errors: 100 },
]

export function ApiTrafficChart() {
  return (
    <div className="glass-card rounded-xl p-5 border border-border/50 animate-fade-up">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-medium text-foreground">API Traffic</h3>
          <p className="text-xs text-muted-foreground">Last 24 hours</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-primary" />
            <span className="text-muted-foreground">Requests</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-critical" />
            <span className="text-muted-foreground">Errors</span>
          </div>
        </div>
      </div>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="oklch(0.82 0.18 195)"
                  stopOpacity={0.4}
                />
                <stop
                  offset="95%"
                  stopColor="oklch(0.82 0.18 195)"
                  stopOpacity={0}
                />
              </linearGradient>
              <linearGradient id="colorErrors" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="oklch(0.62 0.22 25)"
                  stopOpacity={0.4}
                />
                <stop
                  offset="95%"
                  stopColor="oklch(0.62 0.22 25)"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="time"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "oklch(0.65 0.01 240)", fontSize: 11 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "oklch(0.65 0.01 240)", fontSize: 11 }}
              tickFormatter={(value) => `${value / 1000}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "oklch(0.15 0.02 260)",
                border: "1px solid oklch(0.25 0.02 260)",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              labelStyle={{ color: "oklch(0.93 0.01 240)" }}
            />
            <Area
              type="monotone"
              dataKey="requests"
              stroke="oklch(0.82 0.18 195)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorRequests)"
            />
            <Area
              type="monotone"
              dataKey="errors"
              stroke="oklch(0.62 0.22 25)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorErrors)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
