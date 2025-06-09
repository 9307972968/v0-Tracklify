"use client"

import { useState, useEffect, useCallback } from "react"
import { Download, Search, RefreshCw, Activity, Wifi, WifiOff } from "lucide-react"
import { format } from "date-fns"
import { useDebounce } from "@/hooks/use-debounce"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
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
import { ScrollArea } from "@/components/ui/scroll-area"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/context/SupabaseProvider"
import { toast } from "sonner"

interface AgentLog {
  id: string
  user_id: string
  device_id: string
  keystroke: string
  window_title?: string
  application?: string
  created_at: string
  metadata?: any
}

export function LiveLogs() {
  const [logs, setLogs] = useState<AgentLog[]>([])
  const [filteredLogs, setFilteredLogs] = useState<AgentLog[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [deviceFilter, setDeviceFilter] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(true)
  const [isRealTimeConnected, setIsRealTimeConnected] = useState(false)
  const [newLogIds, setNewLogIds] = useState<Set<string>>(new Set())
  const [devices, setDevices] = useState<string[]>([])

  const debouncedSearchTerm = useDebounce(searchTerm, 300)
  const { user } = useAuth()
  const supabase = createClient()

  // Fetch initial logs
  const fetchLogs = useCallback(async () => {
    if (!user) return

    try {
      setIsLoading(true)

      const { data, error } = await supabase
        .from("agent_logs")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(100)

      if (error) {
        if (error.code === "42P01") {
          // Table doesn't exist, show demo data
          console.log("agent_logs table not found, using demo data")
          const demoLogs = generateDemoLogs()
          setLogs(demoLogs)
          setFilteredLogs(demoLogs)
          toast.info("Demo mode: Install the agent to see real logs")
        } else {
          console.error("Error fetching logs:", error)
          toast.error("Failed to load logs")
        }
      } else {
        setLogs(data || [])
        setFilteredLogs(data || [])

        // Extract unique devices
        const uniqueDevices = [...new Set((data || []).map((log) => log.device_id))]
        setDevices(uniqueDevices)

        if (data && data.length === 0) {
          toast.info("No logs found. Install and run the agent to start monitoring.")
        }
      }
    } catch (error) {
      console.error("Error fetching logs:", error)
      const demoLogs = generateDemoLogs()
      setLogs(demoLogs)
      setFilteredLogs(demoLogs)
      toast.info("Demo mode: Install the agent to see real logs")
    } finally {
      setIsLoading(false)
    }
  }, [user, supabase])

  // Setup real-time subscription
  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel("agent_logs_realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "agent_logs",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log("New log received:", payload.new)
          const newLog = payload.new as AgentLog

          setLogs((prevLogs) => {
            const updated = [newLog, ...prevLogs.slice(0, 99)]
            return updated
          })

          // Add to new log IDs for highlighting
          setNewLogIds((prev) => new Set(prev).add(newLog.id))

          // Update devices list if new device
          setDevices((prevDevices) => {
            if (!prevDevices.includes(newLog.device_id)) {
              return [...prevDevices, newLog.device_id]
            }
            return prevDevices
          })

          // Remove highlight after animation
          setTimeout(() => {
            setNewLogIds((prev) => {
              const updated = new Set(prev)
              updated.delete(newLog.id)
              return updated
            })
          }, 3000)

          toast.success(`New activity from ${newLog.device_id}`)
        },
      )
      .subscribe((status) => {
        console.log("Realtime subscription status:", status)
        setIsRealTimeConnected(status === "SUBSCRIBED")

        if (status === "SUBSCRIBED") {
          console.log("✅ Real-time monitoring active")
        } else if (status === "CHANNEL_ERROR") {
          console.error("❌ Real-time connection failed")
          toast.error("Real-time connection failed")
        }
      })

    return () => {
      console.log("Cleaning up realtime subscription")
      supabase.removeChannel(channel)
    }
  }, [user, supabase])

  // Filter logs based on search and device
  useEffect(() => {
    let filtered = logs

    if (debouncedSearchTerm) {
      filtered = filtered.filter(
        (log) =>
          log.keystroke.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
          log.device_id.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
          log.application?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
          log.window_title?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()),
      )
    }

    if (deviceFilter && deviceFilter !== "all") {
      filtered = filtered.filter((log) => log.device_id === deviceFilter)
    }

    setFilteredLogs(filtered)
  }, [logs, debouncedSearchTerm, deviceFilter])

  // Initial load
  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  const generateDemoLogs = (): AgentLog[] => {
    const demoData = [
      { keystroke: "Hello World", app: "Notepad", window: "Untitled - Notepad" },
      { keystroke: "password123", app: "Chrome", window: "Login - Gmail" },
      { keystroke: "npm install tracklify", app: "Terminal", window: "Command Prompt" },
      { keystroke: "SELECT * FROM users WHERE active = 1", app: "SSMS", window: "SQL Server Management Studio" },
      { keystroke: "[Ctrl+C]", app: "Excel", window: "Budget.xlsx - Excel" },
      { keystroke: "git commit -m 'fix: authentication'", app: "VSCode", window: "tracklify - Visual Studio Code" },
      { keystroke: "docker run -p 3000:3000", app: "Terminal", window: "PowerShell" },
    ]

    return demoData.map((item, index) => ({
      id: `demo-${index}`,
      user_id: user?.id || "demo-user",
      device_id: `DEMO-PC-${Math.floor(Math.random() * 3) + 1}`,
      keystroke: item.keystroke,
      window_title: item.window,
      application: item.app,
      created_at: new Date(Date.now() - index * 120000).toISOString(),
      metadata: { demo: true },
    }))
  }

  const handleExportLogs = () => {
    try {
      const headers = ["Timestamp", "Device", "Application", "Window", "Keystroke"]
      const csvContent =
        headers.join(",") +
        "\n" +
        filteredLogs
          .map((log) => {
            return [
              format(new Date(log.created_at), "yyyy-MM-dd HH:mm:ss"),
              log.device_id,
              log.application || "",
              log.window_title || "",
              `"${log.keystroke.replace(/"/g, '""')}"`,
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
      URL.revokeObjectURL(url)

      toast.success("Logs exported successfully")
    } catch (error) {
      console.error("Error exporting logs:", error)
      toast.error("Failed to export logs")
    }
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Live Activity Monitor
            </CardTitle>
            <CardDescription>Real-time keystroke and application monitoring</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {isRealTimeConnected ? (
              <Badge className="bg-green-500 hover:bg-green-600">
                <Wifi className="h-3 w-3 mr-1" />
                Live
              </Badge>
            ) : (
              <Badge variant="secondary">
                <WifiOff className="h-3 w-3 mr-1" />
                Offline
              </Badge>
            )}
            <Button variant="outline" size="sm" onClick={handleExportLogs} disabled={filteredLogs.length === 0}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search logs, applications, or devices..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={deviceFilter} onValueChange={setDeviceFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="All devices" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Devices</SelectLabel>
                <SelectItem value="all">All devices</SelectItem>
                {devices.map((device) => (
                  <SelectItem key={device} value={device}>
                    {device}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Logs Display */}
        <div className="border rounded-lg">
          <ScrollArea className="h-[500px]">
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
            ) : filteredLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Activity className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No activity detected</h3>
                <p className="text-muted-foreground mb-4 max-w-md">
                  {searchTerm || deviceFilter !== "all"
                    ? "No logs match your current filters"
                    : "Install and run the Tracklify agent to start monitoring device activity"}
                </p>
                <Button variant="outline" onClick={fetchLogs}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
                </Button>
              </div>
            ) : (
              <div className="divide-y">
                {filteredLogs.map((log) => (
                  <div
                    key={log.id}
                    className={`p-4 transition-all duration-500 ${
                      newLogIds.has(log.id)
                        ? "bg-primary/10 border-l-4 border-l-primary animate-pulse"
                        : "hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
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
                          {newLogIds.has(log.id) && <Badge className="text-xs bg-green-500">New</Badge>}
                        </div>

                        <div className="font-mono text-sm bg-muted/50 rounded px-3 py-2 mb-2 border">
                          {log.keystroke}
                        </div>

                        {(log.application || log.window_title) && (
                          <div className="text-xs text-muted-foreground space-y-1">
                            {log.application && (
                              <div className="flex items-center gap-1">
                                <span className="font-medium">App:</span>
                                <span>{log.application}</span>
                              </div>
                            )}
                            {log.window_title && (
                              <div className="flex items-center gap-1">
                                <span className="font-medium">Window:</span>
                                <span className="truncate">{log.window_title}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground text-right">
                        <div>{format(new Date(log.created_at), "MMM dd")}</div>
                        <div>{format(new Date(log.created_at), "yyyy")}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          Showing {filteredLogs.length} of {logs.length} logs
        </div>
        <Button variant="outline" size="sm" onClick={fetchLogs} disabled={isLoading}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </CardFooter>
    </Card>
  )
}
