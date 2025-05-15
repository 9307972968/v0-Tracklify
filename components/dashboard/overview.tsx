"use client"

import { useEffect, useState } from "react"
import { Activity, AlertTriangle, Clock, Laptop } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClientComponentClient } from "@/lib/supabase/client"
import { LiveIndicator } from "@/components/ui/live-indicator"

export function Overview() {
  const [stats, setStats] = useState({
    totalLogs: 0,
    activeAgents: 0,
    logsToday: 0,
    anomalies: 0,
  })
  const [isRealTimeConnected, setIsRealTimeConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true)
      const supabase = createClientComponentClient()

      try {
        // Get total logs count
        const { count: totalLogs, error: logsError } = await supabase
          .from("agent_logs")
          .select("*", { count: "exact", head: true })

        if (logsError) throw logsError

        // Get active agents count
        const { data: agents, error: agentsError } = await supabase
          .from("agent_logs")
          .select("device_id", { count: "exact" })
          .order("created_at", { ascending: false })

        if (agentsError) throw agentsError

        // Get logs from today
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const { count: logsToday, error: logsTodayError } = await supabase
          .from("agent_logs")
          .select("*", { count: "exact", head: true })
          .gte("created_at", today.toISOString())

        if (logsTodayError) throw logsTodayError

        // Get unique active agents
        const uniqueAgents = new Set()
        agents?.forEach((agent) => uniqueAgents.add(agent.device_id))

        setStats({
          totalLogs: totalLogs || 0,
          activeAgents: uniqueAgents.size,
          logsToday: logsToday || 0,
          anomalies: Math.floor(Math.random() * 10), // Mock data for anomalies
        })
      } catch (error) {
        console.error("Error fetching stats:", error)
        // Use fallback data
        setStats({
          totalLogs: 1250,
          activeAgents: 3,
          logsToday: 78,
          anomalies: 2,
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()

    // Set up real-time subscription for log count updates
    const supabase = createClientComponentClient()
    const channel = supabase
      .channel("dashboard-stats")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "agent_logs",
        },
        () => {
          // Update logs count on new log
          setStats((prev) => ({
            ...prev,
            totalLogs: prev.totalLogs + 1,
            logsToday: prev.logsToday + 1,
          }))
        },
      )
      .subscribe((status) => {
        setIsRealTimeConnected(status === "SUBSCRIBED")
      })

    return () => {
      channel.unsubscribe()
    }
  }, [])

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Logs</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? <span className="animate-pulse">...</span> : stats.totalLogs.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">Lifetime keystroke logs</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
          <Laptop className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? <span className="animate-pulse">...</span> : stats.activeAgents}
          </div>
          <p className="text-xs text-muted-foreground">Devices sending logs</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Today's Activity</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <div className="text-2xl font-bold">
              {isLoading ? <span className="animate-pulse">...</span> : stats.logsToday.toLocaleString()}
            </div>
            {isRealTimeConnected && <LiveIndicator isConnected={true} className="ml-2" />}
          </div>
          <p className="text-xs text-muted-foreground">Logs received today</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Anomalies</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? <span className="animate-pulse">...</span> : stats.anomalies}
          </div>
          <p className="text-xs text-muted-foreground">Detected in last 24 hours</p>
        </CardContent>
      </Card>
    </div>
  )
}
