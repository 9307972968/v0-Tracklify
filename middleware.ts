import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  // Check for mock authentication cookie
  const mockAuthCookie = req.cookies.get("mockAuthState")
  const isAuthenticated = mockAuthCookie !== undefined

  // If user is signed in and the current path is / or /login or /signup, redirect to /dashboard
  if (isAuthenticated && ["/login", "/signup", "/"].includes(req.nextUrl.pathname)) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  // If user is not signed in and the current path is /dashboard, redirect to /login
  if (!isAuthenticated && req.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  return res
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
