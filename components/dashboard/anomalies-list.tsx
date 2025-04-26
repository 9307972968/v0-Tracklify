"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Flag, AlertTriangle, CheckCircle, Eye } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"

interface Anomaly {
  id: string
  user_id: string
  description: string
  severity: "high" | "medium" | "low"
  detected_at: string
  resolved: boolean
  resolved_at: string | null
  resolved_by: string | null
  user_email?: string
  user_name?: string
}

interface AnomaliesListProps {
  severity?: "high" | "medium" | "low"
}

export function AnomaliesList({ severity }: AnomaliesListProps) {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<string>("newest")
  const [users, setUsers] = useState<Record<string, { email: string; name: string }>>({})
  const supabase = createClient()

  // Fetch anomalies
  useEffect(() => {
    const fetchAnomalies = async () => {
      setLoading(true)

      try {
        // Build query
        let query = supabase
          .from("anomalies")
          .select(`
            *,
            profiles:user_id (email, full_name)
          `)
          .order("detected_at", { ascending: false })

        // Apply severity filter if provided
        if (severity) {
          query = query.eq("severity", severity)
        }

        const { data, error } = await query

        if (error) {
          console.error("Error fetching anomalies:", error)
          return
        }

        if (data) {
          // Process anomalies
          const processedAnomalies = data.map((anomaly) => ({
            ...anomaly,
            user_email: anomaly.profiles?.email,
            user_name: anomaly.profiles?.full_name,
          }))

          setAnomalies(processedAnomalies)

          // Extract unique user IDs
          const userIds = Array.from(new Set(data.map((a) => a.user_id)))

          // Fetch user details if not already in profiles
          const usersToFetch = userIds.filter((id) => !data.some((a) => a.profiles?.email))

          if (usersToFetch.length > 0) {
            const { data: userData } = await supabase
              .from("profiles")
              .select("id, email, full_name")
              .in("id", usersToFetch)

            if (userData) {
              const userMap: Record<string, { email: string; name: string }> = {}
              userData.forEach((user) => {
                userMap[user.id] = {
                  email: user.email,
                  name: user.full_name || user.email.split("@")[0],
                }
              })

              setUsers(userMap)
            }
          }
        }
      } catch (error) {
        console.error("Error in anomalies fetch:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnomalies()

    // Set up real-time subscription
    const channel = supabase
      .channel("anomalies_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "anomalies",
        },
        async (payload) => {
          if (payload.eventType === "INSERT") {
            // Fetch user details for the new anomaly
            const { data: userData } = await supabase
              .from("profiles")
              .select("email, full_name")
              .eq("id", payload.new.user_id)
              .single()

            const newAnomaly = {
              ...payload.new,
              user_email: userData?.email,
              user_name: userData?.full_name,
            }

            // Add new anomaly to the list
            setAnomalies((prev) => [newAnomaly, ...prev])
          } else if (payload.eventType === "UPDATE") {
            // Update the anomaly in the list
            setAnomalies((prev) => prev.map((a) => (a.id === payload.new.id ? { ...a, ...payload.new } : a)))
          } else if (payload.eventType === "DELETE") {
            // Remove the anomaly from the list
            setAnomalies((prev) => prev.filter((a) => a.id !== payload.old.id))
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [severity, supabase])

  // Handle resolving an anomaly
  const handleResolve = async (anomalyId: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        console.error("User not authenticated")
        return
      }

      const { error } = await supabase
        .from("anomalies")
        .update({
          resolved: true,
          resolved_at: new Date().toISOString(),
          resolved_by: user.id,
        })
        .eq("id", anomalyId)

      if (error) {
        console.error("Error resolving anomaly:", error)
        return
      }

      // Update local state
      setAnomalies((prev) =>
        prev.map((a) =>
          a.id === anomalyId
            ? {
                ...a,
                resolved: true,
                resolved_at: new Date().toISOString(),
                resolved_by: user.id,
              }
            : a,
        ),
      )
    } catch (error) {
      console.error("Error in resolve anomaly:", error)
    }
  }

  // Filter and sort anomalies
  const filteredAnomalies = anomalies
    .filter((anomaly) => {
      const matchesSearch =
        (anomaly.user_email?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (anomaly.user_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        anomaly.description.toLowerCase().includes(searchTerm.toLowerCase())

      return matchesSearch
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.detected_at).getTime() - new Date(a.detected_at).getTime()
        case "oldest":
          return new Date(a.detected_at).getTime() - new Date(b.detected_at).getTime()
        case "severity":
          const severityOrder = { high: 3, medium: 2, low: 1 }
          return severityOrder[b.severity] - severityOrder[a.severity]
        default:
          return 0
      }
    })

  // Get severity badge variant
  const getSeverityVariant = (severity: string) => {
    switch (severity) {
      case "high":
        return "destructive"
      case "medium":
        return "outline"
      case "low":
        return "secondary"
      default:
        return "secondary"
    }
  }

  // Get severity icon
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "high":
        return <AlertTriangle className="h-4 w-4" />
      case "medium":
        return <Flag className="h-4 w-4" />
      case "low":
        return <CheckCircle className="h-4 w-4" />
      default:
        return <CheckCircle className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Search anomalies..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="sm:max-w-xs"
        />
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="sm:max-w-xs">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest first</SelectItem>
            <SelectItem value="oldest">Oldest first</SelectItem>
            <SelectItem value="severity">Severity</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="relative overflow-hidden">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[150px]" />
                      <Skeleton className="h-4 w-[100px]" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-[80%]" />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between p-6 pt-0">
                <Skeleton className="h-8 w-[100px]" />
                <Skeleton className="h-8 w-[100px]" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : filteredAnomalies.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          <AnimatePresence>
            {filteredAnomalies.map((anomaly) => (
              <motion.div
                key={anomaly.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <Card className={`relative overflow-hidden ${anomaly.resolved ? "bg-muted/50" : ""}`}>
                  {anomaly.resolved && (
                    <div className="absolute top-0 right-0 bg-green-500 text-white px-2 py-1 text-xs">Resolved</div>
                  )}
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarImage src={`https://avatar.vercel.sh/${anomaly.user_id}`} />
                          <AvatarFallback>
                            {(anomaly.user_name || anomaly.user_email || "").substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium">
                            {anomaly.user_name || anomaly.user_email?.split("@")[0] || "Unknown User"}
                          </h3>
                          <p className="text-sm text-muted-foreground">{anomaly.user_email || "No email"}</p>
                        </div>
                        <Badge
                          variant={getSeverityVariant(anomaly.severity)}
                          className="ml-auto flex items-center gap-1"
                        >
                          {getSeverityIcon(anomaly.severity)}
                          {anomaly.severity}
                        </Badge>
                      </div>
                      <p>{anomaly.description}</p>
                      <p className="text-sm text-muted-foreground">
                        Detected: {new Date(anomaly.detected_at).toLocaleString()}
                      </p>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between p-6 pt-0">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" disabled={anomaly.resolved}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Anomaly Details</AlertDialogTitle>
                          <AlertDialogDescription>
                            <div className="space-y-4 py-4">
                              <div className="grid grid-cols-2 gap-2">
                                <div className="text-muted-foreground">User:</div>
                                <div>{anomaly.user_name || anomaly.user_email}</div>

                                <div className="text-muted-foreground">Severity:</div>
                                <div>
                                  <Badge variant={getSeverityVariant(anomaly.severity)}>{anomaly.severity}</Badge>
                                </div>

                                <div className="text-muted-foreground">Detected:</div>
                                <div>{new Date(anomaly.detected_at).toLocaleString()}</div>

                                <div className="text-muted-foreground">Status:</div>
                                <div>{anomaly.resolved ? "Resolved" : "Open"}</div>

                                {anomaly.resolved && (
                                  <>
                                    <div className="text-muted-foreground">Resolved at:</div>
                                    <div>{new Date(anomaly.resolved_at || "").toLocaleString()}</div>
                                  </>
                                )}
                              </div>

                              <div>
                                <div className="text-muted-foreground mb-2">Description:</div>
                                <div className="p-3 bg-muted rounded-md">{anomaly.description}</div>
                              </div>
                            </div>
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Close</AlertDialogCancel>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                    {!anomaly.resolved && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm">
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Resolve
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Resolve Anomaly</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to mark this anomaly as resolved? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleResolve(anomaly.id)}>Resolve</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-[200px] bg-muted/20 rounded-lg">
          <p className="text-muted-foreground">No anomalies found.</p>
          <p className="text-sm text-muted-foreground">Any detected anomalies will appear here.</p>
        </div>
      )}
    </div>
  )
}
