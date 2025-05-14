"use client"

// Check if demo mode is enabled
export function isDemoMode(): boolean {
  if (typeof window === "undefined") return false
  return localStorage.getItem("tracklify_demo_mode") === "true"
}

// Enable demo mode
export function enableDemoMode(): void {
  if (typeof window === "undefined") return
  localStorage.setItem("tracklify_demo_mode", "true")
  document.cookie = "tracklify_demo_mode=true; path=/; max-age=86400"
}

// Disable demo mode
export function disableDemoMode(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem("tracklify_demo_mode")
  document.cookie = "tracklify_demo_mode=; path=/; max-age=0"
}
