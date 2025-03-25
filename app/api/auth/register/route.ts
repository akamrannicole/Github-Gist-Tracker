import { NextResponse } from "next/server"
import { hash } from "bcrypt"
import { connectToDatabase } from "@/lib/mongodb"
import { User } from "@/models/user"
import { sign } from "jsonwebtoken"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  try {
    console.log("Registration API called")
    let body
    try {
      body = await request.json()
      console.log("Request body:", body)
    } catch (e) {
      console.error("Error parsing request body:", e)
      return NextResponse.json({ message: "Invalid request body" }, { status: 400 })
    }

    const { name, email, password } = body

    if (!name || !email || !password) {
      console.log("Missing required fields")
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }
    
    console.log("Connecting to database...")
    try {
      await connectToDatabase()
      console.log("Database connection successful")
    } catch (dbError) {
      console.error("Database connection error:", dbError)
      return NextResponse.json({ message: "Database connection failed", error: String(dbError) }, { status: 500 })
    }

    // Check if user already exists
    console.log("Checking if user exists...")
    let existingUser
    try {
      existingUser = await User.findOne({ email })
      console.log("Existing user check result:", existingUser ? "User exists" : "User does not exist")
    } catch (findError) {
      console.error("Error checking existing user:", findError)
      return NextResponse.json({ message: "Error checking user existence", error: String(findError) }, { status: 500 })
    }

    if (existingUser) {
      return NextResponse.json({ message: "User already exists" }, { status: 409 })
    }

    // Hash password
    console.log("Hashing password...")
    let hashedPassword
    try {
      hashedPassword = await hash(password, 10)
      console.log("Password hashed successfully")
    } catch (hashError) {
      console.error("Error hashing password:", hashError)
      return NextResponse.json({ message: "Error hashing password", error: String(hashError) }, { status: 500 })
    }

    // Create user
    console.log("Creating user...")
    let user
    try {
      user = await User.create({
        name,
        email,
        password: hashedPassword,
      })
      console.log("User created successfully:", user._id.toString())
    } catch (createError) {
      console.error("Error creating user:", createError)
      return NextResponse.json({ message: "Error creating user", error: String(createError) }, { status: 500 })
    }

    // Create JWT token
    console.log("Creating JWT token...")
    let token
    try {
      token = sign({ id: user._id.toString() }, process.env.JWT_SECRET || "default_secret", { expiresIn: "7d" })
      console.log("JWT token created successfully")
    } catch (tokenError) {
      console.error("Error creating JWT token:", tokenError)
      return NextResponse.json(
        { message: "Error creating authentication token", error: String(tokenError) },
        { status: 500 },
      )
    }

    // Set cookie
    console.log("Setting cookie...")
    try {
      const cookieStore = await cookies() // Added await here
      cookieStore.set({
        name: "auth_token",
        value: token,
        httpOnly: true,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })
      console.log("Cookie set successfully")
    } catch (cookieError) {
      console.error("Error setting cookie:", cookieError)
      // Continue even if cookie setting fails
    }

    // Return user data
    console.log("Returning user data")
    return NextResponse.json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        bio: user.bio || "",
        avatar: user.avatar || "",
        githubToken: user.githubToken || "",
      },
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      {
        message: "Internal server error",
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}