"use client"

import { createContext, useContext, useState } from "react"
import { useSonner } from "@/hooks/use-sonner"

type GistFile = {
  filename: string
  type: string
  language: string
  raw_url: string
  size: number
  content: string
}

type Gist = {
  id: string
  description: string
  public: boolean
  created_at: string
  updated_at: string
  files: Record<string, GistFile>
  html_url: string
  starred: boolean
}

type GistsContextType = {
  gists: Gist[]
  loading: boolean
  fetchGists: () => Promise<void>
  createGist: (data: { description: string; public: boolean; files: Record<string, { content: string }> }) => Promise<Gist>
  updateGist: (id: string, data: { description: string; files: Record<string, { content: string }> }) => Promise<Gist>
  deleteGist: (id: string) => Promise<void>
  getGist: (id: string) => Promise<Gist>
  starGist: (id: string) => Promise<void>
  unstarGist: (id: string) => Promise<void>
}

const GistsContext = createContext<GistsContextType | undefined>(undefined)

export function GistsProvider({ children }: { children: React.ReactNode }) {
  const [gists, setGists] = useState<Gist[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useSonner()

  const fetchGists = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/gists")
      if (!response.ok) {
        throw new Error("Failed to fetch gists")
      }
      const data = await response.json()
      setGists(data)
    } catch (error) {
      toast("Error", {
        description: "Failed to fetch gists",
        type: "error",
      })
      console.error("Error fetching gists:", error)
    } finally {
      setLoading(false)
    }
  }

  const createGist = async (data: {
    description: string
    public: boolean
    files: Record<string, { content: string }>
  }) => {
    try {
      setLoading(true)
      const response = await fetch("/api/gists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        throw new Error("Failed to create gist")
      }
      const newGist = await response.json()
      setGists((prev) => [newGist, ...prev])
      toast("Success", {
        description: "Gist created successfully",
        type: "success",
      })
      return newGist
    } catch (error) {
      toast("Error", {
        description: "Failed to create gist",
        type: "error",
      })
      console.error("Error creating gist:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const updateGist = async (
    id: string,
    data: { description: string; files: Record<string, { content: string }> }
  ) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/gists/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        throw new Error("Failed to update gist")
      }
      const updatedGist = await response.json()
      setGists((prev) =>
        prev.map((gist) => (gist.id === id ? updatedGist : gist))
      )
      toast("Success", {
        description: "Gist updated successfully",
        type: "success",
      })
      return updatedGist
    } catch (error) {
      toast("Error", {
        description: "Failed to update gist",
        type: "error",
      })
      console.error("Error updating gist:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const deleteGist = async (id: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/gists/${id}`, {
        method: "DELETE",
      })
      if (!response.ok) {
        throw new Error("Failed to delete gist")
      }
      setGists((prev) => prev.filter((gist) => gist.id !== id))
      toast("Success", {
        description: "Gist deleted successfully",
        type: "success",
      })
    } catch (error) {
      toast("Error", {
        description: "Failed to delete gist",
        type: "error",
      })
      console.error("Error deleting gist:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const getGist = async (id: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/gists/${id}`)
      if (!response.ok) {
        throw new Error("Failed to fetch gist")
      }
      const gist = await response.json()
      return gist
    } catch (error) {
      toast("Error", {
        description: "Failed to fetch gist",
        type: "error",
      })
      console.error("Error fetching gist:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const starGist = async (id: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/gists/${id}/star`, {
        method: "PUT",
      })
      if (!response.ok) {
        throw new Error("Failed to star gist")
      }
      setGists((prev) =>
        prev.map((gist) => (gist.id === id ? { ...gist, starred: true } : gist))
      )
      toast("Success", {
        description: "Gist starred successfully",
        type: "success",
      })
    } catch (error) {
      toast("Error", {
        description: "Failed to star gist",
        type: "error",
      })
      console.error("Error starring gist:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const unstarGist = async (id: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/gists/${id}/star`, {
        method: "DELETE",
      })
      if (!response.ok) {
        throw new Error("Failed to unstar gist")
      }
      setGists((prev) =>
        prev.map((gist) => (gist.id === id ? { ...gist, starred: false } : gist))
      )
      toast("Success", {
        description: "Gist unstarred successfully",
        type: "success",
      })
    } catch (error) {
      toast("Error", {
        description: "Failed to unstar gist",
        type: "error",
      })
      console.error("Error unstarring gist:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  return (
    <GistsContext.Provider
      value={{
        gists,
        loading,
        fetchGists,
        createGist,
        updateGist,
        deleteGist,
        getGist,
        starGist,
        unstarGist,
      }}
    >
      {children}
    </GistsContext.Provider>
  )
}

export function useGists() {
  const context = useContext(GistsContext)
  if (context === undefined) {
    throw new Error("useGists must be used within a GistsProvider")
  }
  return context
}