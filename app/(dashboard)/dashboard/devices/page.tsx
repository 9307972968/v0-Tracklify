"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, Smartphone, Monitor, Laptop, Activity, AlertCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/context/SupabaseProvider"
import { toast } from "sonner"

interface Device {
  id: string
  device_id: string
  device_name: string
  os_type: string
  last_seen: string
  status: "online" | "offline"
  agent_version: string
}

export default function DevicesPage() {
  const [devices, setDevices] = useState<Device[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const supabase = createClient()

  useEffect(() => {
    if (user) {
      fetchDevices()
      setupRealtimeSubscription()
    }
  }, [user])

  const fetchDevices = async () => {
    try {
      // For now, we'll show mock devices since the devices table might not exist
      const mockDevices: Device[] = [
        {
          id: "1",
          device_id: "DESKTOP-ABC123",
          device_name: "Faculty Workstation",
          os_type: "Windows 11",
          last_seen: new Date().toISOString(),
          status: "online",
          agent_version: "1.0.0",
        },
        {
          id: "2",
          device_id: "LAB-PC-456",
          device_name: "Lab Computer 1",
          os_type: "Windows 10",
          last_seen: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
          status: "offline",
          agent_version: "1.0.0",
        },
      ]
      setDevices(mockDevices)
    } catch (error) {
      console.error("Error fetching devices:", error)
      toast.error("Failed to load devices")
    } finally {
      setLoading(false)
    }
  }

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel("device-status")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "agent_logs",
        },
        (payload) => {
          // Update device last seen when new logs arrive
          if (payload.new) {
            setDevices((prev) =>
              prev.map((device) =>
                device.device_id === payload.new.device_id
                  ? { ...device, last_seen: payload.new.created_at, status: "online" }
                  : device,
              ),
            )
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  const getDeviceIcon = (osType: string) => {
    if (osType.toLowerCase().includes("windows") || osType.toLowerCase().includes("mac")) {
      return <Monitor className="h-5 w-5" />
    }
    if (osType.toLowerCase().includes("android") || osType.toLowerCase().includes("ios")) {
      return <Smartphone className="h-5 w-5" />
    }
    return <Laptop className="h-5 w-5" />
  }

  const getStatusBadge = (status: string, lastSeen: string) => {
    const lastSeenDate = new Date(lastSeen)
    const now = new Date()
    const diffMinutes = (now.getTime() - lastSeenDate.getTime()) / (1000 * 60)

    if (diffMinutes < 5) {
      return <Badge className="bg-green-500 hover:bg-green-600">Online</Badge>
    } else if (diffMinutes < 30) {
      return <Badge variant="secondary">Recently Active</Badge>
    } else {
      return <Badge variant="destructive">Offline</Badge>
    }
  }

  const handleDownloadAgent = () => {
    // Create a download link for the agent
    const link = document.createElement("a")
    link.href = "/agent/tracklify-agent.zip"
    link.download = "tracklify-agent.zip"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success("Agent download started")
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Device Management</h2>
        <Button onClick={handleDownloadAgent} className="gap-2">
          <Download className="h-4 w-4" />
          Download Agent
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Devices</CardTitle>
            <Monitor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{devices.length}</div>
            <p className="text-xs text-muted-foreground">
              {devices.filter((d) => d.status === "online").length} online
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{devices.filter((d) => d.status === "online").length}</div>
            <p className="text-xs text-muted-foreground">Currently monitoring</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alerts</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{devices.filter((d) => d.status === "offline").length}</div>
            <p className="text-xs text-muted-foreground">Devices offline</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Connected Devices</CardTitle>
          <CardDescription>Manage and monitor all devices running the Tracklify agent</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                  <div className="h-10 w-10 bg-muted rounded-full animate-pulse" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-muted rounded animate-pulse" />
                    <div className="h-3 bg-muted rounded w-1/2 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : devices.length === 0 ? (
            <div className="text-center py-8">
              <Monitor className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No devices connected</h3>
              <p className="text-muted-foreground mb-4">
                Download and install the Tracklify agent to start monitoring devices
              </p>
              <Button onClick={handleDownloadAgent} className="gap-2">
                <Download className="h-4 w-4" />
                Download Agent
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {devices.map((device) => (
                <div key={device.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-muted rounded-full">{getDeviceIcon(device.os_type)}</div>
                    <div>
                      <h4 className="font-semibold">{device.device_name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {device.device_id} • {device.os_type}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Last seen: {new Date(device.last_seen).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(device.status, device.last_seen)}
                    <Badge variant="outline">v{device.agent_version}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
