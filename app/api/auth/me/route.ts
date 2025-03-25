import { NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth-utils"

export async function GET() {
  try {
    const user = await getAuthUser()
    
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }
    
    return NextResponse.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        bio: user.bio,
        avatar: user.avatar,
        githubToken: user.githubToken,
      },
    })
  } catch (error) {
    console.error("Auth check error:", error)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }
}