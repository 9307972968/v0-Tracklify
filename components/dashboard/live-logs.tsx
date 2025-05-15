"use client"

import { useState, useEffect } from "react"
import { Download, Search } from "lucide-react"
import { format } from "date-fns"
import { useRealTimeLogs } from "@/hooks/use-real-time-logs"
import { useDebounce } from "@/hooks/use-debounce"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { LiveIndicator } from "@/components/ui/live-indicator"
import { LogItem } from "@/components/dashboard/log-item"
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
import { toast } from "@/components/ui/use-toast"

export function LiveLogs() {
  const [searchTerm, setSearchTerm] = useState("")
  const [deviceId, setDeviceId] = useState<string>("")
  const debouncedSearchTerm = useDebounce(searchTerm, 500)

  const { logs, isLoading, error, isRealTimeConnected } = useRealTimeLogs({
    searchTerm: debouncedSearchTerm,
    deviceId: deviceId || undefined,
    limit: 100,
  })

  // Track new logs for highlighting
  const [newLogIds, setNewLogIds] = useState<Set<string>>(new Set())

  // Update newLogIds when logs change
  useEffect(() => {
    if (logs.length > 0) {
      const latestLogId = logs[0].id
      setNewLogIds((prev) => {
        const updated = new Set(prev)
        updated.add(latestLogId)
        return updated
      })

      // Remove highlight after animation completes
      const timer = setTimeout(() => {
        setNewLogIds((prev) => {
          const updated = new Set(prev)
          updated.delete(latestLogId)
          return updated
        })
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [logs])

  const handleExportLogs = () => {
    try {
      // Convert logs to CSV
      const headers = ["ID", "Timestamp", "Device ID", "Keystroke"]
      const csvContent =
        headers.join(",") +
        "\n" +
        logs
          .map((log) => {
            return [
              log.id,
              log.created_at,
              log.device_id,
              // Escape quotes in keystroke
              `"${log.keystroke.replace(/"/g, '""')}"`,
            ].join(",")
          })
          .join("\n")

      // Create a blob and download link
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.setAttribute("href", url)
      link.setAttribute("download", `tracklify-logs-${format(new Date(), "yyyy-MM-dd-HH-mm")}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "Logs Exported",
        description: `${logs.length} logs exported to CSV successfully.`,
      })
    } catch (error) {
      console.error("Error exporting logs:", error)
      toast({
        title: "Export Failed",
        description: "Failed to export logs. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle>Live Logs</CardTitle>
          <CardDescription>Real-time keystroke logs from all agents</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <LiveIndicator isLive={isRealTimeConnected} />
          <Button variant="outline" size="sm" onClick={handleExportLogs} disabled={logs.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-col gap-2 sm:flex-row">
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
                <SelectItem value="device-1">Device 1</SelectItem>
                <SelectItem value="device-2">Device 2</SelectItem>
                <SelectItem value="device-3">Device 3</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            Error loading logs: {error}
          </div>
        )}

        <div className="space-y-2">
          {isLoading ? (
            // Loading skeletons
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="space-y-1 rounded-md border border-border p-3">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-4 w-full" />
              </div>
            ))
          ) : logs.length === 0 ? (
            <div className="flex h-40 items-center justify-center rounded-md border border-dashed text-center">
              <div className="mx-auto flex max-w-xs flex-col items-center justify-center space-y-1 px-4 py-4 text-center">
                <p className="text-sm text-muted-foreground">No logs found</p>
                <p className="text-xs text-muted-foreground">
                  {searchTerm || deviceId ? "Try adjusting your search or filter" : "Waiting for logs from agents..."}
                </p>
              </div>
            </div>
          ) : (
            logs.map((log) => <LogItem key={log.id} log={log} isNew={newLogIds.has(log.id)} />)
          )}
        </div>
      </CardContent>
    </Card>
  )
}
