"use client"

import { useState, useEffect, useRef } from "react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { createClient } from "@/lib/supabase/client"
import { motion, AnimatePresence } from "framer-motion"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Copy, Download, PauseCircle, PlayCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

type LogSeverity = "info" | "warning" | "critical" | undefined

interface Log {
  id: string
  timestamp: string
  user_id?: string
  user?: string
  application: string
  window_title?: string | null
  keys: string
  severity?: "info" | "warning" | "critical"
  user_email?: string
}

interface LiveLogsProps {
  severity?: LogSeverity
}

export function LiveLogs({ severity }: LiveLogsProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [applicationFilter, setApplicationFilter] = useState<string>("all")
  const [timeRange, setTimeRange] = useState<string>("1h")
  const [logs, setLogs] = useState<Log[]>([])
  const [uniqueApplications, setUniqueApplications] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [autoScroll, setAutoScroll] = useState(true)
  const tableEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  // Mock data for demonstration
  const mockLogs: Log[] = [
    {
      id: "1",
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      user: "john.doe@example.com",
      application: "Microsoft Word",
      window_title: "Document1.docx - Microsoft Word",
      keys: "This is a sample keystroke log for testing purposes.",
      severity: "info",
    },
    {
      id: "2",
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      user: "jane.smith@example.com",
      application: "Google Chrome",
      window_title: "Gmail - Inbox",
      keys: "Composing an email to the team about the project status.",
      severity: "info",
    },
    {
      id: "3",
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      user: "robert.johnson@example.com",
      application: "File Explorer",
      window_title: "C:\\Users\\Robert\\Documents",
      keys: "password123",
      severity: "critical",
    },
    {
      id: "4",
      timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      user: "emily.davis@example.com",
      application: "Outlook",
      window_title: "Inbox - emily.davis@example.com",
      keys: "Sending email with attachment",
      severity: "info",
    },
    {
      id: "5",
      timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      user: "michael.wilson@example.com",
      application: "Command Prompt",
      window_title: "C:\\Windows\\System32\\cmd.exe",
      keys: "cd /d C:\\Users\\Michael\\Documents && del /f /q secret.txt",
      severity: "warning",
    },
    {
      id: "6",
      timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
      user: "sarah.brown@example.com",
      application: "Slack",
      window_title: "Tracklify Team - Slack",
      keys: "Hey team, just finished the new feature implementation!",
      severity: "info",
    },
    {
      id: "7",
      timestamp: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
      user: "david.miller@example.com",
      application: "Visual Studio Code",
      window_title: "project.tsx - tracklify",
      keys: 'function handleSubmit() { console.log("Form submitted"); }',
      severity: "info",
    },
    {
      id: "8",
      timestamp: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
      user: "jennifer.taylor@example.com",
      application: "FileZilla",
      window_title: "FileZilla - Connecting to ftp.example.com",
      keys: "username: admin\npassword: securePassword!23",
      severity: "critical",
    },
  ]

  // Fetch logs based on filters
  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true)
      setError(null)

      try {
        // Filter mock logs based on severity and time range
        let filteredLogs = [...mockLogs]

        // Apply severity filter if provided
        if (severity) {
          filteredLogs = filteredLogs.filter((log) => log.severity === severity)
        }

        // Apply time range filter
        const now = new Date()
        let startTime: Date

        switch (timeRange) {
          case "1h":
            startTime = new Date(now.getTime() - 60 * 60 * 1000)
            break
          case "24h":
            startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000)
            break
          case "7d":
            startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            break
          case "30d":
            startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
            break
          default:
            startTime = new Date(now.getTime() - 60 * 60 * 1000)
        }

        filteredLogs = filteredLogs.filter((log) => new Date(log.timestamp) >= startTime)

        // Apply application filter if not "all"
        if (applicationFilter !== "all") {
          filteredLogs = filteredLogs.filter((log) => log.application === applicationFilter)
        }

        setLogs(filteredLogs)

        // Extract unique applications
        const apps = Array.from(new Set(mockLogs.map((log) => log.application)))
        setUniqueApplications(apps)
      } catch (error) {
        console.error("Error in logs fetch:", error)
        setError(`An unexpected error occurred: ${error instanceof Error ? error.message : String(error)}`)
      } finally {
        setLoading(false)
      }
    }

    fetchLogs()

    // Simulate real-time logs
    const interval = setInterval(() => {
      const newLog: Log = {
        id: `new-${Date.now()}`,
        timestamp: new Date().toISOString(),
        user: ["john.doe@example.com", "jane.smith@example.com", "robert.johnson@example.com"][
          Math.floor(Math.random() * 3)
        ],
        application: ["Microsoft Word", "Google Chrome", "Visual Studio Code", "Slack", "Terminal"][
          Math.floor(Math.random() * 5)
        ],
        window_title: "Active Window",
        keys: `New activity at ${new Date().toLocaleTimeString()}`,
        severity: ["info", "warning", "critical"][Math.floor(Math.random() * 3)] as "info" | "warning" | "critical",
      }

      // Add new log if it matches the severity filter
      if (!severity || newLog.severity === severity) {
        setLogs((prevLogs) => [newLog, ...prevLogs].slice(0, 100))
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [severity, timeRange, applicationFilter])

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (autoScroll && tableEndRef.current) {
      tableEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [logs, autoScroll])

  // Copy log to clipboard
  const copyLogToClipboard = (log: Log) => {
    const logText = `[${new Date(log.timestamp).toLocaleString()}] [${log.severity?.toUpperCase() || "INFO"}] [${
      log.application
    }] ${log.keys}`
    navigator.clipboard.writeText(logText)
    toast.success("Log copied to clipboard")
  }

  // Export logs to CSV
  const exportLogsToCSV = () => {
    try {
      // Create CSV content
      const headers = ["Timestamp", "User", "Application", "Window", "Keys", "Severity"]
      const csvContent = [
        headers.join(","),
        ...filteredLogs.map((log) =>
          [
            new Date(log.timestamp).toLocaleString(),
            log.user || "Unknown",
            log.application,
            `"${(log.window_title || "").replace(/"/g, '""')}"`,
            `"${log.keys.replace(/"/g, '""')}"`,
            log.severity || "info",
          ].join(","),
        ),
      ].join("\n")

      // Create blob and download
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.setAttribute("href", url)
      link.setAttribute("download", `logs_export_${new Date().toISOString().split("T")[0]}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast.success("Logs exported to CSV")
    } catch (error) {
      console.error("Error exporting logs:", error)
      toast.error("Failed to export logs")
    }
  }

  // Filter logs based on search term
  const filteredLogs = logs
    .filter((log) => {
      const matchesSearch =
        (log.user?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        log.application.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.window_title?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        log.keys.toLowerCase().includes(searchTerm.toLowerCase())

      return matchesSearch
    })
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="sm:max-w-xs"
          />
          <Select value={applicationFilter} onValueChange={setApplicationFilter}>
            <SelectTrigger className="sm:max-w-xs">
              <SelectValue placeholder="Filter by application" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Applications</SelectItem>
              {uniqueApplications.map((app) => (
                <SelectItem key={app} value={app}>
                  {app}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="sm:max-w-xs">
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last hour</SelectItem>
              <SelectItem value="24h">Last 24 hours</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2 items-center">
          <div className="flex items-center space-x-2">
            <Switch id="auto-scroll" checked={autoScroll} onCheckedChange={setAutoScroll} />
            <Label htmlFor="auto-scroll">Auto-scroll</Label>
          </div>
          <Button variant="outline" size="sm" onClick={exportLogsToCSV}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setAutoScroll(!autoScroll)}
            title={autoScroll ? "Pause auto-scroll" : "Resume auto-scroll"}
          >
            {autoScroll ? <PauseCircle className="h-4 w-4" /> : <PlayCircle className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <div className="rounded-md border overflow-hidden">
        <div className="max-h-[600px] overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-background">
              <TableRow>
                <TableHead className="w-[180px]">Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Application</TableHead>
                <TableHead>Window</TableHead>
                <TableHead>Keys</TableHead>
                <TableHead className="w-[100px]">Severity</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                // Loading skeletons
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={`skeleton-${index}`}>
                    <TableCell>
                      <Skeleton className="h-4 w-[120px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[150px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[100px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[180px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[100px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[80px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-8" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredLogs.length > 0 ? (
                <AnimatePresence>
                  {filteredLogs.map((log) => (
                    <motion.tr
                      key={log.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                    >
                      <TableCell className="font-mono text-xs">{new Date(log.timestamp).toLocaleString()}</TableCell>
                      <TableCell>{log.user || "Unknown"}</TableCell>
                      <TableCell>{log.application}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{log.window_title || "N/A"}</TableCell>
                      <TableCell className="max-w-[200px] truncate font-mono text-xs">{log.keys}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            log.severity === "critical"
                              ? "destructive"
                              : log.severity === "warning"
                                ? "outline"
                                : "secondary"
                          }
                        >
                          {log.severity || "info"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => copyLogToClipboard(log)} title="Copy log">
                          <Copy className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No logs found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <div ref={tableEndRef} />
        </div>
      </div>
    </div>
  )
}
