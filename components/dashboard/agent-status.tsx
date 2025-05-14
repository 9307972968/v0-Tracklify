"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDistanceToNow } from "date-fns"
import { Download, RefreshCw } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

interface AgentStatusProps {
  userId: string | undefined
}

interface AgentStatus {
  status: "online" | "offline"
  lastPing: string | null
}

export function AgentStatus({ userId }: AgentStatusProps) {
  const [status, setStatus] = useState<AgentStatus>({ status: "offline", lastPing: null })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const supabase = createClient()

  const fetchAgentStatus = async () => {
    if (!userId) return

    try {
      setRefreshing(true)

      // In a real app, we would fetch from the agent_status table
      // For now, we'll simulate with a random status
      const isOnline = Math.random() > 0.5

      setStatus({
        status: isOnline ? "online" : "offline",
        lastPing: isOnline ? new Date().toISOString() : null,
      })
    } catch (error) {
      console.error("Error fetching agent status:", error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchAgentStatus()

    // Poll for status updates every 30 seconds
    const interval = setInterval(fetchAgentStatus, 30000)

    return () => clearInterval(interval)
  }, [userId])

  const handleRefresh = () => {
    fetchAgentStatus()
    toast.success("Agent status refreshed")
  }

  if (loading) {
    return <Skeleton className="h-[100px] w-full" />
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className={`h-10 w-10 rounded-full flex items-center justify-center ${
                status.status === "online" ? "bg-green-100" : "bg-red-100"
              }`}
            >
              <div
                className={`h-4 w-4 rounded-full ${status.status === "online" ? "bg-green-500" : "bg-red-500"}`}
              ></div>
            </div>
            <div>
              <h3 className="font-medium">Agent Status</h3>
              <p className="text-sm text-muted-foreground">
                {status.status === "online" ? (
                  <>
                    <span className="text-green-600 font-medium">Online</span> - Last ping{" "}
                    {status.lastPing ? formatDistanceToNow(new Date(status.lastPing), { addSuffix: true }) : "never"}
                  </>
                ) : (
                  <>
                    <span className="text-red-600 font-medium">Offline</span> - Agent not connected
                  </>
                )}
              </p>
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 sm:flex-initial"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              {refreshing ? "Refreshing..." : "Refresh"}
            </Button>
            <Button asChild size="sm" className="flex-1 sm:flex-initial">
              <Link href="/dashboard/agent">
                <Download className="mr-2 h-4 w-4" />
                Agent Setup
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
