"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface User {
  id: string
  email: string
  full_name: string | null
  role: string
  risk_score: number
  created_at: string
  updated_at: string
}

interface UserProfileProps {
  user: User
}

export function UserProfile({ user }: UserProfileProps) {
  const [activityData, setActivityData] = useState<any[]>([])
  const [recentLogs, setRecentLogs] = useState<any[]>([])
  const [anomalies, setAnomalies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true)

      try {
        // Fetch activity data (last 14 days)
        const now = new Date()
        const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

        const { data: logs } = await supabase
          .from("keystroke_logs")
          .select("*")
          .eq("user_id", user.id)
          .gte("timestamp", fourteenDaysAgo.toISOString())
          .order("timestamp", { ascending: true })

        if (logs) {
          // Group logs by day
          const groupedByDay = logs.reduce((acc: any, log) => {
            const date = new Date(log.timestamp).toISOString().split("T")[0]

            if (!acc[date]) {
              acc[date] = {
                date,
                keystrokes: 0,
                applications: new Set(),
              }
            }

            acc[date].keystrokes += log.keys.length
            acc[date].applications.add(log.application)

            return acc
          }, {})

          // Convert to array and calculate final values
          const activityArray = Object.values(groupedByDay).map((day: any) => ({
            ...day,
            applications: day.applications.size,
          }))

          setActivityData(activityArray)

          // Set recent logs (last 10)
          setRecentLogs(logs.slice(-10).reverse())
        }

        // Fetch anomalies
        const { data: anomalyData } = await supabase
          .from("anomalies")
          .select("*")
          .eq("user_id", user.id)
          .order("detected_at", { ascending: false })
          .limit(5)

        if (anomalyData) {
          setAnomalies(anomalyData)
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [user.id, supabase])

  return (
    <div className="space-y-6">
      {/* User Header */}
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={`https://avatar.vercel.sh/${user.id}`} />
          <AvatarFallback>{(user.full_name || user.email || "").substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-2xl font-bold">{user.full_name || "Unnamed User"}</h2>
          <p className="text-muted-foreground">{user.email}</p>
          <div className="flex items-center gap-2 mt-1">
            <Badge>{user.role}</Badge>
            <span className="text-sm text-muted-foreground">
              Member since {new Date(user.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* User Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Risk Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user.risk_score}%</div>
            <p className="text-xs text-muted-foreground">
              {user.risk_score < 30 ? "Low risk user" : user.risk_score < 70 ? "Medium risk user" : "High risk user"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {activityData.reduce((sum, day) => sum + day.keystrokes, 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">Keystrokes in the last 14 days</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Anomalies</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">{anomalies.length}</div>
                <p className="text-xs text-muted-foreground">Detected anomalies</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different sections */}
      <Tabs defaultValue="activity" className="space-y-4">
        <TabsList>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="logs">Recent Logs</TabsTrigger>
          <TabsTrigger value="anomalies">Anomalies</TabsTrigger>
        </TabsList>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Activity Over Time</CardTitle>
              <CardDescription>User's keystroke activity over the last 14 days</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-[350px] w-full" />
              ) : (
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={activityData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="keystrokes" stroke="#000000" strokeWidth={2} name="Keystrokes" />
                      <Line
                        type="monotone"
                        dataKey="applications"
                        stroke="#3B82F6"
                        strokeWidth={2}
                        name="Applications Used"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Logs Tab */}
        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Recent Logs</CardTitle>
              <CardDescription>The most recent keystroke logs for this user</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-[350px] w-full" />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Application</TableHead>
                      <TableHead>Window</TableHead>
                      <TableHead>Keys</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentLogs.length > 0 ? (
                      recentLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="font-mono text-xs">
                            {new Date(log.timestamp).toLocaleString()}
                          </TableCell>
                          <TableCell>{log.application}</TableCell>
                          <TableCell className="max-w-[200px] truncate">{log.window_title || "N/A"}</TableCell>
                          <TableCell className="max-w-[200px] truncate">{log.keys}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
                          No logs found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Anomalies Tab */}
        <TabsContent value="anomalies">
          <Card>
            <CardHeader>
              <CardTitle>Detected Anomalies</CardTitle>
              <CardDescription>Unusual behavior detected for this user</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-[350px] w-full" />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Detected At</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {anomalies.length > 0 ? (
                      anomalies.map((anomaly) => (
                        <TableRow key={anomaly.id}>
                          <TableCell className="font-mono text-xs">
                            {new Date(anomaly.detected_at).toLocaleString()}
                          </TableCell>
                          <TableCell>{anomaly.description}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                anomaly.severity === "high"
                                  ? "destructive"
                                  : anomaly.severity === "medium"
                                    ? "outline"
                                    : "secondary"
                              }
                            >
                              {anomaly.severity}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {anomaly.resolved ? (
                              <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                                Resolved
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="bg-orange-500/10 text-orange-500 border-orange-500/20"
                              >
                                Open
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
                          No anomalies found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
