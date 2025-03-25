"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useGists } from "@/hooks/use-gists"
import { useAuth } from "@/hooks/use-auth"
import { Edit, Loader2, Star } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

// Define the Gist type to match your API response
interface GistFile {
  filename: string
  type: string
  language: string
  raw_url: string
  size: number
  content: string
}

interface Gist {
  id: string
  description: string
  public: boolean
  created_at: string
  updated_at: string
  files: Record<string, GistFile>
  html_url: string
  starred: boolean
}

export default function GistPage() {
  const params = useParams()
  const id = params?.id as string
  const { getGist, starGist, unstarGist } = useGists()
  const { user, loading: authLoading } = useAuth()
  const [gist, setGist] = useState<Gist | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchGist = async () => {
      if (!id) return

      try {
        setLoading(true)
        const fetchedGist = await getGist(id)
        setGist(fetchedGist)
      } catch (error) {
        console.error("Error fetching gist:", error)
      } finally {
        setLoading(false)
      }
    }

    if (user && !authLoading) {
      fetchGist()
    }
  }, [id, user, authLoading, getGist])

  // Redirect if not logged in
  if (!authLoading && !user) {
    router.push("/auth/login")
    return null
  }

  const handleToggleStar = async () => {
    if (!gist) return

    if (gist.starred) {
      await unstarGist(gist.id)
      setGist({ ...gist, starred: false })
    } else {
      await starGist(gist.id)
      setGist({ ...gist, starred: true })
    }
  }

  if (loading || !gist) {
    return (
      <div className="container flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  const firstFileName = Object.keys(gist.files)[0]
  const firstFile = gist.files[firstFileName]

  return (
    <div className="container py-10">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{firstFileName}</h1>
            <p className="text-muted-foreground">{gist.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleToggleStar}>
              <Star className={`mr-2 h-4 w-4 ${gist.starred ? "fill-yellow-400 text-yellow-400" : ""}`} />
              {gist.starred ? "Starred" : "Star"}
            </Button>
            <Link href={`/gists/${gist.id}/edit`}>
              <Button size="sm">
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            </Link>
          </div>
        </div>

        <Card>
          <CardHeader className="bg-muted py-2">
            <CardTitle className="text-sm font-medium">{firstFileName}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <pre className="p-4 text-sm">
                <code>{firstFile.content}</code>
              </pre>
            </div>
          </CardContent>
          <CardFooter className="border-t bg-muted/50 py-2 text-xs text-muted-foreground">
            Created {formatDistanceToNow(new Date(gist.created_at), { addSuffix: true })}
            {gist.updated_at !== gist.created_at && (
              <> · Updated {formatDistanceToNow(new Date(gist.updated_at), { addSuffix: true })}</>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

