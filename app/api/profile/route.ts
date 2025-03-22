import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verify } from "jsonwebtoken"
import { connectToDatabase } from "@/lib/mongodb"
import { User } from "@/models/user"

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

// Update profile
export async function PATCH(request: Request) {
  try {
    const user = await getAuthUser()

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { name, email, bio, avatar, githubToken } = await request.json()

    // Update user fields
    if (name) user.name = name
    if (email) user.email = email
    if (bio !== undefined) user.bio = bio
    if (avatar !== undefined) user.avatar = avatar
    if (githubToken !== undefined) user.githubToken = githubToken

    await user.save()

    // Return updated user (without password)
    return NextResponse.json({
      id: user._id,
      name: user.name,
      email: user.email,
      bio: user.bio,
      avatar: user.avatar,
      githubToken: user.githubToken,
    })
  } catch (error) {
    console.error("Profile update error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

// Delete account
export async function DELETE() {
  try {
    const user = await getAuthUser()

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    await User.findByIdAndDelete(user._id)

    // Clear auth cookie
    cookies().delete("auth_token")

    return NextResponse.json({ message: "Account deleted successfully" })
  } catch (error) {
    console.error("Account deletion error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

