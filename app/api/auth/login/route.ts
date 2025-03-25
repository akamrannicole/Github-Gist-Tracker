import { NextResponse } from "next/server"
import { compare } from "bcrypt"
import { connectToDatabase } from "@/lib/mongodb"
import { User } from "@/models/user"
import { sign } from "jsonwebtoken"
import { serialize } from "cookie"

export async function POST(request: Request): Promise<Response> {
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

    // Set auth cookie
    const cookie = serialize("authToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    })

    const response = NextResponse.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        bio: user.bio,
        avatar: user.avatar,
        githubToken: user.githubToken,
      },
    })

    response.headers.set("Set-Cookie", cookie)
    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
