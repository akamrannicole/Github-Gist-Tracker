"use client"

import { AuthProvider } from "@/hooks/use-auth"
import { GistsProvider } from "@/hooks/use-gists"
import { ThemeProvider } from "@/components/theme-provider"
import { SonnerProvider } from "@/components/sonner-provider"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <GistsProvider>{children}</GistsProvider>
      </AuthProvider>
      <SonnerProvider />
    </ThemeProvider>
  )
}