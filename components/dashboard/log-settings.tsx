"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
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

export function LogSettings() {
  const [retentionPeriod, setRetentionPeriod] = useState("30")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  // Fetch settings
  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true)

      try {
        // In a real app, you would fetch these from your settings table
        const { data: settings } = await supabase.from("settings").select("*").eq("key", "log_retention_days").single()

        if (settings) {
          setRetentionPeriod(settings.value.toString())
        }
      } catch (error) {
        console.error("Error fetching log settings:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [supabase])

  // Save settings
  const handleSave = async () => {
    setSaving(true)

    try {
      // In a real app, you would update your settings table
      const { error } = await supabase.from("settings").upsert({
        key: "log_retention_days",
        value: Number.parseInt(retentionPeriod),
        organization_id: "default", // In a real app, use the actual org ID
        updated_at: new Date().toISOString(),
      })

      if (error) {
        console.error("Error saving log retention:", error)
        toast({
          title: "Error",
          description: "Failed to save log retention settings.",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Settings Saved",
        description: "Log retention settings have been updated successfully.",
      })
    } catch (error) {
      console.error("Error in save log settings:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  // Handle log purge
  const handlePurgeOldLogs = async () => {
    try {
      // In a real app, you would run a database function to purge old logs
      const { error } = await supabase.rpc("purge_old_logs", {
        days: Number.parseInt(retentionPeriod),
      })

      if (error) {
        console.error("Error purging logs:", error)
        toast({
          title: "Error",
          description: "Failed to purge old logs.",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Logs Purged",
        description: `Successfully purged logs older than ${retentionPeriod} days.`,
      })
    } catch (error) {
      console.error("Error in purge logs:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-10 w-60" />
        </div>
        <Skeleton className="h-10 w-24" />
        <div className="pt-4 border-t">
          <Skeleton className="h-5 w-40 mb-2" />
          <Skeleton className="h-10 w-40" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="retention-period">Log Retention Period</Label>
        <Select value={retentionPeriod} onValueChange={setRetentionPeriod}>
          <SelectTrigger id="retention-period" className="w-60">
            <SelectValue placeholder="Select retention period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">7 days</SelectItem>
            <SelectItem value="14">14 days</SelectItem>
            <SelectItem value="30">30 days</SelectItem>
            <SelectItem value="90">90 days</SelectItem>
            <SelectItem value="180">180 days</SelectItem>
            <SelectItem value="365">365 days</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">Logs older than this period will be automatically deleted.</p>
      </div>

      <Button onClick={handleSave} disabled={saving}>
        {saving ? "Saving..." : "Save Changes"}
      </Button>

      <div className="pt-6 border-t">
        <h3 className="text-lg font-medium mb-4">Manual Log Management</h3>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">Purge Old Logs Now</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Purge Old Logs</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete all logs older than {retentionPeriod} days. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handlePurgeOldLogs}>Purge Logs</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
