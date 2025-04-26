"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { createClient } from "@/lib/supabase/client"
import { motion, AnimatePresence } from "framer-motion"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Info } from "lucide-react"
import { Button } from "@/components/ui/button"

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

// Mock data for when the database table doesn't exist
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
  const [useMockData, setUseMockData] = useState(true) // Default to mock data
  const [showSqlInstructions, setShowSqlInstructions] = useState(false)
  const supabase = createClient()

  // Fetch logs based on filters
  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true)
      setError(null)

      // Start with mock data by default
      if (useMockData) {
        setLogs(mockLogs)
        setUniqueApplications(Array.from(new Set(mockLogs.map((log) => log.application))))
        setLoading(false)
        return
      }

      // Calculate time range
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

      try {
        // Query logs with filters
        let query = supabase
          .from("keystroke_logs")
          .select("*")
          .gte("timestamp", startTime.toISOString())
          .order("timestamp", { ascending: false })
          .limit(100)

        // Apply application filter if not "all"
        if (applicationFilter !== "all") {
          query = query.eq("application", applicationFilter)
        }

        const { data: logsData, error: logsError } = await query

        if (logsError) {
          console.error("Error fetching logs:", logsError)
          setError(`Error fetching logs: ${logsError.message}`)
          setUseMockData(true)

          // Use mock data
          setLogs(mockLogs)
          setUniqueApplications(Array.from(new Set(mockLogs.map((log) => log.application))))
          return
        }

        // Process logs and fetch user emails separately
        if (logsData && logsData.length > 0) {
          // Get unique user IDs
          const userIds = Array.from(new Set(logsData.map((log) => log.user_id)))

          // Fetch user emails in a separate query
          const { data: userData, error: userError } = await supabase
            .from("profiles")
            .select("id, email")
            .in("id", userIds)

          if (userError) {
            console.error("Error fetching user data:", userError)
          }

          // Create a map of user IDs to emails
          const userEmailMap = new Map()
          if (userData) {
            userData.forEach((user) => {
              userEmailMap.set(user.id, user.email)
            })
          }

          // Process logs with user emails
          const processedLogs = logsData.map((log) => ({
            ...log,
            user_email: userEmailMap.get(log.user_id) || log.user_id,
            // Determine severity based on content (this is a simple example)
            severity:
              log.keys.includes("password") || log.keys.includes("secret")
                ? "critical"
                : log.keys.length > 50
                  ? "warning"
                  : "info",
          }))

          setLogs(processedLogs)
          setUseMockData(false)

          // Extract unique applications
          const apps = Array.from(new Set(logsData.map((log) => log.application)))
          setUniqueApplications(apps)
        } else {
          // No logs found in the database
          setLogs([])
          setUseMockData(false)
          setUniqueApplications([])
        }
      } catch (error) {
        console.error("Error in logs fetch:", error)
        setError(`An unexpected error occurred: ${error instanceof Error ? error.message : String(error)}`)
        setUseMockData(true)

        // Use mock data
        setLogs(mockLogs)
        setUniqueApplications(Array.from(new Set(mockLogs.map((log) => log.application))))
      } finally {
        setLoading(false)
      }
    }

    fetchLogs()

    // Only set up real-time subscription if we're not using mock data
    if (!useMockData) {
      const channel = supabase
        .channel("keystroke_logs_changes")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "keystroke_logs",
          },
          async (payload) => {
            try {
              // Fetch user email for the new log
              const { data: userData } = await supabase
                .from("profiles")
                .select("email")
                .eq("id", payload.new.user_id)
                .single()

              const newLog = {
                ...payload.new,
                user_email: userData?.email || payload.new.user_id,
                severity:
                  payload.new.keys.includes("password") || payload.new.keys.includes("secret")
                    ? "critical"
                    : payload.new.keys.length > 50
                      ? "warning"
                      : "info",
              }

              // Add new log to the top of the list
              setLogs((prevLogs) => [newLog, ...prevLogs].slice(0, 100))

              // Update unique applications if needed
              if (!uniqueApplications.includes(payload.new.application)) {
                setUniqueApplications((prev) => [...prev, payload.new.application])
              }
            } catch (error) {
              console.error("Error processing real-time log:", error)
            }
          },
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [supabase, timeRange, applicationFilter, useMockData])

  // Filter logs based on search term and severity
  const filteredLogs = logs.filter((log) => {
    const matchesSeverity = severity ? log.severity === severity : true
    const matchesSearch =
      (log.user_email?.toLowerCase() || log.user?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      log.application.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.window_title?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      log.keys.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesSeverity && matchesSearch
  })

  const sqlScript = `
-- Create keystroke_logs table
CREATE TABLE IF NOT EXISTS public.keystroke_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  application VARCHAR(255) NOT NULL,
  window_title TEXT,
  keys TEXT NOT NULL,
  encrypted_data TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  ip_address VARCHAR(45),
  device_info JSONB
);

-- Add RLS policies
ALTER TABLE public.keystroke_logs ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own logs
CREATE POLICY read_own_logs ON public.keystroke_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to insert their own logs
CREATE POLICY insert_own_logs ON public.keystroke_logs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow service role to manage all logs
CREATE POLICY service_role_manage_logs ON public.keystroke_logs
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Add some sample data for testing
INSERT INTO public.keystroke_logs (user_id, application, window_title, keys, timestamp)
SELECT 
  auth.uid(),
  'Microsoft Word',
  'Document1.docx - Microsoft Word',
  'This is a sample keystroke log for testing purposes.',
  NOW() - (random() * interval '3 days')
FROM auth.users
WHERE email = (SELECT email FROM auth.users LIMIT 1)
LIMIT 1;

INSERT INTO public.keystroke_logs (user_id, application, window_title, keys, timestamp)
SELECT 
  auth.uid(),
  'Google Chrome',
  'Gmail - Inbox',
  'Composing an email to the team about the project status.',
  NOW() - (random() * interval '2 days')
FROM auth.users
WHERE email = (SELECT email FROM auth.users LIMIT 1)
LIMIT 1;

INSERT INTO public.keystroke_logs (user_id, application, window_title, keys, timestamp)
SELECT 
  auth.uid(),
  'Visual Studio Code',
  'project.tsx - tracklify',
  'function handleSubmit() { console.log("Form submitted"); }',
  NOW() - (random() * interval '1 day')
FROM auth.users
WHERE email = (SELECT email FROM auth.users LIMIT 1)
LIMIT 1;
`

  return (
    <div className="space-y-4">
      {useMockData && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Sample Data</AlertTitle>
          <AlertDescription className="flex flex-col gap-2">
            <p>
              Displaying sample data. The <code>keystroke_logs</code> table doesn't exist in your database yet.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSqlInstructions(!showSqlInstructions)}
              className="w-fit"
            >
              {showSqlInstructions ? "Hide SQL Instructions" : "Show SQL Instructions"}
            </Button>
            {showSqlInstructions && (
              <div className="mt-2 rounded-md bg-muted p-4">
                <p className="mb-2 text-sm">Run the following SQL in your Supabase SQL Editor to create the table:</p>
                <pre className="max-h-60 overflow-auto rounded-md bg-black p-4 text-xs text-white">
                  <code>{sqlScript}</code>
                </pre>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

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

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Application</TableHead>
              <TableHead>Window</TableHead>
              <TableHead>Keys</TableHead>
              <TableHead>Severity</TableHead>
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
                    <TableCell>{log.user_email || log.user || log.user_id}</TableCell>
                    <TableCell>{log.application}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{log.window_title || "N/A"}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{log.keys}</TableCell>
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
                        {log.severity}
                      </Badge>
                    </TableCell>
                  </motion.tr>
                ))}
              </AnimatePresence>
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No logs found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
