import mongoose, { Schema } from "mongoose"
import type { ServerHealth } from "../types"

const ServerHealthSchema = new Schema<ServerHealth>({
  timestamp: {
    type: Date,
    default: Date.now,
  },
  cpu: {
    type: Number,
    required: true,
  },
  memory: {
    type: Number,
    required: true,
  },
  requests: {
    type: Number,
    required: true,
  },
  errors: {
    type: Number,
    required: true,
  },
})

export default mongoose.model<ServerHealth>("ServerHealth", ServerHealthSchema)
