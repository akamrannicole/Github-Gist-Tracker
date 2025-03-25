import { NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth-utils"

const GITHUB_API_BASE = "https://api.github.com"

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser()

    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    if (!user.githubToken) {
      return NextResponse.json({ error: "GitHub token not found" }, { status: 400 })
    }

    const { id } = params

    const response = await fetch(`${GITHUB_API_BASE}/gists/${id}/star`, {
      method: "PUT",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${user.githubToken}`,
        "Content-Type": "application/json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    })

    if (!response.ok) {
      return NextResponse.json({ error: `GitHub API error: ${response.status}` }, { status: response.status })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error starring gist:", error)
    return NextResponse.json({ error: "Failed to star gist" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser()

    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    if (!user.githubToken) {
      return NextResponse.json({ error: "GitHub token not found" }, { status: 400 })
    }

    const { id } = params

    const response = await fetch(`${GITHUB_API_BASE}/gists/${id}/star`, {
      method: "DELETE",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${user.githubToken}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
    })

    if (!response.ok) {
      return NextResponse.json({ error: `GitHub API error: ${response.status}` }, { status: response.status })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error unstarring gist:", error)
    return NextResponse.json({ error: "Failed to unstar gist" }, { status: 500 })
  }
}

