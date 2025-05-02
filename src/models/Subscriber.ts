import mongoose, { Schema } from "mongoose"
import type { Subscriber } from "../types"

const SubscriberSchema = new Schema<Subscriber>(
  {
    email: {
      type: String,
      required: [true, "Please provide an email"],
      unique: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please provide a valid email"],
      trim: true,
      lowercase: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
)

export default mongoose.model<Subscriber>("Subscriber", SubscriberSchema)
