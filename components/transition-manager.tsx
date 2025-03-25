"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"

export function TransitionManager({ children }: { children: React.ReactNode }) {
  const [isTransitioning, setIsTransitioning] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    setIsTransitioning(false)
  }, [pathname])

  const originalPush = router.push
  router.push = (href: string) => {
    setIsTransitioning(true)
    // Small delay to ensure transition state is set before navigation
    setTimeout(() => {
      originalPush(href)
    }, 50)
  }

  return (
    <div
      className={`transition-opacity duration-300 ${isTransitioning ? "opacity-50 pointer-events-none" : "opacity-100"}`}
    >
      {children}
    </div>
  )
}

