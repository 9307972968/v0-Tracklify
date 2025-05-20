import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

// Define public routes that don't require authentication
const publicRoutes = ["/", "/login", "/signup", "/reset-password", "/update-password", "/auth/callback"]

// Define routes that require authentication
const protectedRoutes = [
  "/dashboard",
  "/dashboard/agent",
  "/dashboard/settings",
  "/dashboard/profile",
  "/dashboard/anomalies",
  "/dashboard/logs",
  "/dashboard/analytics",
  "/dashboard/behavior",
  "/dashboard/users",
]

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name) {
            return request.cookies.get(name)?.value
          },
          set(name, value, options) {
            request.cookies.set({
              name,
              value,
              ...options,
            })
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            })
            response.cookies.set({
              name,
              value,
              ...options,
            })
          },
          remove(name, options) {
            request.cookies.set({
              name,
              value: "",
              ...options,
              maxAge: 0,
            })
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            })
            response.cookies.set({
              name,
              value: "",
              ...options,
              maxAge: 0,
            })
          },
        },
      },
    )

    // Try to get the session, but handle auth errors gracefully
    let session = null
    try {
      const { data, error } = await supabase.auth.getSession()
      if (!error) {
        session = data.session
      } else if (
        error.name === "AuthApiError" &&
        (error.message.includes("refresh_token_not_found") || error.status === 400)
      ) {
        // Clear invalid auth cookies if we get a refresh token error
        const authCookies = ["sb-access-token", "sb-refresh-token"]
        authCookies.forEach((cookieName) => {
          response.cookies.set({
            name: cookieName,
            value: "",
            maxAge: 0,
          })
        })
      }
    } catch (error) {
      console.error("Auth error in middleware:", error)
      // Continue without a session
    }

    const pathname = request.nextUrl.pathname

    // Check if the path starts with any protected route
    const isProtectedRoute = protectedRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`))

    // Check if the path is a public route
    const isPublicRoute = publicRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`))

    // If user is signed in and trying to access a public route, redirect to dashboard
    if (session && isPublicRoute && pathname !== "/auth/callback") {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }

    // If user is not signed in and trying to access a protected route, redirect to login
    if (!session && isProtectedRoute) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    return response
  } catch (error) {
    console.error("Middleware error:", error)

    // If there's an error and the user is trying to access a protected route, redirect to login
    const pathname = request.nextUrl.pathname
    const isProtectedRoute = protectedRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`))

    if (isProtectedRoute) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    return response
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
}
