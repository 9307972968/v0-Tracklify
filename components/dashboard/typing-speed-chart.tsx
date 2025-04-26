"use client"

import { useState, useEffect } from "react"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend } from "recharts"
import { createClient } from "@/lib/supabase/client"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { InfoIcon } from "lucide-react"

interface TypingData {
  date: string
  [key: string]: string | number
}

// Mock users for when the profiles table doesn't exist
const MOCK_USERS = [
  { id: "user1", email: "john.doe@example.com" },
  { id: "user2", email: "jane.smith@example.com" },
  { id: "user3", email: "alex.wong@example.com" },
  { id: "user4", email: "sarah.johnson@example.com" },
  { id: "user5", email: "michael.brown@example.com" },
]

export function TypingSpeedChart() {
  const [data, setData] = useState<TypingData[]>([])
  const [users, setUsers] = useState<{ id: string; email: string }[]>([])
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [usingSampleData, setUsingSampleData] = useState(false)
  const supabase = createClient()

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase.from("profiles").select("id, email").limit(10)

        if (error) {
          console.error("Error fetching users:", error)
          // Use mock users if there's an error (likely table doesn't exist)
          setUsers(MOCK_USERS)
          setSelectedUsers(MOCK_USERS.slice(0, 3).map((user) => user.id))
          setUsingSampleData(true)
          return
        }

        if (data && data.length > 0) {
          setUsers(data)
          // Select first 3 users by default
          setSelectedUsers(data.slice(0, 3).map((user) => user.id))
        } else {
          // Use mock users if no data is returned
          setUsers(MOCK_USERS)
          setSelectedUsers(MOCK_USERS.slice(0, 3).map((user) => user.id))
          setUsingSampleData(true)
        }
      } catch (err) {
        console.error("Error in fetchUsers:", err)
        // Use mock users if there's an exception
        setUsers(MOCK_USERS)
        setSelectedUsers(MOCK_USERS.slice(0, 3).map((user) => user.id))
        setUsingSampleData(true)
      }
    }

    fetchUsers()
  }, [supabase])

  // Generate typing speed data
  useEffect(() => {
    const generateTypingData = () => {
      if (selectedUsers.length === 0) {
        setData([])
        setLoading(false)
        return
      }

      setLoading(true)

      try {
        const now = new Date()
        const data: TypingData[] = []

        // Generate data for the last 14 days
        for (let i = 13; i >= 0; i--) {
          const date = new Date(now)
          date.setDate(date.getDate() - i)
          const dateStr = date.toISOString().split("T")[0]

          const entry: TypingData = { date: dateStr }

          // Generate random WPM for each selected user
          selectedUsers.forEach((userId) => {
            const userEmail = users.find((u) => u.id === userId)?.email || userId

            // Generate somewhat consistent data with some variation
            // Use userId as a seed for consistent randomness per user
            const userSeed = userId.charCodeAt(0) + userId.charCodeAt(userId.length - 1)
            const baseWpm = 30 + ((userSeed % 50) + Math.floor(Math.random() * 20)) // Base WPM between 30-100

            // Create a trend over time (generally improving)
            const trendFactor = Math.min(i / 13, 1) * 15 // Up to 15 WPM improvement over time

            // Daily variation
            const dailyVariation = Math.floor(Math.random() * 16) - 8 // -8 to +8 variation

            // Combine factors
            const wpm = Math.max(10, Math.floor(baseWpm + (13 - i) - trendFactor + dailyVariation))

            entry[userEmail] = wpm
          })

          data.push(entry)
        }

        setData(data)
      } catch (error) {
        console.error("Error generating typing data:", error)
      } finally {
        setLoading(false)
      }
    }

    generateTypingData()
  }, [selectedUsers, users])

  const handleUserSelection = (userId: string) => {
    setSelectedUsers((prev) => {
      if (prev.includes(userId)) {
        return prev.filter((id) => id !== userId)
      } else {
        return [...prev, userId]
      }
    })
  }

  const colors = ["#000000", "#3B82F6", "#10B981", "#F59E0B", "#EF4444"]

  return (
    <div className="space-y-4">
      {usingSampleData && (
        <Alert variant="default" className="bg-muted/50 border-muted">
          <InfoIcon className="h-4 w-4" />
          <AlertDescription>
            Displaying sample data. Create the profiles table in your database to see real data.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-wrap gap-2">
        {users.map((user, index) => (
          <button
            key={user.id}
            onClick={() => handleUserSelection(user.id)}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${
              selectedUsers.includes(user.id)
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground"
            }`}
            style={{
              borderColor: selectedUsers.includes(user.id) ? colors[index % colors.length] : undefined,
              borderWidth: selectedUsers.includes(user.id) ? "1px" : undefined,
            }}
          >
            {user.email.split("@")[0]}
          </button>
        ))}
      </div>

      <div className="h-[350px] w-full">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <p>Loading chart data...</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="date" />
              <YAxis label={{ value: "WPM", angle: -90, position: "insideLeft" }} />
              <Tooltip />
              <Legend />
              {selectedUsers.map((userId, index) => {
                const userEmail = users.find((u) => u.id === userId)?.email || userId
                return (
                  <Line
                    key={userId}
                    type="monotone"
                    dataKey={userEmail}
                    stroke={colors[index % colors.length]}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                )
              })}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
