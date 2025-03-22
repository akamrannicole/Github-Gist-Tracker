"use client"

import { Toaster as SonnerToaster } from "sonner"
import { useTheme } from "next-themes"

export function SonnerProvider() {
  const { theme } = useTheme()
  
  return (
    <SonnerToaster
      position="bottom-right"
      toastOptions={{
        style: {
          background: "var(--background)",
          color: "var(--foreground)",
          border: "1px solid var(--border)",
        },
      }}
      theme={theme as "light" | "dark" | "system"}
      closeButton
    />
  )
}