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

// Get a single gist
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser()

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    if (!user.githubToken) {
      return NextResponse.json({ message: "GitHub token not found" }, { status: 400 })
    }

    // Fetch gist from GitHub API
    const response = await fetch(`https://api.github.com/gists/${params.id}`, {
      headers: {
        Authorization: `token ${user.githubToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    })

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`)
    }

    const gist = await response.json()

    // Check if gist is starred
    const starredResponse = await fetch(`https://api.github.com/gists/${params.id}/star`, {
      method: "GET",
      headers: {
        Authorization: `token ${user.githubToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    })

    return NextResponse.json({
      ...gist,
      starred: starredResponse.status === 204,
    })
  } catch (error) {
    console.error("Fetch gist error:", error)
    return NextResponse.json({ message: "Failed to fetch gist" }, { status: 500 })
  }
}

// Update a gist
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser()

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    if (!user.githubToken) {
      return NextResponse.json({ message: "GitHub token not found" }, { status: 400 })
    }

    const data = await request.json()

    // Update gist via GitHub API
    const response = await fetch(`https://api.github.com/gists/${params.id}`, {
      method: "PATCH",
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

    // Check if gist is starred
    const starredResponse = await fetch(`https://api.github.com/gists/${params.id}/star`, {
      method: "GET",
      headers: {
        Authorization: `token ${user.githubToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    })

    return NextResponse.json({
      ...gist,
      starred: starredResponse.status === 204,
    })
  } catch (error) {
    console.error("Update gist error:", error)
    return NextResponse.json({ message: "Failed to update gist" }, { status: 500 })
  }
}

// Delete a gist
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser()

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    if (!user.githubToken) {
      return NextResponse.json({ message: "GitHub token not found" }, { status: 400 })
    }

    // Delete gist via GitHub API
    const response = await fetch(`https://api.github.com/gists/${params.id}`, {
      method: "DELETE",
      headers: {
        Authorization: `token ${user.githubToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    })

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`)
    }

    return NextResponse.json({ message: "Gist deleted successfully" })
  } catch (error) {
    console.error("Delete gist error:", error)
    return NextResponse.json({ message: "Failed to delete gist" }, { status: 500 })
  }
}

