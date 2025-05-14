"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"

type DemoContextType = {
  isDemoMode: boolean
  enableDemoMode: () => void
  disableDemoMode: () => void
}

const DemoContext = createContext<DemoContextType | undefined>(undefined)

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [isDemoMode, setIsDemoMode] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const router = useRouter()

  // Initialize demo mode from localStorage
  useEffect(() => {
    // Only run on client side
    if (typeof window !== "undefined") {
      const storedDemoMode = localStorage.getItem("tracklify_demo_mode") === "true"
      setIsDemoMode(storedDemoMode)

      // Set cookie for middleware
      if (storedDemoMode) {
        document.cookie = "tracklify_demo_mode=true; path=/; max-age=86400"
      }

      setIsInitialized(true)
    }
  }, [])

  const enableDemoMode = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("tracklify_demo_mode", "true")
      document.cookie = "tracklify_demo_mode=true; path=/; max-age=86400"
      setIsDemoMode(true)
      router.refresh()
    }
  }

  const disableDemoMode = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("tracklify_demo_mode")
      document.cookie = "tracklify_demo_mode=; path=/; max-age=0"
      setIsDemoMode(false)
      router.push("/login")
      router.refresh()
    }
  }

  // Only provide the context once it's initialized on the client
  if (!isInitialized && typeof window !== "undefined") {
    return <>{children}</>
  }

  return <DemoContext.Provider value={{ isDemoMode, enableDemoMode, disableDemoMode }}>{children}</DemoContext.Provider>
}

export function useDemoMode() {
  const context = useContext(DemoContext)
  if (context === undefined) {
    throw new Error("useDemoMode must be used within a DemoProvider")
  }
  return context
}
