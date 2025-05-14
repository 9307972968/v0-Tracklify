import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Define public routes that don't require authentication
const publicRoutes = ["/", "/login", "/signup", "/reset-password", "/update-password", "/auth/callback"]

// Define routes that require authentication
const protectedRoutes = [
  "/dashboard",
  "/agent",
  "/settings",
  "/profile",
  "/anomalies",
  "/logs",
  "/analytics",
  "/behavior",
]

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  try {
    const supabase = createMiddlewareClient({ req, res })

    // Check if the user is authenticated
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    if (error) {
      console.error("Middleware authentication error:", error)
      // If there's an auth error and the user is trying to access a protected route, redirect to login
      const pathname = req.nextUrl.pathname
      const isProtectedRoute = protectedRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`))

      if (isProtectedRoute) {
        return NextResponse.redirect(new URL("/login", req.url))
      }
      return res
    }

    const pathname = req.nextUrl.pathname

    // Check if the path starts with any protected route
    const isProtectedRoute = protectedRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`))

    // Check if the path is a public route
    const isPublicRoute = publicRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`))

    // If user is signed in and trying to access a public route, redirect to dashboard
    if (session && isPublicRoute && pathname !== "/auth/callback") {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    // If user is not signed in and trying to access a protected route, redirect to login
    if (!session && isProtectedRoute) {
      return NextResponse.redirect(new URL("/login", req.url))
    }
  } catch (error) {
    console.error("Middleware error:", error)

    // If there's an error and the user is trying to access a protected route, redirect to login
    const pathname = req.nextUrl.pathname
    const isProtectedRoute = protectedRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`))

    if (isProtectedRoute) {
      return NextResponse.redirect(new URL("/login", req.url))
    }
  }

  return res
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/auth).*)"],
}
