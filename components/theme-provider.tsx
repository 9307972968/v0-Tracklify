"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ThemeProviderProps } from "next-themes"
import { createClient } from "@/lib/supabase/client"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const supabase = createClient()

  // Save theme preference to user_metadata when authenticated user changes theme
  const saveThemePreference = React.useCallback(
    async (theme: string | undefined) => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (user) {
          await supabase.auth.updateUser({
            data: { theme_preference: theme },
          })
        }
      } catch (error) {
        console.error("Error saving theme preference:", error)
      }
    },
    [supabase],
  )

  return (
    <NextThemesProvider {...props} onThemeChange={saveThemePreference}>
      {children}
    </NextThemesProvider>
  )
}
