import type React from "react"
import { Inter } from 'next/font/google'
import { ThemeProvider } from "@/components/theme-provider"
import { SonnerProvider } from "@/components/sonner-provider"
import { AuthProvider } from "@/hooks/use-auth"
import { GistsProvider } from "@/hooks/use-gists"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "GitHub Gist Tracker",
  description: "Manage your GitHub Gists in one place",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
          
            <GistsProvider>
              <div className="flex min-h-screen flex-col">
                <Header />
               
                <main className="flex-1 transition-opacity duration-200">
                  {children}
                </main>
                <Footer />
              </div>
            </GistsProvider>
          </AuthProvider>
        </ThemeProvider>
      
        <SonnerProvider />
      </body>
    </html>
  )
}
