import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verify, type JwtPayload } from "jsonwebtoken";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/user";

interface CustomJwtPayload extends JwtPayload {
  id: string;
}

async function getAuthUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    return null;
  }

  try {
    const decoded = verify(token, process.env.JWT_SECRET || "default_secret") as CustomJwtPayload;
    await connectToDatabase();
    return await User.findById(decoded.id);
  } catch (error) {
    console.error("Token verification error:", error); // ✅ Log the error to avoid ESLint warning
    return null;
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getAuthUser();

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, bio, avatar, githubToken } = body;

    if (name) user.name = name;
    if (email) user.email = email;
    if (bio !== undefined) user.bio = bio;
    if (avatar !== undefined) user.avatar = avatar;
    if (githubToken !== undefined) user.githubToken = githubToken;

    await user.save();

    return NextResponse.json({
      id: user._id,
      name: user.name,
      email: user.email,
      bio: user.bio,
      avatar: user.avatar,
      hasGithubToken: !!user.githubToken,
    });
  } catch (error) {
    console.error("Profile update error:", error); // ✅ Log the error
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const user = await getAuthUser();

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await User.findByIdAndDelete(user._id);

    const cookieStore = await cookies();
    cookieStore.delete("auth_token");

    return NextResponse.json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("Account deletion error:", error); // ✅ Log the error
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
