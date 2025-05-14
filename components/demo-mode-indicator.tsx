"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { disableDemoMode, isDemoMode } from "@/lib/demo-mode"
import { useRouter } from "next/navigation"
import { AlertCircle } from "lucide-react"

export function DemoModeIndicator() {
  const [isDemo, setIsDemo] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setIsDemo(isDemoMode())
  }, [])

  if (!isDemo) return null

  const handleExitDemo = () => {
    disableDemoMode()
    router.push("/login")
    router.refresh()
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 bg-black text-white px-3 py-2 rounded-full shadow-lg">
      <AlertCircle className="h-4 w-4" />
      <span className="text-sm font-medium">Demo Mode</span>
      <Button
        variant="outline"
        size="sm"
        className="h-7 text-xs ml-2 bg-transparent hover:bg-white/20 text-white border-white/50"
        onClick={handleExitDemo}
      >
        Exit
      </Button>
    </div>
  )
}
