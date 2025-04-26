import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { TypingSpeedChart } from "@/components/dashboard/typing-speed-chart"
import { ActivityHeatmap } from "@/components/dashboard/activity-heatmap"
import { BehaviorTrends } from "@/components/dashboard/behavior-trends"

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Behavior Analytics</h1>
        <p className="text-muted-foreground">Analyze user behavior patterns and identify trends.</p>
      </div>

      <Tabs defaultValue="user" className="space-y-4">
        <TabsList>
          <TabsTrigger value="user">User-Level</TabsTrigger>
          <TabsTrigger value="department">Department-Level</TabsTrigger>
        </TabsList>
        <TabsContent value="user" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Typing Speed (WPM)</CardTitle>
                <CardDescription>Average typing speed by user over time</CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<Skeleton className="h-[350px] w-full" />}>
                  <TypingSpeedChart />
                </Suspense>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Activity Distribution</CardTitle>
                <CardDescription>Keystroke activity by hour</CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<Skeleton className="h-[350px] w-full" />}>
                  <ActivityHeatmap />
                </Suspense>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Behavior Trends</CardTitle>
              <CardDescription>User behavior patterns over time</CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<Skeleton className="h-[350px] w-full" />}>
                <BehaviorTrends />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="department" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Department Overview</CardTitle>
              <CardDescription>Aggregated behavior analytics by department</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-[400px]">
                <p className="text-muted-foreground">Department-level analytics coming soon.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
