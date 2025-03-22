import Link from "next/link"
import { Button } from "@/components/ui/button"
import { GithubIcon } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    GitHub Gist Tracker
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Manage your GitHub Gists in one place. Create, edit, and organize your code snippets with ease.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/auth/register">
                    <Button size="lg" className="w-full">
                      Get Started
                    </Button>
                  </Link>
                  <Link href="/auth/login">
                    <Button size="lg" variant="outline" className="w-full">
                      Sign In
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative h-[350px] w-full overflow-hidden rounded-xl border bg-background p-4 shadow-xl">
                  <div className="flex h-full flex-col gap-4 overflow-hidden rounded-md bg-muted p-6">
                    <div className="flex items-center gap-2">
                      <GithubIcon className="h-6 w-6" />
                      <h3 className="text-xl font-semibold">Your Gists</h3>
                    </div>
                    <div className="grid gap-2">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="rounded-lg border bg-card p-3">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="font-medium">Example Gist {i + 1}</div>
                              <div className="text-xs text-muted-foreground">2 days ago</div>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              A simple code snippet for demonstration purposes.
                            </div>
                            <div className="rounded-md bg-muted p-2">
                              <code className="text-xs">
                                <pre>{`function example${i + 1}() {\n  console.log("Hello, world!");\n}`}</pre>
                              </code>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

