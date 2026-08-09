import mongoose, { Schema } from "mongoose"
import type { Like } from "../types"

const LikeSchema = new Schema<Like>(
  {
    contentId: {
      type: String,
      required: [true, "Please provide a content ID"],
    },
    contentType: {
      type: String,
      enum: ["blog", "project"],
      required: [true, "Please provide a content type"],
    },
    ipAddress: {
      type: String,
      required: [true, "Please provide an IP address"],
    },
  },
  { timestamps: true },
)

// Create a compound index to prevent duplicate likes
LikeSchema.index({ contentId: 1, contentType: 1, ipAddress: 1 }, { unique: true })

export default mongoose.model("Like", LikeSchema)
