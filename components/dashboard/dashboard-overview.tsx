"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Overview } from "@/components/dashboard/overview"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { UserStats } from "@/components/dashboard/user-stats"
import { Skeleton } from "@/components/ui/skeleton"
import { motion } from "framer-motion"

interface DashboardStats {
  activeUsers: number
  totalLogs: number
  anomalies: number
  riskScore: number
}

export function DashboardOverview() {
  const [stats, setStats] = useState<DashboardStats>({
    activeUsers: 0,
    totalLogs: 0,
    anomalies: 0,
    riskScore: 0,
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true)

      try {
        // In a real app, you would fetch actual stats from your database
        // For now, we'll use sample data with a slight delay to simulate loading
        await new Promise((resolve) => setTimeout(resolve, 1000))

        setStats({
          activeUsers: 12,
          totalLogs: 1458,
          anomalies: 3,
          riskScore: 18,
        })
      } catch (error) {
        console.error("Error fetching dashboard stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()

    // Set up real-time subscription for stats updates
    const channel = supabase
      .channel("dashboard_stats")
      .on("broadcast", { event: "stats_update" }, (payload) => {
        if (payload.payload) {
          setStats((prev) => ({ ...prev, ...payload.payload }))
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  // Animation variants for cards
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: "easeOut",
      },
    }),
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Active Users", value: stats.activeUsers, change: "+2 since last hour", index: 0 },
          { title: "Total Logs", value: stats.totalLogs, change: "+124 since yesterday", index: 1 },
          { title: "Anomalies", value: stats.anomalies, change: "-2 since yesterday", index: 2 },
          { title: "Risk Score", value: `${stats.riskScore}%`, change: "-3% since last week", index: 3 },
        ].map((stat) => (
          <motion.div key={stat.title} custom={stat.index} initial="hidden" animate="visible" variants={cardVariants}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">{stat.change}</p>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Overview />
          </div>
        </TabsContent>
        <TabsContent value="analytics" className="space-y-4">
          <UserStats />
        </TabsContent>
        <TabsContent value="reports">
          <RecentActivity />
        </TabsContent>
      </Tabs>
    </div>
  )
}
