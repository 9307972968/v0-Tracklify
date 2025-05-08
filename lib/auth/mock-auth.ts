// Mock authentication system to bypass Supabase authentication issues

// Check if we're in a browser environment
const isBrowser = typeof window !== "undefined"

// Mock user data
const MOCK_USER = {
  id: "mock-user-id",
  email: "demo@tracklify.com",
  name: "Demo User",
  role: "admin",
}

// Store auth state in localStorage
export const setMockSession = () => {
  if (isBrowser) {
    localStorage.setItem(
      "mockAuthState",
      JSON.stringify({
        user: MOCK_USER,
        isAuthenticated: true,
        timestamp: Date.now(),
      }),
    )
  }
}

// Clear auth state from localStorage
export const clearMockSession = () => {
  if (isBrowser) {
    localStorage.removeItem("mockAuthState")
  }
}

// Get the current auth state
export const getMockSession = () => {
  if (!isBrowser) {
    return { user: null, isAuthenticated: false }
  }

  const authState = localStorage.getItem("mockAuthState")
  if (!authState) {
    return { user: null, isAuthenticated: false }
  }

  try {
    return JSON.parse(authState)
  } catch (error) {
    console.error("Error parsing auth state:", error)
    return { user: null, isAuthenticated: false }
  }
}

// Check if the user is authenticated
export const isMockAuthenticated = () => {
  const { isAuthenticated } = getMockSession()
  return isAuthenticated
}

// Get the current user
export const getMockUser = () => {
  const { user } = getMockSession()
  return user
}
