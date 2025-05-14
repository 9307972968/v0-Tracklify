"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDistanceToNow } from "date-fns"

interface Activity {
  id: string
  user_id: string
  action: string
  timestamp: string
  details?: any
  user_email?: string
  user_name?: string
}

export function RecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const { data: userData } = await supabase.auth.getUser()

        if (!userData.user) return

        // Mock data for demonstration
        const mockActivities = [
          {
            id: "1",
            user_id: userData.user.id,
            action: "Logged in",
            timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
            details: { ip: "192.168.1.1", device: "Windows 10, Chrome" },
            user_email: userData.user.email,
            user_name: userData.user.user_metadata?.full_name || userData.user.email?.split("@")[0],
          },
          {
            id: "2",
            user_id: userData.user.id,
            action: "Viewed dashboard",
            timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
            user_email: userData.user.email,
            user_name: userData.user.user_metadata?.full_name || userData.user.email?.split("@")[0],
          },
          {
            id: "3",
            user_id: userData.user.id,
            action: "Downloaded agent",
            timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            user_email: userData.user.email,
            user_name: userData.user.user_metadata?.full_name || userData.user.email?.split("@")[0],
          },
          {
            id: "4",
            user_id: userData.user.id,
            action: "Updated settings",
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            details: { setting: "notification preferences" },
            user_email: userData.user.email,
            user_name: userData.user.user_metadata?.full_name || userData.user.email?.split("@")[0],
          },
        ]

        setActivities(mockActivities)
      } catch (error) {
        console.error("Error fetching activities:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchActivities()
  }, [supabase])

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {activities.length > 0 ? (
        activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-4">
            <Avatar className="mt-1">
              <AvatarImage src={`https://avatar.vercel.sh/${activity.user_id}`} />
              <AvatarFallback>
                {(activity.user_name || activity.user_email || "").substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">
                {activity.user_name || activity.user_email?.split("@")[0] || "Unknown user"}
              </p>
              <p className="text-sm text-muted-foreground">{activity.action}</p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
              </p>
            </div>
          </div>
        ))
      ) : (
        <p className="text-center text-sm text-muted-foreground">No recent activity</p>
      )}
    </div>
  )
}
