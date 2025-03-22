"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { GithubIcon, Menu } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"

export function Header() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const routes = [
    {
      href: "/",
      label: "Home",
      active: pathname === "/",
    },
    {
      href: "/gists",
      label: "My Gists",
      active: pathname === "/gists",
    },
    {
      href: "/profile",
      label: "Profile",
      active: pathname === "/profile",
    },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="pr-0">
              <div className="px-7">
                <Link href="/" className="flex items-center gap-2 font-semibold" onClick={() => setOpen(false)}>
                  <GithubIcon className="h-5 w-5" />
                  <span>Gist Tracker</span>
                </Link>
              </div>
              <nav className="flex flex-col gap-4 px-2 pt-8">
                {routes.map((route) => (
                  <Link
                    key={route.href}
                    href={route.href}
                    className={`block px-4 py-2 text-sm font-medium ${
                      route.active ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                    } rounded-md hover:bg-accent hover:text-accent-foreground`}
                    onClick={() => setOpen(false)}
                  >
                    {route.label}
                  </Link>
                ))}
                {!user ? (
                  <>
                    <Link
                      href="/auth/login"
                      className="block px-4 py-2 text-sm font-medium text-muted-foreground rounded-md hover:bg-accent hover:text-accent-foreground"
                      onClick={() => setOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      href="/auth/register"
                      className="block px-4 py-2 text-sm font-medium text-muted-foreground rounded-md hover:bg-accent hover:text-accent-foreground"
                      onClick={() => setOpen(false)}
                    >
                      Register
                    </Link>
                  </>
                ) : (
                  <Button
                    variant="ghost"
                    className="justify-start px-4 py-2 text-sm font-medium text-muted-foreground rounded-md hover:bg-accent hover:text-accent-foreground"
                    onClick={() => {
                      logout()
                      setOpen(false)
                    }}
                  >
                    Logout
                  </Button>
                )}
              </nav>
            </SheetContent>
          </Sheet>
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <GithubIcon className="h-5 w-5" />
            <span className="hidden md:inline-block">Gist Tracker</span>
          </Link>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={`text-sm font-medium ${
                route.active ? "text-foreground" : "text-muted-foreground"
              } transition-colors hover:text-foreground`}
            >
              {route.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {!user ? (
            <div className="hidden md:flex items-center gap-2">
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">
                  Login
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button size="sm">Register</Button>
              </Link>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={logout}>
                Logout
              </Button>
            </div>
          )}
          <ModeToggle />
        </div>
      </div>
    </header>
  )
}

