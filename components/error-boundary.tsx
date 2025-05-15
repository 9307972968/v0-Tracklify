"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()

  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Error boundary caught error:", error)

    // If the error is a redirect, handle it
    if (error.message === "NEXT_REDIRECT") {
      // This is a redirect error, we can safely ignore it
      return
    }
  }, [error])

  const handleGoToLogin = () => {
    router.push("/login")
  }

  // If the error is a redirect, don't show the error UI
  if (error.message === "NEXT_REDIRECT" || error.message === "Redirect") {
    return null
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4 rounded-lg border bg-background p-6 shadow-lg">
        <h2 className="text-2xl font-bold">Something went wrong!</h2>
        <p className="text-muted-foreground">
          {error.message || "An unexpected error occurred. Please try again or log in again."}
        </p>
        <div className="flex gap-4">
          <Button onClick={reset} variant="outline">
            Try again
          </Button>
          <Button onClick={handleGoToLogin}>Go to login</Button>
        </div>
      </div>
    </div>
  )
}
