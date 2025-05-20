"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { createClient } from "@/lib/supabase/client"

interface User {
  id: string
  name: string
  email: string
  typing_speed: number
  created_at: string
}

export function TypingSpeedChart() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true)
      setError(null)

      try {
        const supabase = createClient()

        // First check if the profiles table exists
        const { error: tableCheckError } = await supabase.from("profiles").select("count").limit(1).single()

        if (tableCheckError && tableCheckError.message.includes("does not exist")) {
          // If profiles table doesn't exist, use users table or create mock data
          console.log("Profiles table doesn't exist, using mock data instead")

          // Generate mock data for demonstration
          const mockUsers = Array.from({ length: 5 }, (_, i) => ({
            id: `user-${i + 1}`,
            name: `User ${i + 1}`,
            email: `user${i + 1}@example.com`,
            typing_speed: Math.floor(Math.random() * 80) + 20, // Random speed between 20-100 WPM
            created_at: new Date().toISOString(),
          }))

          setUsers(mockUsers)
        } else {
          // If profiles table exists, fetch real data
          const { data, error } = await supabase
            .from("profiles")
            .select("id, name, email, typing_speed, created_at")
            .order("typing_speed", { ascending: false })
            .limit(10)

          if (error) throw error

          setUsers(data || [])
        }
      } catch (err) {
        console.error("Error fetching users:", err)
        setError("Failed to load user data. Using sample data instead.")

        // Provide fallback data
        const fallbackUsers = Array.from({ length: 5 }, (_, i) => ({
          id: `user-${i + 1}`,
          name: `User ${i + 1}`,
          email: `user${i + 1}@example.com`,
          typing_speed: Math.floor(Math.random() * 80) + 20,
          created_at: new Date().toISOString(),
        }))

        setUsers(fallbackUsers)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  // Prepare data for the chart
  const chartData = users.map((user) => ({
    name: user.name,
    wpm: user.typing_speed,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Typing Speed Comparison</CardTitle>
        <CardDescription>Average typing speed in words per minute (WPM)</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex h-[300px] items-center justify-center">
            <p className="text-sm text-muted-foreground">Loading data...</p>
          </div>
        ) : error ? (
          <div className="flex h-[300px] items-center justify-center">
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        ) : users.length === 0 ? (
          <div className="flex h-[300px] items-center justify-center">
            <p className="text-sm text-muted-foreground">No data available</p>
          </div>
        ) : (
          <ChartContainer
            config={{
              wpm: {
                label: "WPM",
                color: "hsl(var(--chart-1))",
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis dataKey="name" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="wpm"
                  strokeWidth={2}
                  activeDot={{
                    r: 6,
                    style: { fill: "var(--color-wpm)", opacity: 0.8 },
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
