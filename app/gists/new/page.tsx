"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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

const gistSchema = z.object({
  description: z.string().min(1, "Description is required"),
  filename: z.string().min(1, "Filename is required"),
  content: z.string().min(1, "Content is required"),
  isPublic: z.boolean().default(true),
})

type GistFormValues = z.infer<typeof gistSchema>

export default function CreateGistPage() {
  const { createGist, loading: gistLoading } = useGists()
  const { user, loading: authLoading } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [createdGistId, setCreatedGistId] = useState<string | null>(null)
  const router = useRouter()

  const form = useForm<GistFormValues>({
    resolver: zodResolver(gistSchema),
    defaultValues: {
      description: "",
      filename: "",
      content: "",
      isPublic: true,
    },
  })

  // Handle navigation after successful creation
  useEffect(() => {
    if (createdGistId) {
      // Use a longer delay to ensure all state updates are complete
      const timer = setTimeout(() => {
        router.push("/gists")
      }, 300)

      return () => clearTimeout(timer)
    }
  }, [createdGistId, router])

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login")
    }
  }, [authLoading, user, router])

  const onSubmit = async (data: GistFormValues) => {
    try {
      setIsSubmitting(true)

      const gistData = {
        description: data.description,
        public: data.isPublic,
        files: {
          [data.filename]: { content: data.content },
        },
      }

      const newGist = await createGist(gistData)

      // Store the created gist ID to trigger the navigation effect
      setCreatedGistId(newGist.id)
    } catch (error) {
      console.error("Error creating gist:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (authLoading) {
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
            <CardTitle className="text-2xl">Create New Gist</CardTitle>
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
                  <Button type="button" variant="outline" onClick={() => router.push("/gists")} disabled={isSubmitting}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting || gistLoading} className="min-w-[120px]">
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Gist"
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

