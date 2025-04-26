"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"

const data = [
  {
    name: "00:00",
    total: 45,
  },
  {
    name: "03:00",
    total: 12,
  },
  {
    name: "06:00",
    total: 5,
  },
  {
    name: "09:00",
    total: 75,
  },
  {
    name: "12:00",
    total: 120,
  },
  {
    name: "15:00",
    total: 150,
  },
  {
    name: "18:00",
    total: 80,
  },
  {
    name: "21:00",
    total: 35,
  },
]

export function Overview() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
        <Bar dataKey="total" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-primary" />
      </BarChart>
    </ResponsiveContainer>
  )
}
