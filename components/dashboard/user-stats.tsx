"use client"

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const data = [
  {
    name: "Jan",
    average: 400,
    today: 240,
  },
  {
    name: "Feb",
    average: 300,
    today: 139,
  },
  {
    name: "Mar",
    average: 200,
    today: 980,
  },
  {
    name: "Apr",
    average: 278,
    today: 390,
  },
  {
    name: "May",
    average: 189,
    today: 480,
  },
  {
    name: "Jun",
    average: 239,
    today: 380,
  },
  {
    name: "Jul",
    average: 349,
    today: 430,
  },
]

export function UserStats() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data}>
        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              return (
                <div className="rounded-lg border bg-background p-2 shadow-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col">
                      <span className="text-[0.70rem] uppercase text-muted-foreground">Average</span>
                      <span className="font-bold text-muted-foreground">{payload[0].value}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[0.70rem] uppercase text-muted-foreground">Today</span>
                      <span className="font-bold">{payload[1].value}</span>
                    </div>
                  </div>
                </div>
              )
            }
            return null
          }}
        />
        <Line
          type="monotone"
          strokeWidth={2}
          dataKey="average"
          activeDot={{
            r: 6,
            style: { fill: "var(--theme-primary)", opacity: 0.25 },
          }}
          style={{
            stroke: "var(--theme-primary)",
            opacity: 0.25,
          }}
        />
        <Line
          type="monotone"
          dataKey="today"
          strokeWidth={2}
          activeDot={{
            r: 8,
            style: { fill: "var(--theme-primary)" },
          }}
          style={{
            stroke: "var(--theme-primary)",
          }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
