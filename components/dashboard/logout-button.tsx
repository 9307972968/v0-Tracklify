"use client"

import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import { clearMockSession } from "@/lib/auth/mock-auth"

export function LogoutButton() {
  const router = useRouter()

  const handleLogout = () => {
    clearMockSession()
    router.push("/login")
    router.refresh()
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-1">
      <LogOut className="h-4 w-4" />
      <span>Logout</span>
    </Button>
  )
}
