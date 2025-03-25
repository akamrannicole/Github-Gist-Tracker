import { NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth-utils"

// Base URL for GitHub API
const GITHUB_API_BASE = "https://api.github.com"

// This is the simplest form of the route handler
export async function GET(req: Request, { params }: any) {
  try {
    const user = await getAuthUser()

    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    if (!user.githubToken) {
      return NextResponse.json({ error: "GitHub token not found" }, { status: 400 })
    }

    const id = params.id

    const response = await fetch(`${GITHUB_API_BASE}/gists/${id}`, {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${user.githubToken}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
    })

    if (!response.ok) {
      return NextResponse.json({ error: `GitHub API error: ${response.status}` }, { status: response.status })
    }

    const gist = await response.json()

    // Check if user has starred this gist
    const starResponse = await fetch(`${GITHUB_API_BASE}/gists/${id}/star`, {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${user.githubToken}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
    })

    gist.starred = starResponse.status === 204

    return NextResponse.json(gist)
  } catch (error) {
    console.error("Error fetching gist:", error)
    return NextResponse.json({ error: "Failed to fetch gist" }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: any) {
  try {
    const user = await getAuthUser()

    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    if (!user.githubToken) {
      return NextResponse.json({ error: "GitHub token not found" }, { status: 400 })
    }

    const id = params.id
    const data = await req.json()

    const response = await fetch(`${GITHUB_API_BASE}/gists/${id}`, {
      method: "PATCH",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${user.githubToken}`,
        "Content-Type": "application/json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      return NextResponse.json({ error: `GitHub API error: ${response.status}` }, { status: response.status })
    }

    const updatedGist = await response.json()

    // Check if user has starred this gist
    const starResponse = await fetch(`${GITHUB_API_BASE}/gists/${id}/star`, {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${user.githubToken}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
    })

    updatedGist.starred = starResponse.status === 204

    return NextResponse.json(updatedGist)
  } catch (error) {
    console.error("Error updating gist:", error)
    return NextResponse.json({ error: "Failed to update gist" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: any) {
  try {
    const user = await getAuthUser()

    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    if (!user.githubToken) {
      return NextResponse.json({ error: "GitHub token not found" }, { status: 400 })
    }

    const id = params.id

    const response = await fetch(`${GITHUB_API_BASE}/gists/${id}`, {
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
    console.error("Error deleting gist:", error)
    return NextResponse.json({ error: "Failed to delete gist" }, { status: 500 })
  }
}

