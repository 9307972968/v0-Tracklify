import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PrivacySettings } from "@/components/dashboard/privacy-settings"
import { LogSettings } from "@/components/dashboard/log-settings"
import { NotificationSettings } from "@/components/dashboard/notification-settings"
import { AgentManagement } from "@/components/dashboard/agent-management"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Settings | Tracklify",
  description: "Configure your Tracklify settings",
}

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">Manage your account settings and preferences.</p>
      </div>

      <Tabs defaultValue="agents" className="space-y-4">
        <TabsList>
          <TabsTrigger value="agents">Agents</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        <TabsContent value="agents" className="space-y-4">
          <AgentManagement />
        </TabsContent>
        <TabsContent value="privacy" className="space-y-4">
          <PrivacySettings />
        </TabsContent>
        <TabsContent value="logs" className="space-y-4">
          <LogSettings />
        </TabsContent>
        <TabsContent value="notifications" className="space-y-4">
          <NotificationSettings />
        </TabsContent>
      </Tabs>
    </div>
  )
}
