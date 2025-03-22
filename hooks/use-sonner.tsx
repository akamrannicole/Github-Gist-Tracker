"use client"

import { toast } from "sonner"

type ToastType = "success" | "error" | "info" | "warning"

interface ToastOptions {
  description?: string
  duration?: number
}

export function useSonner() {
  const showToast = (
    title: string,
    options?: ToastOptions & { type?: ToastType }
  ) => {
    const { description, type = "info", duration } = options || {}
    
    switch (type) {
      case "success":
        toast.success(title, {
          description,
          duration,
        })
        break
      case "error":
        toast.error(title, {
          description,
          duration,
        })
        break
      case "warning":
        toast.warning(title, {
          description,
          duration,
        })
        break
      default:
        toast(title, {
          description,
          duration,
        })
    }
  }

  return {
    toast: showToast,
  }
}