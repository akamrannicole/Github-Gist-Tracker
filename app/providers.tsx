"use client"

import type React from "react"

import { AuthProvider } from "@/hooks/use-auth"
import { GistsProvider } from "@/hooks/use-gists"
import { ThemeProvider } from "@/components/theme-provider"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <GistsProvider>{children}</GistsProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

