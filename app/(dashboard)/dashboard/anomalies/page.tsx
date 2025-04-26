import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { AnomaliesList } from "@/components/dashboard/anomalies-list"

export default function AnomaliesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Anomalies</h1>
        <p className="text-muted-foreground">Detected anomalies that may require attention.</p>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="high">High Severity</TabsTrigger>
          <TabsTrigger value="medium">Medium Severity</TabsTrigger>
          <TabsTrigger value="low">Low Severity</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Anomalies</CardTitle>
              <CardDescription>View all detected anomalies across your organization</CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
                <AnomaliesList />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="high" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>High Severity Anomalies</CardTitle>
              <CardDescription>Critical issues that require immediate attention</CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
                <AnomaliesList severity="high" />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="medium" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Medium Severity Anomalies</CardTitle>
              <CardDescription>Issues that should be investigated soon</CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
                <AnomaliesList severity="medium" />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="low" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Low Severity Anomalies</CardTitle>
              <CardDescription>Minor issues that may require attention</CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
                <AnomaliesList severity="low" />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
