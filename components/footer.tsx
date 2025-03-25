import Link from "next/link"
import { GithubIcon } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container flex flex-col items-center justify-between gap-4 py-6 md:flex-row">
        <div className="flex items-center gap-2">
          <GithubIcon className="h-5 w-5" />
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} GitHub Gist Tracker. All rights reserved.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/terms" className="text-sm text-muted-foreground hover:underline">
            Terms
          </Link>
          <Link href="/privacy" className="text-sm text-muted-foreground hover:underline">
            Privacy
          </Link>
          <Link href="https://github.com" className="text-sm text-muted-foreground hover:underline">
            GitHub
          </Link>
        </div>
      </div>
    </footer>
  )
}

