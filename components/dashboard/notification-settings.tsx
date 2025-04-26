"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface NotificationSetting {
  id: string
  type: string
  enabled: boolean
  channel: string
  config: any
}

export function NotificationSettings() {
  const [settings, setSettings] = useState<NotificationSetting[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  // Fetch settings
  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true)

      try {
        // In a real app, you would fetch these from your notification_settings table
        // For now, we'll use sample data
        const sampleSettings: NotificationSetting[] = [
          {
            id: "1",
            type: "anomaly_detected",
            enabled: true,
            channel: "email",
            config: { recipients: "admin@example.com" },
          },
          {
            id: "2",
            type: "high_risk_activity",
            enabled: true,
            channel: "email",
            config: { recipients: "security@example.com" },
          },
          {
            id: "3",
            type: "system_alert",
            enabled: false,
            channel: "slack",
            config: { webhook_url: "https://hooks.slack.com/services/xxx/yyy/zzz" },
          },
        ]

        setSettings(sampleSettings)
      } catch (error) {
        console.error("Error fetching notification settings:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [supabase])

  // Update a setting
  const updateSetting = (id: string, field: string, value: any) => {
    setSettings((prev) => prev.map((setting) => (setting.id === id ? { ...setting, [field]: value } : setting)))
  }

  // Update config
  const updateConfig = (id: string, field: string, value: any) => {
    setSettings((prev) =>
      prev.map((setting) =>
        setting.id === id
          ? {
              ...setting,
              config: { ...setting.config, [field]: value },
            }
          : setting,
      ),
    )
  }

  // Save settings
  const handleSave = async () => {
    setSaving(true)

    try {
      // In a real app, you would update your notification_settings table
      // For now, we'll just simulate a successful save

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Settings Saved",
        description: "Notification settings have been updated successfully.",
      })
    } catch (error) {
      console.error("Error in save notification settings:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  // Get notification type display name
  const getNotificationTypeName = (type: string) => {
    switch (type) {
      case "anomaly_detected":
        return "Anomaly Detected"
      case "high_risk_activity":
        return "High Risk Activity"
      case "system_alert":
        return "System Alert"
      default:
        return type
    }
  }

  // Get notification description
  const getNotificationDescription = (type: string) => {
    switch (type) {
      case "anomaly_detected":
        return "Receive alerts when the system detects anomalous behavior."
      case "high_risk_activity":
        return "Get notified about high-risk activities that require immediate attention."
      case "system_alert":
        return "System-level alerts about the monitoring platform itself."
      default:
        return ""
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-60" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-6 w-12" />
                </div>
                <Skeleton className="h-10 w-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {settings.map((setting) => (
          <Card key={setting.id}>
            <CardHeader>
              <CardTitle>{getNotificationTypeName(setting.type)}</CardTitle>
              <CardDescription>{getNotificationDescription(setting.type)}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor={`enable-${setting.id}`}>Enable notifications</Label>
                  <Switch
                    id={`enable-${setting.id}`}
                    checked={setting.enabled}
                    onCheckedChange={(checked) => updateSetting(setting.id, "enabled", checked)}
                  />
                </div>

                {setting.channel === "email" && (
                  <div className="space-y-2">
                    <Label htmlFor={`recipients-${setting.id}`}>Recipients</Label>
                    <Input
                      id={`recipients-${setting.id}`}
                      value={setting.config.recipients}
                      onChange={(e) => updateConfig(setting.id, "recipients", e.target.value)}
                      placeholder="email@example.com, another@example.com"
                      disabled={!setting.enabled}
                    />
                    <p className="text-sm text-muted-foreground">Separate multiple email addresses with commas.</p>
                  </div>
                )}

                {setting.channel === "slack" && (
                  <div className="space-y-2">
                    <Label htmlFor={`webhook-${setting.id}`}>Slack Webhook URL</Label>
                    <Input
                      id={`webhook-${setting.id}`}
                      value={setting.config.webhook_url}
                      onChange={(e) => updateConfig(setting.id, "webhook_url", e.target.value)}
                      placeholder="https://hooks.slack.com/services/xxx/yyy/zzz"
                      disabled={!setting.enabled}
                    />
                    <p className="text-sm text-muted-foreground">Create a webhook in your Slack workspace settings.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button onClick={handleSave} disabled={saving}>
        {saving ? "Saving..." : "Save Changes"}
      </Button>
    </div>
  )
}
