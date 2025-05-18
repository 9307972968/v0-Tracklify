import type React from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Toaster } from "sonner"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  try {
    const supabase = createClient()

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // If no session, redirect to login
    if (!session) {
      return redirect("/login")
    }

    // Create a default user object with session data
    const defaultUser = {
      ...session.user,
      role: "user",
      full_name: session.user.user_metadata?.full_name || "",
    }

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
    return redirect("/login")
  }
}
