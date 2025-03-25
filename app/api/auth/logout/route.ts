import { NextResponse } from "next/server"
import { deleteAuthCookie } from "@/lib/auth-utils"

export async function POST() {
  try {
   
    await deleteAuthCookie()
    
    return NextResponse.json({ message: "Logged out successfully" })
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}