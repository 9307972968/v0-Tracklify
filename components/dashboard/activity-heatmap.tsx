"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { InfoIcon } from "lucide-react"

interface ActivityData {
  hour: number
  count: number
}

interface MockUser {
  id: string
  email: string
}

// Mock users for when the profiles table doesn't exist
const mockUsers: MockUser[] = [
  { id: "user-1", email: "john.doe@example.com" },
  { id: "user-2", email: "jane.smith@example.com" },
  { id: "user-3", email: "alex.wilson@example.com" },
]

// Generate mock activity data
const generateMockActivityData = (userId: string): ActivityData[] => {
  const activityData: ActivityData[] = []

  // Generate data for each hour of the day
  for (let hour = 0; hour < 24; hour++) {
    // More activity during work hours (9-17)
    let baseCount = 10
    if (hour >= 9 && hour <= 17) {
      baseCount = 50 + Math.floor(Math.random() * 100)
    } else if ((hour >= 7 && hour < 9) || (hour > 17 && hour <= 19)) {
      baseCount = 20 + Math.floor(Math.random() * 30)
    }

    // Add some variation based on user ID
    const userMultiplier = userId === "all" ? 1 : userId === "user-1" ? 1.2 : userId === "user-2" ? 0.8 : 1.5

    activityData.push({
      hour,
      count: Math.floor(baseCount * userMultiplier),
    })
  }

  return activityData
}

export function ActivityHeatmap() {
  const [data, setData] = useState<ActivityData[]>([])
  const [selectedUser, setSelectedUser] = useState<string>("all")
  const [users, setUsers] = useState<MockUser[]>(mockUsers)
  const [loading, setLoading] = useState(true)
  const [isUsingSampleData, setIsUsingSampleData] = useState(true)
  const supabase = createClient()

  // Fetch users or use mock data
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase.from("profiles").select("id, email").limit(10)

        if (error) {
          console.error("Error fetching users:", error)
          setUsers(mockUsers)
          setIsUsingSampleData(true)
          return
        }

        if (data && data.length > 0) {
          setUsers(data)
          setIsUsingSampleData(false)
        } else {
          setUsers(mockUsers)
          setIsUsingSampleData(true)
        }
      } catch (error) {
        console.error("Error fetching users:", error)
        setUsers(mockUsers)
        setIsUsingSampleData(true)
      }
    }

    fetchUsers()
  }, [supabase])

  // Fetch activity data or generate mock data
  useEffect(() => {
    const fetchActivityData = async () => {
      setLoading(true)

      try {
        // Always use mock data for now since we don't have a keystroke_logs table
        // In a real app, you would fetch actual activity data from the database
        setData(generateMockActivityData(selectedUser))
      } catch (error) {
        console.error("Error generating activity data:", error)
        setData(generateMockActivityData(selectedUser))
      } finally {
        setLoading(false)
      }
    }

    fetchActivityData()
  }, [selectedUser])

  // Calculate the maximum count for scaling
  const maxCount = Math.max(...data.map((d) => d.count))

  return (
    <div className="space-y-4">
      {isUsingSampleData && (
        <Alert variant="default" className="bg-muted/50 border-muted">
          <InfoIcon className="h-4 w-4" />
          <AlertTitle>Sample Data</AlertTitle>
          <AlertDescription>
            Using sample data because the profiles table doesn't exist in your database yet.
          </AlertDescription>
        </Alert>
      )}

      <Select value={selectedUser} onValueChange={setSelectedUser}>
        <SelectTrigger>
          <SelectValue placeholder="Select user" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Users</SelectItem>
          {users.map((user) => (
            <SelectItem key={user.id} value={user.id}>
              {user.email}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {loading ? (
        <div className="flex items-center justify-center h-[300px]">
          <p>Loading activity data...</p>
        </div>
      ) : (
        <div className="grid grid-cols-6 gap-1">
          {data.map((hourData) => {
            // Calculate intensity (0-100%)
            const intensity = (hourData.count / maxCount) * 100

            // Format hour for display
            const displayHour = hourData.hour % 12 || 12
            const amPm = hourData.hour < 12 ? "am" : "pm"

            return (
              <div key={hourData.hour} className="flex flex-col items-center">
                <div
                  className="w-full aspect-square rounded-md mb-1"
                  style={{
                    backgroundColor: `rgba(59, 130, 246, ${intensity / 100})`,
                    border: "1px solid rgba(59, 130, 246, 0.2)",
                  }}
                  title={`${hourData.count} keystrokes at ${displayHour}${amPm}`}
                />
                <span className="text-xs text-muted-foreground">
                  {displayHour}
                  {amPm}
                </span>
              </div>
            )
          })}
        </div>
      )}

      <div className="flex justify-between items-center pt-2">
        <div className="text-xs text-muted-foreground">Low Activity</div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-2 bg-blue-500 opacity-20 rounded-sm" />
          <div className="w-4 h-2 bg-blue-500 opacity-40 rounded-sm" />
          <div className="w-4 h-2 bg-blue-500 opacity-60 rounded-sm" />
          <div className="w-4 h-2 bg-blue-500 opacity-80 rounded-sm" />
          <div className="w-4 h-2 bg-blue-500 rounded-sm" />
        </div>
        <div className="text-xs text-muted-foreground">High Activity</div>
      </div>
    </div>
  )
}
