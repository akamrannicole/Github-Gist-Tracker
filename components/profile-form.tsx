"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

export function ProfileForm() {
  const [githubToken, setGithubToken] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSaveToken = async () => {
    setIsSaving(true)
    setSuccessMessage(null)
    setErrorMessage(null)

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ githubToken }),
      })

      if (response.ok) {
        setSuccessMessage("GitHub token saved successfully!")
      } else {
        const errorData = await response.json()
        setErrorMessage(errorData.error || "Failed to save GitHub token.")
      }
    } catch (error) {
      console.error("Error saving GitHub token:", error)
      setErrorMessage("An unexpected error occurred.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div>
      <div className="grid gap-2">
        <label
          htmlFor="githubToken"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          GitHub Token
        </label>
        <Input
          id="githubToken"
          placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
          value={githubToken}
          onChange={(e) => setGithubToken(e.target.value)}
        />
      </div>
      <Button className="mt-4" onClick={handleSaveToken} disabled={isSaving}>
        {isSaving ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          "Save GitHub Token"
        )}
      </Button>

      {successMessage && <div className="mt-4 text-green-500">{successMessage}</div>}

      {errorMessage && <div className="mt-4 text-red-500">{errorMessage}</div>}
    </div>
  )
}

