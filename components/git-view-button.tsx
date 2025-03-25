"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useGists } from "@/hooks/use-gists" // Update this path to match your actual gists provider location

interface GistViewButtonProps {
  gistId: string
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive"
  size?: "default" | "sm" | "lg" | "icon"
  children: React.ReactNode
  action: "view" | "edit"
}

export function GistViewButton({
  gistId,
  variant = "default",
  size = "default",
  children,
  action,
}: GistViewButtonProps) {
  const [isNavigating, setIsNavigating] = useState(false)
  const router = useRouter()
  const { loadingGists } = useGists()

  // Check if this specific gist is already loading from context
  const isLoading = loadingGists[gistId] || isNavigating

  const handleClick = () => {
    if (isLoading) return

    setIsNavigating(true)

    // Determine the path based on the action
    const path = action === "edit" ? `/gists/${gistId}/edit` : `/gists/${gistId}`

    // Add a delay to ensure loading state is visible
    setTimeout(() => {
      router.push(path)
    }, 100)
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={isLoading}
      className="relative transition-all duration-200"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {action === "edit" ? "Opening editor..." : "Loading..."}
        </>
      ) : (
        children
      )}
    </Button>
  )
}

