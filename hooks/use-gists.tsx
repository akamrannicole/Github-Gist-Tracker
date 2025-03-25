"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback } from "react"
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
  loadingGists: Record<string, boolean>
  fetchGists: () => Promise<void>
  createGist: (data: {
    description: string
    public: boolean
    files: Record<string, { content: string }>
  }) => Promise<Gist>
  updateGist: (
    id: string,
    data: { description: string; files: Record<string, { content: string } | null> },
  ) => Promise<Gist>
  deleteGist: (id: string) => Promise<void>
  getGist: (id: string) => Promise<Gist>
  starGist: (id: string) => Promise<void>
  unstarGist: (id: string) => Promise<void>
}

const GistsContext = createContext<GistsContextType | undefined>(undefined)

const gistCache = new Map<string, { gist: Gist; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 

export function GistsProvider({ children }: { children: React.ReactNode }) {
  const [gists, setGists] = useState<Gist[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingGists, setLoadingGists] = useState<Record<string, boolean>>({})

  const fetchGists = useCallback(async () => {
    try {
      setLoading(true)
      console.log("Fetching gists with token:", process.env.NEXT_PUBLIC_GITHUB_TOKEN ? "Token exists" : "No token")

      const cachedListKey = "gist_list"
      const cachedList = gistCache.get(cachedListKey)
      const now = Date.now()

      if (cachedList && now - cachedList.timestamp < CACHE_TTL) {
        console.log("Using cached gist list")
        setGists(cachedList.gist as unknown as Gist[])
        return
      }

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000)

      try {
        const response = await fetch("https://api.github.com/gists", {
          headers: {
            Authorization: `token ${process.env.NEXT_PUBLIC_GITHUB_TOKEN}`,
            Accept: "application/vnd.github.v3+json",
          },
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        console.log("API response status:", response.status)

        if (!response.ok) {
          const errorText = await response.text()
          console.error("API Error:", response.status, errorText)

          if (response.status === 403 && cachedList) {
            console.log("Rate limited, using cached data")
            setGists(cachedList.gist as unknown as Gist[])
            toast.warning("Using cached data due to API rate limits")
            return
          }

          throw new Error(`Failed to fetch gists: ${response.status} ${errorText}`)
        }

        const data = await response.json()
        console.log("Gists fetched:", Array.isArray(data) ? data.length : "not an array", data)

        if (!Array.isArray(data)) {
          console.error("API returned non-array data:", data)
          setGists([])
          return
        }

        const formattedGists = data.map((gist) => {
      
          const formattedFiles: Record<string, GistFile> = {}

          if (gist.files) {
            Object.keys(gist.files).forEach((filename) => {
              const file = gist.files[filename]
              formattedFiles[filename] = {
                ...file,
                content: file.content || "", 
              }
            })
          }

          return {
            ...gist,
            starred: false, 
            files: formattedFiles,
          }
        })

        console.log("Formatted gists:", formattedGists.length)

        gistCache.set(cachedListKey, {
          gist: formattedGists as unknown as Gist,
          timestamp: Date.now(),
        })

        setGists(formattedGists)

        if (
          response.headers.get("x-ratelimit-remaining") &&
          Number.parseInt(response.headers.get("x-ratelimit-remaining") || "0") > 20
        ) {
          checkStarredStatus(formattedGists)
        }
      } catch (error: unknown) {
        if (error instanceof Error && error.name === "AbortError") {
          console.error("Request timed out after 15 seconds")
          throw new Error("Request timed out. Please try again.")
        }
        throw error
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
      toast.error("Failed to fetch gists", {
        description: errorMessage || "An error occurred while fetching your gists",
      })
      console.error("Error fetching gists:", error)

      setGists([])
    } finally {
      setLoading(false)
    }
  }, [])

  const checkStarredStatus = async (gists: Gist[]) => {
    try {
      for (const gist of gists) {
        try {
          const cachedGist = gistCache.get(gist.id)
          if (cachedGist) {
            const typedGist = cachedGist.gist as Gist
            if (typedGist.starred !== undefined) {
              continue 
            }
          }

          const response = await fetch(`https://api.github.com/gists/${gist.id}/star`, {
            method: "GET",
            headers: {
              Authorization: `token ${process.env.NEXT_PUBLIC_GITHUB_TOKEN}`,
            },
          })

          const isStarred = response.status === 204 

          if (isStarred) {
            setGists((prev) => prev.map((g) => (g.id === gist.id ? { ...g, starred: true } : g)))

            if (cachedGist) {
              const typedGist = cachedGist.gist as Gist
              gistCache.set(gist.id, {
                gist: { ...typedGist, starred: true },
                timestamp: cachedGist.timestamp,
              })
            }
          }
        } catch (error: unknown) {
          console.log("Error checking star status for gist", gist.id, error)
          
        }
      }
    } catch (error: unknown) {
      console.error("Error checking starred status:", error)
    }
  }

  const createGist = useCallback(
    async (data: {
      description: string
      public: boolean
      files: Record<string, { content: string }>
    }) => {
      try {
        setLoading(true)
        const response = await fetch("https://api.github.com/gists", {
          method: "POST",
          headers: {
            Authorization: `token ${process.env.NEXT_PUBLIC_GITHUB_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error("API Error:", response.status, errorText)
          throw new Error(`Failed to create gist: ${response.status} ${errorText}`)
        }

        const newGist = await response.json()

        setGists((prev) => {
          const updatedGists = [newGist, ...prev]
          console.log("Updated gists after creation:", updatedGists.length)
          return updatedGists
        })

        gistCache.set(newGist.id, { gist: newGist, timestamp: Date.now() })

        const cachedListKey = "gist_list"
        const cachedList = gistCache.get(cachedListKey)
        if (cachedList) {
          const typedList = cachedList.gist as unknown as Gist[]
          gistCache.set(cachedListKey, {
            gist: [newGist, ...typedList] as unknown as Gist,
            timestamp: Date.now(),
          })
        }

        toast.success("Gist created successfully")

        return newGist
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
        toast.error("Failed to create gist", {
          description: errorMessage || "An error occurred while creating your gist",
        })
        console.error("Error creating gist:", error)
        throw error
      } finally {
      
        setLoading(false)
      }
    },
    [],
  )

  const updateGist = useCallback(
    async (id: string, data: { description: string; files: Record<string, { content: string } | null> }) => {
      try {
        setLoading(true)
        const response = await fetch(`https://api.github.com/gists/${id}`, {
          method: "PATCH",
          headers: {
            Authorization: `token ${process.env.NEXT_PUBLIC_GITHUB_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error("API Error:", response.status, errorText)
          throw new Error(`Failed to update gist: ${response.status} ${errorText}`)
        }

        const updatedGist = await response.json()

        setGists((prev) => {
          const updatedGists = prev.map((gist) => (gist.id === id ? updatedGist : gist))
          console.log("Updated gists after update:", updatedGists.length)
          return updatedGists
        })

        gistCache.set(id, { gist: updatedGist, timestamp: Date.now() })

        const cachedListKey = "gist_list"
        const cachedList = gistCache.get(cachedListKey)
        if (cachedList) {
          const typedList = cachedList.gist as unknown as Gist[]
          gistCache.set(cachedListKey, {
            gist: typedList.map((gist) => (gist.id === id ? updatedGist : gist)) as unknown as Gist,
            timestamp: Date.now(),
          })
        }

        toast.success("Gist updated successfully")

        return updatedGist
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
        toast.error("Failed to update gist", {
          description: errorMessage || "An error occurred while updating your gist",
        })
        console.error("Error updating gist:", error)
        throw error
      } finally {
    
        setLoading(false)
      }
    },
    [],
  )

  const deleteGist = useCallback(async (id: string) => {
    try {
      setLoading(true)
      const response = await fetch(`https://api.github.com/gists/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `token ${process.env.NEXT_PUBLIC_GITHUB_TOKEN}`,
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("API Error:", response.status, errorText)
        throw new Error(`Failed to delete gist: ${response.status} ${errorText}`)
      }

      setGists((prev) => prev.filter((gist) => gist.id !== id))

     
      gistCache.delete(id)

      const cachedListKey = "gist_list"
      const cachedList = gistCache.get(cachedListKey)
      if (cachedList) {
        const typedList = cachedList.gist as unknown as Gist[]
        gistCache.set(cachedListKey, {
          gist: typedList.filter((gist) => gist.id !== id) as unknown as Gist,
          timestamp: Date.now(),
        })
      }

      toast.success("Gist deleted successfully")
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
      toast.error("Failed to delete gist", {
        description: errorMessage || "An error occurred while deleting your gist",
      })
      console.error("Error deleting gist:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const getGist = useCallback(async (id: string) => {
    try {
      setLoadingGists((prev) => ({ ...prev, [id]: true }))

      const cachedGist = gistCache.get(id)
      const now = Date.now()

      if (cachedGist && now - cachedGist.timestamp < CACHE_TTL) {
        console.log("Using cached gist data for", id)
        return cachedGist.gist as Gist
      }

      const response = await fetch(`https://api.github.com/gists/${id}`, {
        headers: {
          Authorization: `token ${process.env.NEXT_PUBLIC_GITHUB_TOKEN}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("API Error:", response.status, errorText)

        if (response.status === 403 && cachedGist) {
          console.log("Rate limited, using cached gist data")
          toast.warning("Using cached data due to API rate limits")
          return cachedGist.gist as Gist
        }

        throw new Error(`Failed to fetch gist: ${response.status} ${errorText}`)
      }

      const gist = await response.json()

      if (gist.files) {
        for (const filename in gist.files) {
          if (!gist.files[filename].content) {
            try {
              const contentResponse = await fetch(gist.files[filename].raw_url)
              if (contentResponse.ok) {
                gist.files[filename].content = await contentResponse.text()
              }
            } catch (error) {
              console.error(`Failed to fetch content for file ${filename}:`, error)
            }
          }
        }
      }

      try {
    
        if (
          response.headers.get("x-ratelimit-remaining") &&
          Number.parseInt(response.headers.get("x-ratelimit-remaining") || "0") > 5
        ) {
          const starResponse = await fetch(`https://api.github.com/gists/${id}/star`, {
            method: "GET",
            headers: {
              Authorization: `token ${process.env.NEXT_PUBLIC_GITHUB_TOKEN}`,
            },
          })

          gist.starred = starResponse.status === 204
        } else {
         
          gist.starred = cachedGist ? (cachedGist.gist as Gist).starred : false
        }
      } catch (error: unknown) {
        console.log("Error checking star status:", error)
      
        gist.starred = false
      }

      gistCache.set(id, { gist, timestamp: Date.now() })

      return gist
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
      toast.error("Failed to fetch gist", {
        description: errorMessage || "An error occurred while fetching the gist",
      })
      console.error("Error fetching gist:", error)
      throw error
    } finally {

      setLoadingGists((prev) => ({ ...prev, [id]: false }))
    }
  }, [])

  const starGist = useCallback(async (id: string) => {
    try {
      setLoading(true)
      const response = await fetch(`https://api.github.com/gists/${id}/star`, {
        method: "PUT",
        headers: {
          Authorization: `token ${process.env.NEXT_PUBLIC_GITHUB_TOKEN}`,
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("API Error:", response.status, errorText)
        throw new Error(`Failed to star gist: ${response.status} ${errorText}`)
      }

      setGists((prev) => prev.map((gist) => (gist.id === id ? { ...gist, starred: true } : gist)))

      const cachedGist = gistCache.get(id)
      if (cachedGist) {
        const typedGist = cachedGist.gist as Gist
        gistCache.set(id, {
          gist: { ...typedGist, starred: true },
          timestamp: cachedGist.timestamp,
        })
      }

      toast.success("Gist starred successfully")
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
      toast.error("Failed to star gist", {
        description: errorMessage || "An error occurred while starring the gist",
      })
      console.error("Error starring gist:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const unstarGist = useCallback(async (id: string) => {
    try {
      setLoading(true)
      const response = await fetch(`https://api.github.com/gists/${id}/star`, {
        method: "DELETE",
        headers: {
          Authorization: `token ${process.env.NEXT_PUBLIC_GITHUB_TOKEN}`,
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("API Error:", response.status, errorText)
        throw new Error(`Failed to unstar gist: ${response.status} ${errorText}`)
      }

      setGists((prev) => prev.map((gist) => (gist.id === id ? { ...gist, starred: false } : gist)))

      const cachedGist = gistCache.get(id)
      if (cachedGist) {
        const typedGist = cachedGist.gist as Gist
        gistCache.set(id, {
          gist: { ...typedGist, starred: false },
          timestamp: cachedGist.timestamp,
        })
      }

      toast.success("Gist unstarred successfully")
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
      toast.error("Failed to unstar gist", {
        description: errorMessage || "An error occurred while unstarring the gist",
      })
      console.error("Error unstarring gist:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  return (
    <GistsContext.Provider
      value={{
        gists,
        loading,
        loadingGists,
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

export type GistFilesUpdate = Record<string, { content: string } | null>

export function useGists() {
  const context = useContext(GistsContext)
  if (context === undefined) {
    throw new Error("useGists must be used within a GistsProvider")
  }
  return context
}

