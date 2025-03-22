"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/hooks/use-auth"
import { useGists } from "@/hooks/use-gists"
import { Code, Loader2, MoreHorizontal, Plus, Search, Star } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

export default function GistsPage() {
  const { user, loading: authLoading } = useAuth()
  const { gists, loading: gistsLoading, fetchGists, deleteGist, starGist, unstarGist } = useGists()
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const router = useRouter()

  useEffect(() => {
    if (user && !authLoading) {
      fetchGists()
    }
  }, [user, authLoading, fetchGists])

  // Redirect if not logged in
  if (!authLoading && !user) {
    router.push("/auth/login")
    return null
  }

  const filteredGists = gists.filter((gist) => {
    const matchesSearch =
      gist.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      Object.keys(gist.files).some((filename) => filename.toLowerCase().includes(searchTerm.toLowerCase()))

    if (activeTab === "all") return matchesSearch
    if (activeTab === "starred") return matchesSearch && gist.starred
    return matchesSearch
  })

  const handleDeleteGist = async (id: string) => {
    await deleteGist(id)
  }

  const handleToggleStar = async (id: string, isStarred: boolean) => {
    if (isStarred) {
      await unstarGist(id)
    } else {
      await starGist(id)
    }
  }

  if (authLoading || gistsLoading) {
    return (
      <div className="container flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container py-10">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Gists</h1>
          <p className="text-muted-foreground">Manage your code snippets</p>
        </div>
        <Link href="/gists/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Gist
          </Button>
        </Link>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search gists..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Gists</TabsTrigger>
          <TabsTrigger value="starred">Starred</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="space-y-4">
          {filteredGists.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
              <div className="mb-4 rounded-full bg-primary/10 p-3">
                <Code className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-1 text-lg font-medium">No gists found</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                {searchTerm ? "No gists match your search criteria" : "You haven't created any gists yet"}
              </p>
              <Link href="/gists/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create your first gist
                </Button>
              </Link>
            </div>
          ) : (
            filteredGists.map((gist) => (
              <Card key={gist.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        <Link href={`/gists/${gist.id}`} className="hover:underline">
                          {Object.keys(gist.files)[0]}
                        </Link>
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {gist.description || "No description provided"}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleToggleStar(gist.id, gist.starred)}>
                        <Star className={`h-4 w-4 ${gist.starred ? "fill-yellow-400 text-yellow-400" : ""}`} />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/gists/${gist.id}`}>View</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/gists/${gist.id}/edit`}>Edit</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleDeleteGist(gist.id)}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md bg-muted p-4">
                    <pre className="text-sm">
                      <code>{gist.files[Object.keys(gist.files)[0]].content.slice(0, 200)}...</code>
                    </pre>
                  </div>
                </CardContent>
                <CardFooter className="text-xs text-muted-foreground">
                  Created {formatDistanceToNow(new Date(gist.created_at), { addSuffix: true })}
                  {gist.updated_at !== gist.created_at && (
                    <> · Updated {formatDistanceToNow(new Date(gist.updated_at), { addSuffix: true })}</>
                  )}
                </CardFooter>
              </Card>
            ))
          )}
        </TabsContent>
        <TabsContent value="starred" className="space-y-4">
          {filteredGists.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
              <div className="mb-4 rounded-full bg-primary/10 p-3">
                <Star className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-1 text-lg font-medium">No starred gists</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                {searchTerm ? "No starred gists match your search criteria" : "You haven't starred any gists yet"}
              </p>
            </div>
          ) : (
            filteredGists.map((gist) => (
              <Card key={gist.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        <Link href={`/gists/${gist.id}`} className="hover:underline">
                          {Object.keys(gist.files)[0]}
                        </Link>
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {gist.description || "No description provided"}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleToggleStar(gist.id, gist.starred)}>
                        <Star className={`h-4 w-4 ${gist.starred ? "fill-yellow-400 text-yellow-400" : ""}`} />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/gists/${gist.id}`}>View</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/gists/${gist.id}/edit`}>Edit</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleDeleteGist(gist.id)}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md bg-muted p-4">
                    <pre className="text-sm">
                      <code>{gist.files[Object.keys(gist.files)[0]].content.slice(0, 200)}...</code>
                    </pre>
                  </div>
                </CardContent>
                <CardFooter className="text-xs text-muted-foreground">
                  Created {formatDistanceToNow(new Date(gist.created_at), { addSuffix: true })}
                  {gist.updated_at !== gist.created_at && (
                    <> · Updated {formatDistanceToNow(new Date(gist.updated_at), { addSuffix: true })}</>
                  )}
                </CardFooter>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

