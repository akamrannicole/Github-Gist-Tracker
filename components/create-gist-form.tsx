"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useGists } from "@/hooks/use-gists"
import { PlusCircle, X } from "lucide-react"

export function CreateGistForm() {
  const router = useRouter()
  const { createGist } = useGists()
  const [isLoading, setIsLoading] = useState(false)
  const [description, setDescription] = useState("")
  const [isPublic, setIsPublic] = useState(true)
  const [files, setFiles] = useState<{ name: string; content: string }[]>([{ name: "file1.txt", content: "" }])

  const addFile = () => {
    setFiles([...files, { name: `file${files.length + 1}.txt`, content: "" }])
  }

  const removeFile = (index: number) => {
    if (files.length > 1) {
      setFiles(files.filter((_, i) => i !== index))
    }
  }

  const updateFileName = (index: number, name: string) => {
    const newFiles = [...files]
    newFiles[index].name = name
    setFiles(newFiles)
  }

  const updateFileContent = (index: number, content: string) => {
    const newFiles = [...files]
    newFiles[index].content = content
    setFiles(newFiles)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Convert files array to the format expected by GitHub API
      const filesObject: Record<string, { content: string }> = {}
      files.forEach((file) => {
        if (file.name.trim() && file.content.trim()) {
          filesObject[file.name] = { content: file.content }
        }
      })

      // Create the gist
      const newGist = await createGist({
        description,
        public: isPublic,
        files: filesObject,
      })

      // Redirect to the gist detail page
      router.push(`/gists/${newGist.id}`)
    } catch (error) {
      console.error("Error creating gist:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="description">Description (optional)</Label>
        <Input
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What's this gist about?"
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch id="public" checked={isPublic} onCheckedChange={setIsPublic} />
        <Label htmlFor="public">Public gist</Label>
        <p className="text-sm text-muted-foreground ml-2">
          {isPublic ? "Anyone will be able to see this gist" : "Only you can see this gist"}
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Files</h3>
          <Button type="button" variant="outline" size="sm" onClick={addFile}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add File
          </Button>
        </div>

        {files.map((file, index) => (
          <div key={index} className="space-y-2 p-4 border rounded-md">
            <div className="flex justify-between items-center">
              <Label htmlFor={`filename-${index}`}>Filename</Label>
              {files.length > 1 && (
                <Button type="button" variant="ghost" size="sm" onClick={() => removeFile(index)}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <Input
              id={`filename-${index}`}
              value={file.name}
              onChange={(e) => updateFileName(index, e.target.value)}
              placeholder="e.g. script.js"
              required
            />
            <Label htmlFor={`content-${index}`}>Content</Label>
            <Textarea
              id={`content-${index}`}
              value={file.content}
              onChange={(e) => updateFileContent(index, e.target.value)}
              placeholder="// Enter your code here"
              className="min-h-[200px] font-mono"
              required
            />
          </div>
        ))}
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Creating..." : "Create Gist"}
      </Button>
    </form>
  )
}

