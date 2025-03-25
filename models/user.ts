import mongoose from "mongoose"

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a name"],
      maxlength: [60, "Name cannot be more than 60 characters"],
    },
    email: {
      type: String,
      required: [true, "Please provide an email"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
    },
    bio: {
      type: String,
      maxlength: [200, "Bio cannot be more than 200 characters"],
    },
    avatar: {
      type: String,
    },
    githubToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
)

// Check if the model is already defined to prevent overwriting
export const User = mongoose.models.User || mongoose.model("User", UserSchema)

