import mongoose, { Schema } from "mongoose"
import slugify from "slugify"
import type { Project } from "../types"

const ProjectSchema = new Schema<Project>(
  {
    title: {
      type: String,
      required: [true, "Please provide a title"],
      trim: true,
      maxlength: [100, "Title cannot be more than 100 characters"],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, "Please provide a description"],
      maxlength: [200, "Description cannot be more than 200 characters"],
    },
    longDescription: {
      type: String,
      required: [true, "Please provide a long description"],
    },
    tags: {
      type: [String],
      required: [true, "Please provide at least one tag"],
    },
    image: {
      type: String,
      required: [true, "Please provide an image"],
    },
    demoUrl: {
      type: String,
      required: [true, "Please provide a demo URL"],
    },
    repoUrl: {
      type: String,
      required: [true, "Please provide a repository URL"],
    },
    versions: [
      {
        version: {
          type: String,
          required: true,
        },
        date: {
          type: String,
          required: true,
        },
        notes: {
          type: String,
          required: true,
        },
        description: {
          type: String,
          required: true,
        },
        features: {
          type: [String],
          required: true,
        },
        media: [
          {
            type: {
              type: String,
              enum: ["image", "video"],
              required: true,
            },
            url: {
              type: String,
              required: true,
            },
            caption: {
              type: String,
              required: true,
            },
          },
        ],
        changes: {
          type: [String],
          default: [],
        },
      },
    ],
    features: {
      type: [String],
      required: [true, "Please provide at least one feature"],
    },
    challenges: {
      type: [String],
      required: [true, "Please provide at least one challenge"],
    },
    screenshots: {
      type: [String],
      required: [true, "Please provide at least one screenshot"],
    },
    published: {
      type: Boolean,
      default: false,
    },
    publishedAt: {
      type: Date,
    },
  },
  { timestamps: true },
)

// Create slug from title before saving
ProjectSchema.pre("save", function (next) {
  if (this.isModified("title")) {
    this.slug = slugify(this.title, { lower: true, strict: true })
  }

  if (this.isModified("published") && this.published && !this.publishedAt) {
    this.publishedAt = new Date()
  }

  next()
})

export default mongoose.model<Project>("Project", ProjectSchema)
