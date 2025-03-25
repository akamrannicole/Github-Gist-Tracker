import { NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth-utils"

const GITHUB_API_BASE = "https://api.github.com"

interface Gist {
  id: string
  description: string
  files: Record<string, { filename: string; type: string; language?: string }>
  owner: { login: string }
  starred?: boolean
}

export async function GET() {
  try {
    const user = await getAuthUser()

    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    if (!user.githubToken) {
      return NextResponse.json(
        { error: "GitHub token not found. Please add your GitHub token in profile settings." },
        { status: 400 }
      )
    }

    const response = await fetch(`${GITHUB_API_BASE}/gists`, {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${user.githubToken}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("GitHub API error:", errorData)
      return NextResponse.json(
        { error: `GitHub API error: ${response.status} - ${errorData.message || "Unknown error"}` },
        { status: response.status }
      )
    }

    const gists: Gist[] = await response.json()

    // Fetch starred status for each gist safely
    const gistsWithStarred = await Promise.all(
      gists.map(async (gist: Gist): Promise<Gist> => {
        try {
          const starResponse = await fetch(`${GITHUB_API_BASE}/gists/${gist.id}/star`, {
            headers: {
              Accept: "application/vnd.github+json",
              Authorization: `Bearer ${user.githubToken}`,
              "X-GitHub-Api-Version": "2022-11-28",
            },
          })

          gist.starred = starResponse.status === 204
        } catch (error) {
          console.error(`Error checking star status for gist ${gist.id}:`, error)
          gist.starred = false
        }

        return gist
      })
    )

    return NextResponse.json(gistsWithStarred)
  } catch (error) {
    console.error("Error fetching gists:", error)
    return NextResponse.json({ error: "Failed to fetch gists" }, { status: 500 })
  }
}
