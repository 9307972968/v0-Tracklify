"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { toast } from "sonner"
import { Download, Edit, MoreHorizontal, RefreshCw, Trash } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface Agent {
  id: string
  created_at: string
  user_id: string
  device_name: string
  platform: string
  last_active: string | null
  is_active: boolean
  is_revoked: boolean
  keylogging_enabled: boolean
  full_monitoring: boolean
}

export function AgentManagement() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null)
  const [newDeviceName, setNewDeviceName] = useState("")
  const [isRenaming, setIsRenaming] = useState(false)
  const [isDownloadDialogOpen, setIsDownloadDialogOpen] = useState(false)
  const [selectedPlatform, setSelectedPlatform] = useState<string>("windows")
  const supabase = createClient()

  // Fetch agents
  const fetchAgents = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.from("agents").select("*").order("created_at", { ascending: false })

      if (error) {
        throw error
      }

      setAgents(data || [])
    } catch (error) {
      console.error("Error fetching agents:", error)
      toast.error("Failed to load agents")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAgents()

    // Set up real-time subscription
    const channel = supabase
      .channel("agents-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "agents",
        },
        (payload) => {
          console.log("Real-time update received:", payload)
          fetchAgents() // Refresh the list when changes occur
        },
      )
      .subscribe((status) => {
        console.log("Agents subscription status:", status)
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  // Toggle agent active status
  const toggleAgentActive = async (agent: Agent) => {
    try {
      const { error } = await supabase.from("agents").update({ is_active: !agent.is_active }).eq("id", agent.id)

      if (error) {
        throw error
      }

      // Update local state for immediate UI feedback
      setAgents((prev) => prev.map((a) => (a.id === agent.id ? { ...a, is_active: !agent.is_active } : a)))

      toast.success(`Agent ${!agent.is_active ? "activated" : "deactivated"}`)
    } catch (error) {
      console.error("Error toggling agent status:", error)
      toast.error("Failed to update agent status")
    }
  }

  // Toggle keylogging
  const toggleKeylogging = async (agent: Agent) => {
    try {
      const { error } = await supabase
        .from("agents")
        .update({ keylogging_enabled: !agent.keylogging_enabled })
        .eq("id", agent.id)

      if (error) {
        throw error
      }

      // Update local state for immediate UI feedback
      setAgents((prev) =>
        prev.map((a) => (a.id === agent.id ? { ...a, keylogging_enabled: !agent.keylogging_enabled } : a)),
      )

      toast.success(`Keylogging ${!agent.keylogging_enabled ? "enabled" : "disabled"}`)
    } catch (error) {
      console.error("Error toggling keylogging:", error)
      toast.error("Failed to update keylogging settings")
    }
  }

  // Toggle full monitoring
  const toggleFullMonitoring = async (agent: Agent) => {
    try {
      const { error } = await supabase
        .from("agents")
        .update({ full_monitoring: !agent.full_monitoring })
        .eq("id", agent.id)

      if (error) {
        throw error
      }

      // Update local state for immediate UI feedback
      setAgents((prev) => prev.map((a) => (a.id === agent.id ? { ...a, full_monitoring: !agent.full_monitoring } : a)))

      toast.success(`Full monitoring ${!agent.full_monitoring ? "enabled" : "disabled"}`)
    } catch (error) {
      console.error("Error toggling full monitoring:", error)
      toast.error("Failed to update monitoring settings")
    }
  }

  // Revoke agent
  const revokeAgent = async (agent: Agent) => {
    try {
      const { error } = await supabase.from("agents").update({ is_revoked: true, is_active: false }).eq("id", agent.id)

      if (error) {
        throw error
      }

      // Update local state for immediate UI feedback
      setAgents((prev) => prev.map((a) => (a.id === agent.id ? { ...a, is_revoked: true, is_active: false } : a)))

      toast.success("Agent access revoked")
    } catch (error) {
      console.error("Error revoking agent:", error)
      toast.error("Failed to revoke agent access")
    }
  }

  // Rename agent
  const renameAgent = async () => {
    if (!editingAgent || !newDeviceName.trim()) return

    try {
      setIsRenaming(true)
      const { error } = await supabase
        .from("agents")
        .update({ device_name: newDeviceName.trim() })
        .eq("id", editingAgent.id)

      if (error) {
        throw error
      }

      // Update local state for immediate UI feedback
      setAgents((prev) => prev.map((a) => (a.id === editingAgent.id ? { ...a, device_name: newDeviceName.trim() } : a)))

      toast.success("Agent renamed successfully")
      setEditingAgent(null)
      setNewDeviceName("")
    } catch (error) {
      console.error("Error renaming agent:", error)
      toast.error("Failed to rename agent")
    } finally {
      setIsRenaming(false)
    }
  }

  // Download agent
  const downloadAgent = () => {
    // In a real app, this would generate or fetch the appropriate installer
    const downloadUrls = {
      windows: "/agent/tracklify-agent-windows.zip",
      macos: "/agent/tracklify-agent-macos.zip",
      linux: "/agent/tracklify-agent-linux.zip",
    }

    const url = downloadUrls[selectedPlatform as keyof typeof downloadUrls]

    // Create a temporary anchor element to trigger the download
    const link = document.createElement("a")
    link.href = url
    link.download = `tracklify-agent-${selectedPlatform}.zip`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast.success(`Downloading agent for ${selectedPlatform}`)
    setIsDownloadDialogOpen(false)
  }

  // Get platform icon
  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "windows":
        return "🪟"
      case "macos":
        return "🍎"
      case "linux":
        return "🐧"
      default:
        return "💻"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Agent Management</h2>
          <p className="text-muted-foreground">Manage your monitoring agents across devices</p>
        </div>
        <Dialog open={isDownloadDialogOpen} onOpenChange={setIsDownloadDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Download className="mr-2 h-4 w-4" />
              Download Agent
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Download Tracklify Agent</DialogTitle>
              <DialogDescription>
                Select your operating system to download the appropriate agent installer.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-3 gap-4">
                <Button
                  variant={selectedPlatform === "windows" ? "default" : "outline"}
                  className="flex flex-col items-center justify-center h-24"
                  onClick={() => setSelectedPlatform("windows")}
                >
                  <span className="text-2xl mb-2">🪟</span>
                  <span>Windows</span>
                </Button>
                <Button
                  variant={selectedPlatform === "macos" ? "default" : "outline"}
                  className="flex flex-col items-center justify-center h-24"
                  onClick={() => setSelectedPlatform("macos")}
                >
                  <span className="text-2xl mb-2">🍎</span>
                  <span>macOS</span>
                </Button>
                <Button
                  variant={selectedPlatform === "linux" ? "default" : "outline"}
                  className="flex flex-col items-center justify-center h-24"
                  onClick={() => setSelectedPlatform("linux")}
                >
                  <span className="text-2xl mb-2">🐧</span>
                  <span>Linux</span>
                </Button>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDownloadDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={downloadAgent}>Download</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-60" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-8 w-24" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : agents.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-40 p-6">
            <p className="text-center text-muted-foreground mb-4">No agents found</p>
            <Button onClick={() => setIsDownloadDialogOpen(true)}>
              <Download className="mr-2 h-4 w-4" />
              Download Your First Agent
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {agents.map((agent) => (
            <Card key={agent.id} className={agent.is_revoked ? "opacity-60" : ""}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <span>{getPlatformIcon(agent.platform)}</span>
                      {agent.device_name}
                      {agent.is_revoked && <Badge variant="outline">Revoked</Badge>}
                      {!agent.is_active && !agent.is_revoked && <Badge variant="outline">Inactive</Badge>}
                    </CardTitle>
                    <CardDescription>
                      Agent ID: {agent.id.substring(0, 8)}...{" "}
                      {agent.last_active ? (
                        <span>
                          • Last active {formatDistanceToNow(new Date(agent.last_active), { addSuffix: true })}
                        </span>
                      ) : (
                        <span>• Never connected</span>
                      )}
                    </CardDescription>
                  </div>
                  <div className="flex items-center">
                    <Badge
                      variant={agent.is_active && !agent.is_revoked ? "default" : "outline"}
                      className={
                        agent.is_active && !agent.is_revoked
                          ? "bg-green-500 hover:bg-green-500/80"
                          : "text-muted-foreground"
                      }
                    >
                      {agent.is_active && !agent.is_revoked ? "Online" : "Offline"}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" disabled={agent.is_revoked}>
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => {
                            setEditingAgent(agent)
                            setNewDeviceName(agent.device_name)
                          }}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toggleAgentActive(agent)}>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          {agent.is_active ? "Deactivate" : "Activate"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              <Trash className="mr-2 h-4 w-4" />
                              Revoke Access
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Revoke Agent Access</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently revoke this agent's access to your account. The agent will no
                                longer be able to send data to Tracklify.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => revokeAgent(agent)}>Revoke Access</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id={`keylogging-${agent.id}`}
                        checked={agent.keylogging_enabled}
                        onCheckedChange={() => toggleKeylogging(agent)}
                        disabled={agent.is_revoked || !agent.is_active}
                      />
                      <Label htmlFor={`keylogging-${agent.id}`}>Keylogging</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id={`full-monitoring-${agent.id}`}
                        checked={agent.full_monitoring}
                        onCheckedChange={() => toggleFullMonitoring(agent)}
                        disabled={agent.is_revoked || !agent.is_active}
                      />
                      <Label htmlFor={`full-monitoring-${agent.id}`}>Full Device Monitoring</Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Rename Dialog */}
      <Dialog open={!!editingAgent} onOpenChange={(open) => !open && setEditingAgent(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Agent</DialogTitle>
            <DialogDescription>Enter a new name for this agent.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="device-name" className="text-right">
                Device Name
              </Label>
              <Input
                id="device-name"
                value={newDeviceName}
                onChange={(e) => setNewDeviceName(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingAgent(null)}>
              Cancel
            </Button>
            <Button onClick={renameAgent} disabled={isRenaming || !newDeviceName.trim()}>
              {isRenaming ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
