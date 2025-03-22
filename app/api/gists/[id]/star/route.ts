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

// Star a gist
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser()

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    if (!user.githubToken) {
      return NextResponse.json({ message: "GitHub token not found" }, { status: 400 })
    }

    // Star gist via GitHub API
    const response = await fetch(`https://api.github.com/gists/${params.id}/star`, {
      method: "PUT",
      headers: {
        Authorization: `token ${user.githubToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    })

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`)
    }

    return NextResponse.json({ message: "Gist starred successfully" })
  } catch (error) {
    console.error("Star gist error:", error)
    return NextResponse.json({ message: "Failed to star gist" }, { status: 500 })
  }
}

// Unstar a gist
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser()

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    if (!user.githubToken) {
      return NextResponse.json({ message: "GitHub token not found" }, { status: 400 })
    }

    // Unstar gist via GitHub API
    const response = await fetch(`https://api.github.com/gists/${params.id}/star`, {
      method: "DELETE",
      headers: {
        Authorization: `token ${user.githubToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    })

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`)
    }

    return NextResponse.json({ message: "Gist unstarred successfully" })
  } catch (error) {
    console.error("Unstar gist error:", error)
    return NextResponse.json({ message: "Failed to unstar gist" }, { status: 500 })
  }
}

