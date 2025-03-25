"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useGists } from "@/hooks/use-gists"
import { useAuth } from "@/hooks/use-auth"
import { Loader2 } from "lucide-react"

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

// Define the type for updating gist files
interface GistFilesUpdate {
  [filename: string]: { content: string } | null
}

const gistSchema = z.object({
  description: z.string().min(1, "Description is required"),
  filename: z.string().min(1, "Filename is required"),
  content: z.string().min(1, "Content is required"),
})

type GistFormValues = z.infer<typeof gistSchema>

export default function EditGistPage() {
  const params = useParams()
  const id = params?.id as string
  const { getGist, updateGist } = useGists()
  const { user, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [originalFilename, setOriginalFilename] = useState("")
  const [updateComplete, setUpdateComplete] = useState(false)
  const router = useRouter()

  const form = useForm<GistFormValues>({
    resolver: zodResolver(gistSchema),
    defaultValues: {
      description: "",
      filename: "",
      content: "",
    },
  })

  // Handle navigation after successful update
  useEffect(() => {
    if (updateComplete) {
      // Use a longer delay to ensure all state updates are complete
      const timer = setTimeout(() => {
        router.push(`/gists`)
      }, 300)

      return () => clearTimeout(timer)
    }
  }, [updateComplete, id, router])

  useEffect(() => {
    const fetchGist = async () => {
      if (!id) return

      try {
        setLoading(true)
        const gist = (await getGist(id)) as Gist

        if (!gist || !gist.files) {
          console.error("Invalid gist data received")
          setLoading(false)
          return
        }

        const filename = Object.keys(gist.files)[0]
        setOriginalFilename(filename)

        form.reset({
          description: gist.description || "",
          filename: filename,
          content: gist.files[filename]?.content || "",
        })
      } catch (error) {
        console.error("Error fetching gist:", error)
      } finally {
        setLoading(false)
      }
    }

    if (user && !authLoading) {
      fetchGist()
    }
  }, [id, user, authLoading, getGist, form])

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login")
    }
  }, [authLoading, user, router])

  const onSubmit = async (data: GistFormValues) => {
    if (!id) return

    try {
      setIsSubmitting(true)

      // Create a properly typed files object
      const files: GistFilesUpdate = {}

      if (data.filename !== originalFilename) {
        files[originalFilename] = null
        files[data.filename] = { content: data.content }
      } else {
        files[data.filename] = { content: data.content }
      }

      await updateGist(id, {
        description: data.description,
        files,
      })

      // Set update complete to trigger navigation effect
      setUpdateComplete(true)
    } catch (error) {
      console.error("Error updating gist:", error)
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="container flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return null // Will redirect in the effect
  }

  return (
    <div className="container py-10">
      <div className="mx-auto max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Edit Gist</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter a description for your gist" {...field} />
                      </FormControl>
                      <FormDescription>A brief description of what your gist contains.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="filename"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Filename</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., example.js" {...field} />
                      </FormControl>
                      <FormDescription>The name of your file, including the extension.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Enter your code or text here" className="font-mono h-64" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push(`/gists/${id}`)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating Gist...
                      </>
                    ) : (
                      "Update Gist"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

