import mongoose, { Schema, type Model } from "mongoose"
import bcrypt from "bcryptjs"
import type { User } from "../types"

export interface UserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>
}

const UserSchema = new Schema<User, Model<User>, UserMethods>(
  {
    name: {
      type: String,
      required: [true, "Please provide a name"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Please provide an email"],
      unique: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please provide a valid email"],
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    role: {
      type: String,
      enum: ["admin"],
      default: "admin",
    },
  },
  { timestamps: true },
)

// Hash password before saving
UserSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return
  }

  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
})

// Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password)
}

export default mongoose.model("User", UserSchema)
