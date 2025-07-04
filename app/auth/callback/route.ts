import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const next = requestUrl.searchParams.get("next") || "/dashboard"

  if (code) {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name) {
            return cookieStore.get(name)?.value
          },
          set(name, value, options) {
            cookieStore.set(name, value, options)
          },
          remove(name, options) {
            cookieStore.set(name, "", { ...options, maxAge: 0 })
          },
        },
      },
    )

    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error("Error exchanging code for session:", error)
        // Clear any invalid auth cookies
        const authCookies = ["sb-access-token", "sb-refresh-token"]
        authCookies.forEach((cookieName) => {
          cookieStore.set(cookieName, "", { maxAge: 0 })
        })
        return NextResponse.redirect(`${requestUrl.origin}/login?error=Could not authenticate user`)
      }
    } catch (error) {
      console.error("Exception exchanging code for session:", error)
      return NextResponse.redirect(`${requestUrl.origin}/login?error=Authentication error`)
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(`${requestUrl.origin}${next}`)
}
