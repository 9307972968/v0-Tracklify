// Mock authentication system to bypass Supabase authentication issues

// Mock user data
export const MOCK_USER = {
  id: "mock-user-id",
  email: "demo@tracklify.com",
  name: "Demo User",
  role: "admin",
}

// Check if we're in a browser environment
const isBrowser = typeof window !== "undefined"

// Set mock authentication state
export const setMockAuth = () => {
  if (isBrowser) {
    localStorage.setItem(
      "tracklify_auth",
      JSON.stringify({
        user: MOCK_USER,
        isAuthenticated: true,
        timestamp: Date.now(),
      }),
    )

    // Also set a cookie for middleware
    document.cookie = "tracklify_auth=true; path=/; max-age=86400"
  }
}

// Clear mock authentication state
export const clearMockAuth = () => {
  if (isBrowser) {
    localStorage.removeItem("tracklify_auth")
    document.cookie = "tracklify_auth=; path=/; max-age=0"
  }
}

// Check if user is authenticated
export const isMockAuthenticated = () => {
  if (!isBrowser) return false

  const auth = localStorage.getItem("tracklify_auth")
  return auth !== null
}

// Get mock user
export const getMockUser = () => {
  if (!isBrowser) return null

  const auth = localStorage.getItem("tracklify_auth")
  if (!auth) return null

  try {
    const { user } = JSON.parse(auth)
    return user
  } catch (error) {
    console.error("Error parsing auth data:", error)
    return null
  }
}
