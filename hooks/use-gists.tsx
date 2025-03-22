"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"
import { toast } from "sonner"

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
  createGist: (data: {
    description: string
    public: boolean
    files: Record<string, { content: string }>
  }) => Promise<Gist>
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
      toast.error("Failed to fetch gists")
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        throw new Error("Failed to create gist")
      }
      const newGist = await response.json()
      setGists((prev) => [newGist, ...prev])
      toast.success("Gist created successfully")
      return newGist
    } catch (error) {
      toast.error("Failed to create gist")
      console.error("Error creating gist:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const updateGist = async (id: string, data: { description: string; files: Record<string, { content: string }> }) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/gists/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        throw new Error("Failed to update gist")
      }
      const updatedGist = await response.json()
      setGists((prev) => prev.map((gist) => (gist.id === id ? updatedGist : gist)))
      toast.success("Gist updated successfully")
      return updatedGist
    } catch (error) {
      toast.error("Failed to update gist")
      console.error("Error updating gist:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const deleteGist = async (id: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/gists/${id}`, { method: "DELETE" })
      if (!response.ok) {
        throw new Error("Failed to delete gist")
      }
      setGists((prev) => prev.filter((gist) => gist.id !== id))
      toast.success("Gist deleted successfully")
    } catch (error) {
      toast.error("Failed to delete gist")
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
      return await response.json()
    } catch (error) {
      toast.error("Failed to fetch gist")
      console.error("Error fetching gist:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const starGist = async (id: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/gists/${id}/star`, { method: "PUT" })
      if (!response.ok) {
        throw new Error("Failed to star gist")
      }
      setGists((prev) => prev.map((gist) => (gist.id === id ? { ...gist, starred: true } : gist)))
      toast.success("Gist starred successfully")
    } catch (error) {
      toast.error("Failed to star gist")
      console.error("Error starring gist:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const unstarGist = async (id: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/gists/${id}/star`, { method: "DELETE" })
      if (!response.ok) {
        throw new Error("Failed to unstar gist")
      }
      setGists((prev) => prev.map((gist) => (gist.id === id ? { ...gist, starred: false } : gist)))
      toast.success("Gist unstarred successfully")
    } catch (error) {
      toast.error("Failed to unstar gist")
      console.error("Error unstarring gist:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  return (
    <GistsContext.Provider value={{ gists, loading, fetchGists, createGist, updateGist, deleteGist, getGist, starGist, unstarGist }}>
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
