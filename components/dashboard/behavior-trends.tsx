"use client"

import { useState, useEffect } from "react"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend } from "recharts"
import { createClient } from "@/lib/supabase/client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface TrendData {
  date: string
  keystrokes: number
  applications: number
  sessions: number
  anomalies: number
}

export function BehaviorTrends() {
  const [data, setData] = useState<TrendData[]>([])
  const [timeRange, setTimeRange] = useState<string>("7d")
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  // Fetch trend data
  useEffect(() => {
    const fetchTrendData = async () => {
      setLoading(true)

      try {
        // In a real app, you would fetch actual trend data
        // For now, we'll generate sample data
        const now = new Date()
        const trendData: TrendData[] = []

        // Determine number of days based on time range
        let days = 7
        switch (timeRange) {
          case "7d":
            days = 7
            break
          case "30d":
            days = 30
            break
          case "90d":
            days = 90
            break
          default:
            days = 7
        }

        // Generate data for each day
        for (let i = days - 1; i >= 0; i--) {
          const date = new Date(now)
          date.setDate(date.getDate() - i)
          const dateStr = date.toISOString().split("T")[0]

          // Base values with some randomness
          const baseKeystrokes = 5000 + Math.floor(Math.random() * 3000)
          const baseApplications = 8 + Math.floor(Math.random() * 5)
          const baseSessions = 5 + Math.floor(Math.random() * 3)

          // Anomalies are rare
          const anomalies = Math.random() > 0.8 ? Math.floor(Math.random() * 3) + 1 : 0

          trendData.push({
            date: dateStr,
            keystrokes: baseKeystrokes,
            applications: baseApplications,
            sessions: baseSessions,
            anomalies: anomalies,
          })
        }

        setData(trendData)
      } catch (error) {
        console.error("Error generating trend data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTrendData()
  }, [timeRange, supabase])

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Tabs defaultValue="keystrokes" className="w-[400px]">
          <TabsList>
            <TabsTrigger value="keystrokes">Keystrokes</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="anomalies">Anomalies</TabsTrigger>
          </TabsList>
        </Tabs>

        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="h-[350px] w-full">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <p>Loading trend data...</p>
          </div>
        ) : (
          <Tabs defaultValue="keystrokes">
            <TabsContent value="keystrokes" className="h-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="keystrokes"
                    stroke="#000000"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </TabsContent>

            <TabsContent value="applications" className="h-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="applications"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </TabsContent>

            <TabsContent value="sessions" className="h-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="sessions"
                    stroke="#10B981"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </TabsContent>

            <TabsContent value="anomalies" className="h-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="anomalies"
                    stroke="#EF4444"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  )
}
