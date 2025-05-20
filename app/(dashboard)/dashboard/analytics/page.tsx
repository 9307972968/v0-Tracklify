import type { Metadata } from "next"
import { TypingSpeedChart } from "@/components/dashboard/typing-speed-chart"

export const metadata: Metadata = {
  title: "Analytics | Tracklify",
  description: "View detailed analytics about user behavior and system performance.",
}

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="flex flex-row items-center justify-between pb-2 space-y-0">
            <div className="text-sm font-medium">Total Keystrokes</div>
          </div>
          <div className="text-2xl font-bold">24,567</div>
          <div className="text-xs text-muted-foreground">+20.1% from last month</div>
        </div>
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="flex flex-row items-center justify-between pb-2 space-y-0">
            <div className="text-sm font-medium">Active Users</div>
          </div>
          <div className="text-2xl font-bold">12</div>
          <div className="text-xs text-muted-foreground">+2 since yesterday</div>
        </div>
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="flex flex-row items-center justify-between pb-2 space-y-0">
            <div className="text-sm font-medium">Avg. Session Duration</div>
          </div>
          <div className="text-2xl font-bold">3h 12m</div>
          <div className="text-xs text-muted-foreground">-12.5% from last week</div>
        </div>
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="flex flex-row items-center justify-between pb-2 space-y-0">
            <div className="text-sm font-medium">Anomalies Detected</div>
          </div>
          <div className="text-2xl font-bold">7</div>
          <div className="text-xs text-muted-foreground">+3 from last week</div>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
          <TypingSpeedChart />
        </div>
        <div className="col-span-3 rounded-lg border bg-card shadow-sm">
          <div className="p-6">
            <div className="text-xl font-bold">User Activity</div>
            <div className="text-sm text-muted-foreground">Top active users this week</div>
          </div>
          <div className="p-6 pt-0">
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                  <span className="font-medium text-sm">JD</span>
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">John Doe</p>
                  <p className="text-sm text-muted-foreground">john.doe@example.com</p>
                </div>
                <div className="font-medium">8.5h</div>
              </div>
              <div className="flex items-center">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                  <span className="font-medium text-sm">JS</span>
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">Jane Smith</p>
                  <p className="text-sm text-muted-foreground">jane.smith@example.com</p>
                </div>
                <div className="font-medium">7.2h</div>
              </div>
              <div className="flex items-center">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                  <span className="font-medium text-sm">RJ</span>
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">Robert Johnson</p>
                  <p className="text-sm text-muted-foreground">robert.j@example.com</p>
                </div>
                <div className="font-medium">6.8h</div>
              </div>
              <div className="flex items-center">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                  <span className="font-medium text-sm">EW</span>
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">Emily Wilson</p>
                  <p className="text-sm text-muted-foreground">emily.w@example.com</p>
                </div>
                <div className="font-medium">5.4h</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
