import type { Metadata } from "next"
import { LiveLogs } from "@/components/dashboard/live-logs"

export const metadata: Metadata = {
  title: "Logs | Tracklify",
  description: "View real-time keystroke logs from all agents",
}

export default function LogsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Logs</h2>
        <p className="text-muted-foreground">View real-time keystroke logs from all agents</p>
      </div>
      <LiveLogs />
    </div>
  )
}
