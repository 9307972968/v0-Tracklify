import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "@/lib/database.types"

// The main client creation function
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing Supabase environment variables")
    throw new Error("Missing Supabase environment variables")
  }

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
}

// Export the createClientComponentClient function for backward compatibility
export function createClientComponentClient() {
  return createClient()
}
