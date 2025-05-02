import mongoose, { Schema } from "mongoose"
import type { Comment } from "../types"

const CommentSchema = new Schema<Comment>(
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
    parentId: {
      type: String,
      default: null,
    },
    author: {
      name: {
        type: String,
        required: [true, "Please provide an author name"],
        trim: true,
      },
      email: {
        type: String,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please provide a valid email"],
        trim: true,
        lowercase: true,
      },
      avatar: {
        type: String,
      },
    },
    content: {
      type: String,
      required: [true, "Please provide comment content"],
      trim: true,
    },
    approved: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
)

export default mongoose.model<Comment>("Comment", CommentSchema)
