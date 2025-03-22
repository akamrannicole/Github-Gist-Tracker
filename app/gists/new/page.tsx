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
import { Checkbox } from "@/components/ui/checkbox"
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

export default function NewGistPage() {
  const { createGist } = useGists()
  const { user, loading: authLoading } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const [shouldRender, setShouldRender] = useState(false)

  useEffect(() => {
    if (!authLoading) {
      setShouldRender(true)
    }
  }, [authLoading])

  // Redirect if not logged in
  if (!authLoading && !user) {
    router.push("/auth/login")
    return null
  }

  const form = useForm<GistFormValues>({
    resolver: zodResolver(gistSchema),
    defaultValues: {
      description: "",
      filename: "",
      content: "",
      isPublic: true,
    },
  })

  const onSubmit = async (data: GistFormValues) => {
    try {
      setIsSubmitting(true)
      const files = {
        [data.filename]: {
          content: data.content,
        },
      }
      const gist = await createGist({
        description: data.description,
        public: data.isPublic,
        files,
      })
      router.push(`/gists/${gist.id}`)
    } catch (error) {
      console.error("Error creating gist:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!shouldRender) {
    return null
  }

  return (
    <div className="container py-10">
      <div className="mx-auto max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Create a new Gist</CardTitle>
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
                <FormField
                  control={form.control}
                  name="isPublic"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Public gist</FormLabel>
                        <FormDescription>
                          Anyone will be able to see this gist. Private gists are only available in GitHub Pro.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Gist...
                    </>
                  ) : (
                    "Create Gist"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

