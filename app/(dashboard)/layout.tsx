import type React from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Toaster } from "@/components/ui/toaster"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()

  try {
    // Check if user is authenticated
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError) {
      console.error("Error getting session in dashboard layout:", sessionError)
      redirect("/login")
    }

    if (!session) {
      redirect("/login")
    }

    // Create a default user object with session data
    // This will be used if we can't fetch the profile
    const defaultUser = {
      ...session.user,
      role: "user",
      full_name: session.user.user_metadata?.full_name || "",
    }

    // Skip profile fetching entirely since the table doesn't exist yet
    // We'll use the default user object instead

    return (
      <div className="flex min-h-screen flex-col">
        <DashboardHeader user={defaultUser} />
        <div className="flex flex-1">
          <DashboardNav />
          <main className="flex-1 overflow-y-auto bg-secondary/10 p-6">{children}</main>
        </div>
        <Toaster />
      </div>
    )
  } catch (error) {
    console.error("Error in dashboard layout:", error)
    redirect("/login")
  }
}
