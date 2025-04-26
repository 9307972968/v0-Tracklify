import type { Metadata } from "next"
import { LiveLogs } from "@/components/dashboard/live-logs"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Logs | Tracklify",
  description: "Monitor user activity with real-time keystroke logs",
}

export default function LogsPage() {
  return (
    <div className="flex flex-col">
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Logs</h2>
        </div>
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="critical">Critical</TabsTrigger>
            <TabsTrigger value="warning">Warning</TabsTrigger>
            <TabsTrigger value="info">Info</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>All Logs</CardTitle>
                <CardDescription>View all keystroke logs across your monitored systems.</CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                <LiveLogs />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="critical" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Critical Logs</CardTitle>
                <CardDescription>View logs flagged as critical security concerns.</CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                <LiveLogs severity="critical" />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="warning" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Warning Logs</CardTitle>
                <CardDescription>View logs that may indicate potential security issues.</CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                <LiveLogs severity="warning" />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="info" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Info Logs</CardTitle>
                <CardDescription>View regular activity logs with no security concerns.</CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                <LiveLogs severity="info" />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
