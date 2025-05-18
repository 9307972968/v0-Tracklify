"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { toast } from "sonner"

export function LogoutButton() {
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      await supabase.auth.signOut()
      toast.success("Logged out successfully")
      router.push("/login")
    } catch (error) {
      console.error("Error logging out:", error)
      toast.error("Failed to log out")
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <Button variant="ghost" size="icon" onClick={handleLogout} disabled={isLoggingOut}>
      <LogOut className="h-5 w-5" />
      <span className="sr-only">Log out</span>
    </Button>
  )
}
