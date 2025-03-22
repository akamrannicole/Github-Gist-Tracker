import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verify } from "jsonwebtoken"
import { connectToDatabase } from "@/lib/mongodb"
import { User } from "@/models/user"

export async function GET() {
  try {
    // Get token from cookies
    const token = cookies().get("auth_token")?.value

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Verify token
    const decoded = verify(token, process.env.JWT_SECRET || "default_secret")

    // Connect to database
    await connectToDatabase()

    // Find user
    const user = await User.findById(decoded.id)

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Return user data (without password)
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

