"use client"

import { useEffect } from "react"
import { useGists } from "@/hooks/use-gists"
import { Button } from "@/components/ui/button"
import { ProfileForm } from "@/components/profile-form"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Star } from 'lucide-react'

export function GistsList() {
  const { gists, loading, fetchGists, starGist, unstarGist } = useGists()

  useEffect(() => {
    fetchGists()
  }, [fetchGists])

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-3/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  // Check if we have an error message in the first gist
  if (gists.length === 1 && "error" in gists[0] && gists[0].error === "GitHub token not found") {
    return (
      <div className="space-y-4">
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle>GitHub Token Required</CardTitle>
            <CardDescription>You need to add a GitHub Personal Access Token to access your gists.</CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileForm />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (gists.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Gists Found</CardTitle>
          <CardDescription>You don&apos;t have any gists yet. Create your first gist to get started.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {gists.map((gist) => (
        <Card key={gist.id}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">{gist.description || "Untitled Gist"}</CardTitle>
            <CardDescription>Created: {new Date(gist.created_at).toLocaleDateString()}</CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="space-y-1">
              <h4 className="text-sm font-medium">Files:</h4>
              <ul className="text-sm">
                {Object.keys(gist.files).map((filename) => (
                  <li key={filename} className="text-muted-foreground">
                    {filename} ({gist.files[filename].language || "Plain Text"})
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between pt-2">
            <a
              href={gist.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline"
            >
              View on GitHub
            </a>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => (gist.starred ? unstarGist(gist.id) : starGist(gist.id))}
              className={gist.starred ? "text-yellow-500" : "text-muted-foreground"}
            >
              <Star className="h-4 w-4 mr-1" />
              {gist.starred ? "Starred" : "Star"}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}