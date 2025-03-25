"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSonner } from "@/hooks/use-sonner"

type User = {
  id: string
  name: string
  email: string
  avatar?: string
  bio?: string
  githubToken?: string
}

type AuthContextType = {
  user: User | null
  loading: boolean
  register: (email: string, password: string, name: string) => Promise<void>
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  updateProfile: (data: Partial<User>) => Promise<void>
  deleteAccount: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useSonner()

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me")
        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
        }
      } catch (error) {
        console.error("Failed to check authentication status", error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const register = async (email: string, password: string, name: string) => {
    try {
      setLoading(true)
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, name }),
      })

      // Handle error responses more safely
      if (!response.ok) {
        let errorMessage = "Registration failed"
        try {
          const errorData = await response.json()
          if (errorData && errorData.message) {
            errorMessage = errorData.message
          }
        } catch (parseError) {
          console.error("Error parsing error response:", parseError)
        }

        toast("Registration failed", {
          description: errorMessage,
          type: "error",
        })
        return // Return early instead of throwing
      }

      const data = await response.json()
      setUser(data.user)
      toast("Registration successful", {
        description: "You have been registered successfully",
        type: "success",
      })
      router.push("/gists")
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred during registration"
      toast("Registration failed", {
        description: errorMessage,
        type: "error",
      })
      console.error("Registration error:", error)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      setLoading(true)
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      // Handle error responses more safely
      if (!response.ok) {
        let errorMessage = "Login failed"
        try {
          const errorData = await response.json()
          if (errorData && errorData.message) {
            errorMessage = errorData.message
          }
        } catch (parseError) {
          console.error("Error parsing error response:", parseError)
        }

        toast("Login failed", {
          description: errorMessage,
          type: "error",
        })
        return // Return early instead of throwing
      }

      const data = await response.json()
      setUser(data.user)
      toast("Login successful", {
        description: "You have been logged in successfully",
        type: "success",
      })
      router.push("/gists")
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred during login"
      toast("Login failed", {
        description: errorMessage,
        type: "error",
      })
      console.error("Login error:", error)
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      })
      setUser(null)
      toast("Logout successful", {
        description: "You have been logged out successfully",
        type: "success",
      })
      router.push("/")
    } catch (error) {
      toast("Logout failed", {
        description: "An error occurred during logout",
        type: "error",
      })
      console.error("Logout error:", error)
    }
  }

  const updateProfile = async (data: Partial<User>) => {
    try {
      setLoading(true)
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      // Handle error responses more safely
      if (!response.ok) {
        let errorMessage = "Profile update failed"
        try {
          const errorData = await response.json()
          if (errorData && errorData.message) {
            errorMessage = errorData.message
          }
        } catch (parseError) {
          console.error("Error parsing error response:", parseError)
        }

        toast("Profile update failed", {
          description: errorMessage,
          type: "error",
        })
        return // Return early instead of throwing
      }

      const updatedUser = await response.json()
      setUser(updatedUser)
      toast("Profile updated", {
        description: "Your profile has been updated successfully",
        type: "success",
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred during profile update"
      toast("Profile update failed", {
        description: errorMessage,
        type: "error",
      })
      console.error("Profile update error:", error)
    } finally {
      setLoading(false)
    }
  }

  const deleteAccount = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/profile", {
        method: "DELETE",
      })

      // Handle error responses more safely
      if (!response.ok) {
        let errorMessage = "Account deletion failed"
        try {
          const errorData = await response.json()
          if (errorData && errorData.message) {
            errorMessage = errorData.message
          }
        } catch (parseError) {
          console.error("Error parsing error response:", parseError)
        }

        toast("Account deletion failed", {
          description: errorMessage,
          type: "error",
        })
        return // Return early instead of throwing
      }

      setUser(null)
      toast("Account deleted", {
        description: "Your account has been deleted successfully",
        type: "success",
      })
      router.push("/")
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred during account deletion"
      toast("Account deletion failed", {
        description: errorMessage,
        type: "error",
      })
      console.error("Account deletion error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        login,
        logout,
        updateProfile,
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

