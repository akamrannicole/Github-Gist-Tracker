import { cookies } from "next/headers"
import { verify, type JwtPayload } from "jsonwebtoken"
import { connectToDatabase } from "@/lib/mongodb"
import { User } from "@/models/user"
import { Octokit } from "@octokit/rest"

export interface Gist {
  id: string
  description: string
  public: boolean
  created_at: string
  updated_at: string
  files: Record<
    string,
    {
      filename: string
      type: string
      language: string
      raw_url: string
      size: number
      content?: string
    }
  >
  owner: {
    login: string
    id: number
    avatar_url: string
  }
  html_url: string
  starred?: boolean
}

export interface CustomJwtPayload extends JwtPayload {
  id: string
}

export async function getAuthUser() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth_token")?.value

    if (!token) {
      console.log("No auth token found in cookies")
      return null
    }

    const decoded = verify(token, process.env.JWT_SECRET || "default_secret") as CustomJwtPayload

    await connectToDatabase()
    const user = await User.findById(decoded.id)

    if (!user) {
      console.log("User not found with ID:", decoded.id)
    }

    return user
  } catch (error) {
    console.error("Authentication error:", error)
    return null
  }
}

export async function getGitHubApi() {
  const user = await getAuthUser()

  if (!user || !user.githubToken) {
    return null
  }

  try {
    const github = new Octokit({
      auth: user.githubToken,
      userAgent: "Gist Tracker App",
    })
    return github.rest
  } catch (error) {
    console.error("Failed to initialize GitHub API:", error)
    return null
  }
}

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies()

  cookieStore.set("auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60, 
    path: "/",
  })
}

export async function deleteAuthCookie() {
  const cookieStore = await cookies()
  cookieStore.delete("auth_token")
}

