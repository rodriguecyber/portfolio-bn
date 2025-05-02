import mongoose, { Schema } from "mongoose"
import type { Contact } from "../types"

const ContactSchema = new Schema<Contact>(
  {
    name: {
      type: String,
      required: [true, "Please provide a name"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Please provide an email"],
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please provide a valid email"],
      trim: true,
      lowercase: true,
    },
    subject: {
      type: String,
      required: [true, "Please provide a subject"],
      trim: true,
    },
    message: {
      type: String,
      required: [true, "Please provide a message"],
      trim: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
)

export default mongoose.model<Contact>("Contact", ContactSchema)
