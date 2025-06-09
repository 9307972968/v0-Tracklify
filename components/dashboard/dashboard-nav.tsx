"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  LayoutDashboard,
  Activity,
  Users,
  Settings,
  AlertTriangle,
  BarChart3,
  Monitor,
  Download,
  Shield,
  LogOut,
} from "lucide-react"
import { useAuth } from "@/context/SupabaseProvider"

const navigation = [
  {
    name: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Dashboard overview and statistics",
  },
  {
    name: "Live Logs",
    href: "/dashboard/livelogs",
    icon: Activity,
    description: "Real-time activity monitoring",
  },
  {
    name: "Devices",
    href: "/dashboard/devices",
    icon: Monitor,
    description: "Manage connected devices",
  },
  {
    name: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart3,
    description: "Activity analytics and insights",
  },
  {
    name: "Anomalies",
    href: "/dashboard/anomalies",
    icon: AlertTriangle,
    description: "Suspicious activity detection",
  },
  {
    name: "Users",
    href: "/dashboard/users",
    icon: Users,
    description: "User management",
  },
  {
    name: "Agent Setup",
    href: "/dashboard/agent",
    icon: Download,
    description: "Download and configure agents",
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    description: "Application settings",
  },
]

export function DashboardNav() {
  const pathname = usePathname()
  const { signOut, user } = useAuth()

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <div className="flex h-full w-64 flex-col border-r bg-background">
      {/* Header */}
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Shield className="h-6 w-6" />
          <span className="text-lg font-semibold">Tracklify</span>
        </Link>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))

            return (
              <Button
                key={item.name}
                variant={isActive ? "secondary" : "ghost"}
                className={cn("w-full justify-start h-auto p-3", isActive && "bg-muted font-medium")}
                asChild
              >
                <Link href={item.href}>
                  <div className="flex items-center gap-3">
                    <item.icon className="h-4 w-4 shrink-0" />
                    <div className="flex flex-col items-start">
                      <span className="text-sm">{item.name}</span>
                      <span className="text-xs text-muted-foreground">{item.description}</span>
                    </div>
                  </div>
                </Link>
              </Button>
            )
          })}
        </div>
      </ScrollArea>

      {/* User section */}
      <div className="border-t p-3">
        <div className="flex items-center gap-3 px-3 py-2 text-sm">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
            <span className="text-xs font-medium">{user?.email?.charAt(0).toUpperCase() || "U"}</span>
          </div>
          <div className="flex-1 truncate">
            <div className="truncate font-medium">{user?.email}</div>
            <div className="text-xs text-muted-foreground">Logged in</div>
          </div>
        </div>
        <Button variant="ghost" className="w-full justify-start mt-2" onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </Button>
      </div>
    </div>
  )
}
