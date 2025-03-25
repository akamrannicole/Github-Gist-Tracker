import { NextResponse } from "next/server"
import { compare } from "bcrypt"
import { connectToDatabase } from "@/lib/mongodb"
import { User } from "@/models/user"
import { sign } from "jsonwebtoken"
import { setAuthCookie } from "@/lib/auth-utils"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    await connectToDatabase()

    const user = await User.findOne({ email })
    if (!user) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 })
    }

    const isPasswordValid = await compare(password, user.password)
    if (!isPasswordValid) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 })
    }

    const token = sign({ id: user._id }, process.env.JWT_SECRET || "default_secret", { expiresIn: "7d" })

    await setAuthCookie(token)

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
    console.error("Login error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}