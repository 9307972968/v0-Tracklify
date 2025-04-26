"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

export function PrivacySettings() {
  const [privacyPolicy, setPrivacyPolicy] = useState("")
  const [consentText, setConsentText] = useState("")
  const [enableConsent, setEnableConsent] = useState(true)
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
        const { data: settings } = await supabase
          .from("settings")
          .select("*")
          .in("key", ["privacy_policy", "consent_text", "enable_consent"])

        if (settings) {
          const privacyPolicySetting = settings.find((s) => s.key === "privacy_policy")
          const consentTextSetting = settings.find((s) => s.key === "consent_text")
          const enableConsentSetting = settings.find((s) => s.key === "enable_consent")

          if (privacyPolicySetting) {
            setPrivacyPolicy(privacyPolicySetting.value)
          } else {
            // Default privacy policy
            setPrivacyPolicy(
              "# Privacy Policy\n\n" +
                "This monitoring system collects keystroke data for security and compliance purposes. " +
                "All data is encrypted and stored securely. Access to this data is strictly limited " +
                "to authorized personnel.\n\n" +
                "## Data Collection\n\n" +
                "- Keystroke logs\n" +
                "- Application usage\n" +
                "- Session information\n\n" +
                "## Data Retention\n\n" +
                "Data is retained according to the configured retention policy, after which it is permanently deleted.",
            )
          }

          if (consentTextSetting) {
            setConsentText(consentTextSetting.value)
          } else {
            // Default consent text
            setConsentText(
              "I understand that my keystrokes and system activity will be monitored for security " +
                "and compliance purposes. I consent to this monitoring as a condition of using company systems.",
            )
          }

          if (enableConsentSetting) {
            setEnableConsent(enableConsentSetting.value)
          }
        }
      } catch (error) {
        console.error("Error fetching privacy settings:", error)
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
      const { error: privacyError } = await supabase.from("settings").upsert({
        key: "privacy_policy",
        value: privacyPolicy,
        organization_id: "default", // In a real app, use the actual org ID
        updated_at: new Date().toISOString(),
      })

      const { error: consentError } = await supabase.from("settings").upsert({
        key: "consent_text",
        value: consentText,
        organization_id: "default", // In a real app, use the actual org ID
        updated_at: new Date().toISOString(),
      })

      const { error: enableError } = await supabase.from("settings").upsert({
        key: "enable_consent",
        value: enableConsent,
        organization_id: "default", // In a real app, use the actual org ID
        updated_at: new Date().toISOString(),
      })

      if (privacyError || consentError || enableError) {
        console.error("Error saving settings:", { privacyError, consentError, enableError })
        toast({
          title: "Error",
          description: "Failed to save settings.",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Settings Saved",
        description: "Privacy settings have been updated successfully.",
      })
    } catch (error) {
      console.error("Error in save settings:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-32 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-20 w-full" />
        </div>
        <div className="flex items-center space-x-2">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-5 w-60" />
        </div>
        <Skeleton className="h-10 w-24" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="privacy-policy">Privacy Policy</Label>
        <Textarea
          id="privacy-policy"
          value={privacyPolicy}
          onChange={(e) => setPrivacyPolicy(e.target.value)}
          className="min-h-[200px] font-mono text-sm"
        />
        <p className="text-sm text-muted-foreground">
          This policy will be displayed to users when they first access the system.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="consent-text">Consent Text</Label>
        <Textarea
          id="consent-text"
          value={consentText}
          onChange={(e) => setConsentText(e.target.value)}
          className="min-h-[100px]"
        />
        <p className="text-sm text-muted-foreground">
          Users will be required to accept this consent text before monitoring begins.
        </p>
      </div>

      <div className="flex items-center space-x-2">
        <Switch id="enable-consent" checked={enableConsent} onCheckedChange={setEnableConsent} />
        <Label htmlFor="enable-consent">Require explicit consent before monitoring</Label>
      </div>

      <Button onClick={handleSave} disabled={saving}>
        {saving ? "Saving..." : "Save Changes"}
      </Button>
    </div>
  )
}
