"use client"

import { LiveLogs } from "@/components/dashboard/live-logs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function LiveLogsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Live Logs</h2>
      </div>
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Real-Time Activity Monitor</CardTitle>
            <CardDescription>Monitor live keystrokes and system activity from all connected agents</CardDescription>
          </CardHeader>
          <CardContent>
            <LiveLogs />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
