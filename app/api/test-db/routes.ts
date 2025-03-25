import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET() {
  try {
    const mongoose = await connectToDatabase()
    return NextResponse.json({
      message: "Database connection successful!",
      mongoose: mongoose ? "Connected" : "Not connected",
      models: Object.keys(mongoose.models),
    })
  } catch (error) {
    console.error("Database connection error:", error)
    return NextResponse.json(
      {
        message: "Failed to connect to database",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

