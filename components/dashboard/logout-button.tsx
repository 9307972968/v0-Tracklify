"use client"

import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/SupabaseProvider"
import { toast } from "sonner"

export function LogoutButton() {
  const router = useRouter()
  const { signOut } = useAuth()

  const handleLogout = async () => {
    try {
      await signOut()
      toast.success("Logged out successfully")
      router.push("/login")
      router.refresh()
    } catch (error) {
      console.error("Logout error:", error)
      toast.error("Failed to log out. Please try again.")
    }
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-1">
      <LogOut className="h-4 w-4" />
      <span>Logout</span>
    </Button>
  )
}
