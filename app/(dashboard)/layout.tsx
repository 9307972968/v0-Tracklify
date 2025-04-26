import type React from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  // Fetch user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

  // If profile doesn't exist, create it
  if (!profile) {
    try {
      await supabase.from("profiles").insert({
        id: session.user.id,
        email: session.user.email || "",
        full_name: session.user.user_metadata.full_name || "",
        role: "user",
      })
    } catch (error) {
      console.error("Error creating profile in dashboard layout:", error)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader user={session.user} />
      <div className="flex flex-1">
        <DashboardNav />
        <main className="flex-1 overflow-y-auto bg-secondary p-6">{children}</main>
      </div>
    </div>
  )
}
