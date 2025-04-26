"use client"

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const data = [
  {
    date: "Jan",
    keystrokes: 2500,
    anomalies: 12,
  },
  {
    date: "Feb",
    keystrokes: 3000,
    anomalies: 8,
  },
  {
    date: "Mar",
    keystrokes: 2800,
    anomalies: 15,
  },
  {
    date: "Apr",
    keystrokes: 3200,
    anomalies: 10,
  },
  {
    date: "May",
    keystrokes: 3500,
    anomalies: 7,
  },
  {
    date: "Jun",
    keystrokes: 3700,
    anomalies: 5,
  },
]

export function UserStats() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data}>
        <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
        <Tooltip />
        <Line type="monotone" dataKey="keystrokes" stroke="#000000" strokeWidth={2} activeDot={{ r: 8 }} />
        <Line type="monotone" dataKey="anomalies" stroke="#3B82F6" strokeWidth={2} activeDot={{ r: 8 }} />
      </LineChart>
    </ResponsiveContainer>
  )
}
