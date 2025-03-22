"use client"

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

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Registration failed")
      }

      const data = await response.json()
      setUser(data.user)
      toast("Registration successful", {
        description: "You have been registered successfully",
        type: "success",
      })
      router.push("/gists")
    } catch (error) {
      toast("Registration failed", {
        description: error instanceof Error ? error.message : "An error occurred during registration",
        type: "error",
      })
      throw error
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

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Login failed")
      }

      const data = await response.json()
      setUser(data.user)
      toast("Login successful", {
        description: "You have been logged in successfully",
        type: "success",
      })
      router.push("/gists")
    } catch (error) {
      toast("Login failed", {
        description: error instanceof Error ? error.message : "An error occurred during login",
        type: "error",
      })
      throw error
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

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Profile update failed")
      }

      const updatedUser = await response.json()
      setUser(updatedUser)
      toast("Profile updated", {
        description: "Your profile has been updated successfully",
        type: "success",
      })
    } catch (error) {
      toast("Profile update failed", {
        description: error instanceof Error ? error.message : "An error occurred during profile update",
        type: "error",
      })
      throw error
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

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Account deletion failed")
      }

      setUser(null)
      toast("Account deleted", {
        description: "Your account has been deleted successfully",
        type: "success",
      })
      router.push("/")
    } catch (error) {
      toast("Account deletion failed", {
        description: error instanceof Error ? error.message : "An error occurred during account deletion",
        type: "error",
      })
      throw error
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