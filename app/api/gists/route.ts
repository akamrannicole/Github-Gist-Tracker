import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verify } from "jsonwebtoken"
import { connectToDatabase } from "@/lib/mongodb"
import { User } from "@/models/user"

// Get authenticated user
async function getAuthUser() {
  const token = cookies().get("auth_token")?.value

  if (!token) {
    return null
  }

  try {
    const decoded = verify(token, process.env.JWT_SECRET || "default_secret")
    await connectToDatabase()
    return await User.findById(decoded.id)
  } catch (error) {
    return null
  }
}

// Get all gists
export async function GET() {
  try {
    const user = await getAuthUser()

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    if (!user.githubToken) {
      return NextResponse.json({ message: "GitHub token not found" }, { status: 400 })
    }

    // Fetch gists from GitHub API
    const response = await fetch("https://api.github.com/gists", {
      headers: {
        Authorization: `token ${user.githubToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    })

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`)
    }

    const gists = await response.json()

    // Fetch starred gists to mark which ones are starred
    const starredResponse = await fetch("https://api.github.com/gists/starred", {
      headers: {
        Authorization: `token ${user.githubToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    })

    const starredGists = starredResponse.ok ? await starredResponse.json() : []
    const starredIds = new Set(starredGists.map((gist) => gist.id))

    // Mark starred gists
    const gistsWithStarred = gists.map((gist) => ({
      ...gist,
      starred: starredIds.has(gist.id),
    }))

    return NextResponse.json(gistsWithStarred)
  } catch (error) {
    console.error("Fetch gists error:", error)
    return NextResponse.json({ message: "Failed to fetch gists" }, { status: 500 })
  }
}

// Create a new gist
export async function POST(request: Request) {
  try {
    const user = await getAuthUser()

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    if (!user.githubToken) {
      return NextResponse.json({ message: "GitHub token not found" }, { status: 400 })
    }

    const data = await request.json()

    // Create gist via GitHub API
    const response = await fetch("https://api.github.com/gists", {
      method: "POST",
      headers: {
        Authorization: `token ${user.githubToken}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`)
    }

    const gist = await response.json()

    return NextResponse.json({ ...gist, starred: false })
  } catch (error) {
    console.error("Create gist error:", error)
    return NextResponse.json({ message: "Failed to create gist" }, { status: 500 })
  }
}

