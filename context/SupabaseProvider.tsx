"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { User, Session } from "@supabase/supabase-js"

type SupabaseContextType = {
  user: User | null
  session: Session | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signUp: (email: string, password: string, metadata?: { [key: string]: any }) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined)

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getSession = async () => {
      setIsLoading(true)
      try {
        const { data, error } = await supabase.auth.getSession()
        if (error) {
          // If there's an auth error, clear the session
          console.error("Error getting session:", error)
          await supabase.auth.signOut()
          setSession(null)
          setUser(null)
        } else {
          setSession(data.session)
          setUser(data.session?.user || null)
        }
      } catch (error) {
        console.error("Error getting session:", error)
        // If there's an exception, clear the session
        await supabase.auth.signOut()
        setSession(null)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    getSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "TOKEN_REFRESHED" || event === "SIGNED_IN") {
        setSession(session)
        setUser(session?.user || null)
      } else if (event === "SIGNED_OUT") {
        setSession(null)
        setUser(null)
      }

      // Only refresh the page for certain events to avoid unnecessary refreshes
      if (["SIGNED_IN", "SIGNED_OUT", "USER_UPDATED"].includes(event)) {
        router.refresh()
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, router])

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      return { error }
    } catch (error) {
      console.error("Sign in error:", error)
      return { error: error as Error }
    }
  }

  const signUp = async (email: string, password: string, metadata?: { [key: string]: any }) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      return { error }
    } catch (error) {
      console.error("Sign up error:", error)
      return { error: error as Error }
    }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      router.push("/login")
    } catch (error) {
      console.error("Sign out error:", error)
      // Even if there's an error, we should clear the local state
      setSession(null)
      setUser(null)
      router.push("/login")
    }
  }

  const value = {
    user,
    session,
    isLoading,
    signIn,
    signUp,
    signOut,
  }

  return <SupabaseContext.Provider value={value}>{children}</SupabaseContext.Provider>
}

export function useAuth() {
  const context = useContext(SupabaseContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within a SupabaseProvider")
  }
  return context
}
