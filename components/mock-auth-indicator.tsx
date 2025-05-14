"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { clearMockAuth, getMockUser } from "@/lib/mock-auth"
import { useRouter } from "next/navigation"
import { AlertCircle } from "lucide-react"

export function MockAuthIndicator() {
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    // Check if user is authenticated on client side
    const mockUser = getMockUser()
    setUser(mockUser)
  }, [])

  if (!user) return null

  const handleLogout = () => {
    clearMockAuth()
    router.push("/login")
    router.refresh()
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-yellow-100 border border-yellow-300 text-yellow-800 px-4 py-2 rounded-md shadow-md flex items-center gap-2">
      <AlertCircle className="h-4 w-4" />
      <span className="text-sm font-medium">Demo Mode</span>
      <Button variant="outline" size="sm" className="ml-2 h-7 px-2" onClick={handleLogout}>
        Exit
      </Button>
    </div>
  )
}
