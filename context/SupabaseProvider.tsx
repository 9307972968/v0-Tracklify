"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User, Session, AuthError } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface SupabaseContextType {
  user: User | null
  session: Session | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined)

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  // Add refs to track auth state and prevent duplicate toasts
  const authStateRef = useRef<{
    signedIn: boolean
    signedOut: boolean
  }>({
    signedIn: false,
    signedOut: false,
  })

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.error("Error getting session:", error)
        } else {
          setSession(session)
          setUser(session?.user ?? null)

          // If we have a session on initial load, mark as signed in but don't show toast
          if (session) {
            authStateRef.current.signedIn = true
          }
        }
      } catch (error) {
        console.error("Error in getInitialSession:", error)
      } finally {
        setIsLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.email)

      setSession(session)
      setUser(session?.user ?? null)
      setIsLoading(false)

      // Handle SIGNED_IN event with protection against duplicates
      if (event === "SIGNED_IN" && session) {
        if (!authStateRef.current.signedIn) {
          authStateRef.current.signedIn = true
          authStateRef.current.signedOut = false
          toast.success("Successfully logged in!")
          router.push("/dashboard")
        }
      }
      // Handle SIGNED_OUT event with protection against duplicates
      else if (event === "SIGNED_OUT") {
        if (!authStateRef.current.signedOut) {
          authStateRef.current.signedOut = true
          authStateRef.current.signedIn = false
          toast.success("Successfully logged out!")
          router.push("/login")
        }
      }
      // Don't show toasts for token refreshes
      else if (event === "TOKEN_REFRESHED") {
        console.log("Token refreshed successfully")
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router, supabase.auth])

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        toast.error(error.message)
        return { error }
      }

      // Don't show toast here - it will be handled by the auth state change listener
      return { error: null }
    } catch (error) {
      console.error("Sign in error:", error)
      toast.error("An unexpected error occurred")
      return { error: error as AuthError }
    } finally {
      setIsLoading(false)
    }
  }

  const signUp = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        toast.error(error.message)
        return { error }
      }

      if (data.user && !data.session) {
        toast.success("Check your email for the confirmation link!")
      }

      return { error: null }
    } catch (error) {
      console.error("Sign up error:", error)
      toast.error("An unexpected error occurred")
      return { error: error as AuthError }
    } finally {
      setIsLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setIsLoading(true)
      const { error } = await supabase.auth.signOut()

      if (error) {
        console.error("Sign out error:", error)
        toast.error("Error signing out")
      }

      // Don't show toast here - it will be handled by the auth state change listener
    } catch (error) {
      console.error("Sign out error:", error)
      toast.error("Error signing out")
    } finally {
      setIsLoading(false)
    }
  }

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      })

      if (error) {
        toast.error(error.message)
        return { error }
      }

      toast.success("Password reset email sent!")
      return { error: null }
    } catch (error) {
      console.error("Reset password error:", error)
      toast.error("An unexpected error occurred")
      return { error: error as AuthError }
    }
  }

  const value = {
    user,
    session,
    isLoading,
    signIn,
    signUp,
    signOut,
    resetPassword,
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
