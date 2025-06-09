"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"
import { useRouter } from "next/navigation"

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()

  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Dashboard error:", error)
  }, [error])

  const handleGoHome = () => {
    router.push("/dashboard")
  }

  const handleGoToLogin = () => {
    router.push("/login")
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-xl">Something went wrong</CardTitle>
          <CardDescription>
            An error occurred while loading the dashboard. This might be a temporary issue.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-3">
            <p className="text-sm text-muted-foreground">
              <strong>Error:</strong> {error.message || "An unexpected error occurred"}
            </p>
            {error.digest && (
              <p className="text-xs text-muted-foreground mt-1">
                <strong>ID:</strong> {error.digest}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Button onClick={reset} className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try again
            </Button>
            <Button variant="outline" onClick={handleGoHome} className="w-full">
              <Home className="mr-2 h-4 w-4" />
              Go to Dashboard
            </Button>
            <Button variant="ghost" onClick={handleGoToLogin} className="w-full">
              Go to Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
