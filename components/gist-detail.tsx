"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useGists } from "@/hooks/use-gists"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Star, Trash2, Pencil, Calendar, User, ExternalLink, Loader2 } from 'lucide-react'
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism"

// Define proper types to replace 'any'
interface GistFile {
  filename?: string
  type?: string
  language?: string
  raw_url: string
  size: number
  content?: string
}

interface GistOwner {
  login: string
  id: number
  avatar_url?: string
}

interface Gist {
  id: string
  description: string | null
  created_at: string
  updated_at: string
  owner?: GistOwner
  files: Record<string, GistFile>
  html_url: string
  starred: boolean
}

interface GistDetailProps {
  id: string
}

export function GistDetail({ id }: GistDetailProps) {
  const router = useRouter()
  const { getGist, deleteGist, starGist, unstarGist } = useGists()
  const [gist, setGist] = useState<Gist | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [fileContents, setFileContents] = useState<
    Record<string, { content: string; isLoading: boolean; error: string | null }>
  >({})

  useEffect(() => {
    const fetchGist = async () => {
      setIsLoading(true)
      try {
        const data = await getGist(id)
        setGist(data)

        // Initialize file contents tracking
        const initialFileContents: Record<string, { content: string; isLoading: boolean; error: string | null }> = {}

        // For each file in the gist
        Object.entries(data.files).forEach(([filename, file]: [string, GistFile]) => {
          // If content is already available, use it
          if (file.content) {
            initialFileContents[filename] = {
              content: file.content,
              isLoading: false,
              error: null,
            }
          } else {
            // Otherwise mark for loading
            initialFileContents[filename] = {
              content: "",
              isLoading: true,
              error: null,
            }
          }
        })

        setFileContents(initialFileContents)
        setError(null)

        // Fetch any missing content
        fetchMissingContents(data.files)
      } catch (_err) {
        // Using underscore prefix to indicate intentionally unused variable
        setError("Failed to load gist")
      } finally {
        setIsLoading(false)
      }
    }

    fetchGist()
  }, [id, getGist])

  // Function to fetch content for files that don't have it
  const fetchMissingContents = async (files: Record<string, GistFile>) => {
    for (const [filename, file] of Object.entries(files)) {
      // Skip if content is already available
      if (file.content) continue

      try {
        // Update loading state
        setFileContents((prev) => ({
          ...prev,
          [filename]: {
            ...prev[filename],
            isLoading: true,
          },
        }))

        // Fetch content from raw URL
        const response = await fetch(file.raw_url)

        if (!response.ok) {
          throw new Error(`Failed to fetch content: ${response.status}`)
        }

        const content = await response.text()

        // Update state with fetched content
        setFileContents((prev) => ({
          ...prev,
          [filename]: {
            content,
            isLoading: false,
            error: null,
          },
        }))
      } catch (error) {
        console.error(`Error fetching content for ${filename}:`, error)
        setFileContents((prev) => ({
          ...prev,
          [filename]: {
            content: "",
            isLoading: false,
            error: "Failed to load content",
          },
        }))
      }
    }
  }

  const handleDelete = async () => {
    try {
      await deleteGist(id)
      router.push("/gists")
    } catch (error) {
      console.error("Error deleting gist:", error)
    }
  }

  const handleStar = async () => {
    try {
      if (gist?.starred) {
        await unstarGist(id)
        setGist({ ...gist, starred: false })
      } else if (gist) {
        await starGist(id)
        setGist({ ...gist, starred: true })
      }
    } catch (error) {
      console.error("Error starring/unstarring gist:", error)
    }
  }

  // Helper function to determine language for syntax highlighting
  const getLanguage = (filename: string, language?: string) => {
    if (language) return language.toLowerCase()

    // Extract language from filename extension
    const extension = filename.split(".").pop()?.toLowerCase()

    // Map common extensions to languages
    const extensionMap: Record<string, string> = {
      js: "javascript",
      ts: "typescript",
      jsx: "jsx",
      tsx: "tsx",
      py: "python",
      rb: "ruby",
      java: "java",
      php: "php",
      go: "go",
      cs: "csharp",
      html: "html",
      css: "css",
      md: "markdown",
      json: "json",
      yml: "yaml",
      yaml: "yaml",
      sh: "bash",
      bash: "bash",
      sql: "sql",
    }

    return extensionMap[extension || ""] || "text"
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    )
  }

  if (error || !gist) {
    return (
      <div className="p-4 border rounded-md bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-300">
        <h3 className="font-medium">Error</h3>
        <p>{error || "Failed to load gist"}</p>
        <Button onClick={() => router.push("/gists")} className="mt-4">
          Back to Gists
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">{gist.description || "Untitled Gist"}</h1>
          <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
            <div className="flex items-center">
              <User className="h-4 w-4 mr-1" />
              {gist.owner?.login || "Anonymous"}
            </div>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              Created: {new Date(gist.created_at).toLocaleDateString()}
            </div>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              Updated: {new Date(gist.updated_at).toLocaleDateString()}
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant={gist.starred ? "default" : "outline"} size="sm" onClick={handleStar}>
            <Star className={`h-4 w-4 mr-1 ${gist.starred ? "fill-white" : ""}`} />
            {gist.starred ? "Starred" : "Star"}
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href={gist.html_url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-1" />
              View on GitHub
            </a>
          </Button>
          <Button variant="outline" size="sm" onClick={() => router.push(`/gists/${id}/edit`)}>
            <Pencil className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your gist.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Tabs defaultValue={Object.keys(gist.files)[0]}>
        <TabsList className="mb-4">
          {Object.keys(gist.files).map((filename) => (
            <TabsTrigger key={filename} value={filename}>
              {filename}
            </TabsTrigger>
          ))}
        </TabsList>
        {Object.entries(gist.files).map(([filename, file]: [string, GistFile]) => (
          <TabsContent key={filename} value={filename}>
            <Card>
              <CardHeader>
                <CardTitle>{filename}</CardTitle>
                <CardDescription>
                  {file.language || "Plain Text"} • {file.size} bytes
                </CardDescription>
              </CardHeader>
              <CardContent>
                {fileContents[filename]?.isLoading ? (
                  <div className="flex items-center justify-center p-8 bg-muted rounded-md">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : fileContents[filename]?.error ? (
                  <div className="p-4 bg-destructive/10 text-destructive rounded-md">
                    {fileContents[filename].error}
                  </div>
                ) : (
                  <SyntaxHighlighter
                    language={getLanguage(filename, file.language)}
                    style={vscDarkPlus}
                    customStyle={{
                      margin: 0,
                      borderRadius: "0.375rem",
                      fontSize: "0.9rem",
                      lineHeight: 1.5,
                    }}
                    showLineNumbers
                  >
                    {fileContents[filename]?.content || file.content || "No content available"}
                  </SyntaxHighlighter>
                )}
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" asChild>
                  <a href={file.raw_url} target="_blank" rel="noopener noreferrer">
                    View Raw
                  </a>
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}