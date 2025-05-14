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
import { Flag, AlertTriangle, CheckCircle, Eye, Download } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"

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
  device?: string
  type?: string
}

interface AnomaliesListProps {
  severity?: "high" | "medium" | "low"
}

export function AnomaliesList({ severity }: AnomaliesListProps) {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<string>("newest")
  const supabase = createClient()

  // Fetch anomalies
  useEffect(() => {
    const fetchAnomalies = async () => {
      setLoading(true)

      try {
        const { data: userData } = await supabase.auth.getUser()

        if (!userData.user) return

        // Mock data for demonstration
        const mockAnomalies: Anomaly[] = [
          {
            id: "1",
            user_id: userData.user.id,
            description: "Unusual login attempt detected from unknown IP address",
            severity: "high",
            detected_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            resolved: false,
            resolved_at: null,
            resolved_by: null,
            user_email: userData.user.email,
            user_name: userData.user.user_metadata?.full_name || userData.user.email?.split("@")[0],
            device: "Windows 10, Chrome",
            type: "Authentication",
          },
          {
            id: "2",
            user_id: userData.user.id,
            description: "High CPU usage detected (95% for over 10 minutes)",
            severity: "medium",
            detected_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            resolved: false,
            resolved_at: null,
            resolved_by: null,
            user_email: userData.user.email,
            user_name: userData.user.user_metadata?.full_name || userData.user.email?.split("@")[0],
            device: "Windows 10",
            type: "Performance",
          },
          {
            id: "3",
            user_id: userData.user.id,
            description: "Potential data exfiltration: Large file upload to external service",
            severity: "high",
            detected_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
            resolved: false,
            resolved_at: null,
            resolved_by: null,
            user_email: userData.user.email,
            user_name: userData.user.user_metadata?.full_name || userData.user.email?.split("@")[0],
            device: "MacOS, Firefox",
            type: "Data Security",
          },
          {
            id: "4",
            user_id: userData.user.id,
            description: "Multiple failed login attempts",
            severity: "medium",
            detected_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
            resolved: true,
            resolved_at: new Date(Date.now() - 11 * 60 * 60 * 1000).toISOString(),
            resolved_by: userData.user.id,
            user_email: userData.user.email,
            user_name: userData.user.user_metadata?.full_name || userData.user.email?.split("@")[0],
            device: "iPhone, Safari",
            type: "Authentication",
          },
          {
            id: "5",
            user_id: userData.user.id,
            description: "Unusual file access pattern detected",
            severity: "low",
            detected_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            resolved: false,
            resolved_at: null,
            resolved_by: null,
            user_email: userData.user.email,
            user_name: userData.user.user_metadata?.full_name || userData.user.email?.split("@")[0],
            device: "Windows 10, Edge",
            type: "File Access",
          },
        ]

        // Filter by severity if provided
        const filteredAnomalies = severity ? mockAnomalies.filter((a) => a.severity === severity) : mockAnomalies

        setAnomalies(filteredAnomalies)
      } catch (error) {
        console.error("Error fetching anomalies:", error)
        toast.error("Failed to fetch anomalies")
      } finally {
        setLoading(false)
      }
    }

    fetchAnomalies()
  }, [severity, supabase])

  // Handle resolving an anomaly
  const handleResolve = async (anomalyId: string) => {
    try {
      const { data: userData } = await supabase.auth.getUser()

      if (!userData.user) {
        toast.error("User not authenticated")
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
                resolved_by: userData.user.id,
              }
            : a,
        ),
      )

      toast.success("Anomaly marked as resolved")
    } catch (error) {
      console.error("Error in resolve anomaly:", error)
      toast.error("Failed to resolve anomaly")
    }
  }

  // Export anomalies to CSV
  const exportToCSV = () => {
    try {
      // Create CSV content
      const headers = ["ID", "User", "Description", "Severity", "Detected At", "Status", "Device", "Type"]
      const csvContent = [
        headers.join(","),
        ...filteredAnomalies.map((a) =>
          [
            a.id,
            a.user_email,
            `"${a.description.replace(/"/g, '""')}"`,
            a.severity,
            new Date(a.detected_at).toLocaleString(),
            a.resolved ? "Resolved" : "Open",
            a.device,
            a.type,
          ].join(","),
        ),
      ].join("\n")

      // Create blob and download
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.setAttribute("href", url)
      link.setAttribute("download", `anomalies_export_${new Date().toISOString().split("T")[0]}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast.success("Anomalies exported to CSV")
    } catch (error) {
      console.error("Error exporting anomalies:", error)
      toast.error("Failed to export anomalies")
    }
  }

  // Filter anomalies based on search term and severity
  const filteredAnomalies = anomalies
    .filter((anomaly) => {
      const matchesSearch =
        (anomaly.user_email?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (anomaly.user_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        anomaly.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (anomaly.type?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (anomaly.device?.toLowerCase() || "").includes(searchTerm.toLowerCase())

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
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
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
        <Button variant="outline" size="sm" onClick={exportToCSV}>
          <Download className="mr-2 h-4 w-4" />
          Export to CSV
        </Button>
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
                          <p className="text-sm text-muted-foreground">{anomaly.device || "Unknown device"}</p>
                        </div>
                        <Badge
                          variant={getSeverityVariant(anomaly.severity)}
                          className="ml-auto flex items-center gap-1"
                        >
                          {getSeverityIcon(anomaly.severity)}
                          {anomaly.severity}
                        </Badge>
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-medium text-muted-foreground">{anomaly.type || "Unknown"}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(anomaly.detected_at), { addSuffix: true })}
                          </span>
                        </div>
                        <p>{anomaly.description}</p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between p-6 pt-0">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
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

                                <div className="text-muted-foreground">Device:</div>
                                <div>{anomaly.device || "Unknown"}</div>

                                <div className="text-muted-foreground">Type:</div>
                                <div>{anomaly.type || "Unknown"}</div>

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
