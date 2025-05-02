import type { Request, Response } from "express"
import Like from "../models/Like"
import { asyncHandler } from "../utils/errorHandler"

// @desc    Get likes count for a content
// @route   GET /api/likes/:contentType/:contentId
// @access  Public
export const getLikesCount = asyncHandler(async (req: Request, res: Response) => {
  const { contentType, contentId } = req.params

  // Validate content type
  if (!["blog", "project"].includes(contentType)) {
    return res.status(400).json({
      success: false,
      error: "Invalid content type",
    })
  }

  const count = await Like.countDocuments({ contentType, contentId })

  res.status(200).json({
    success: true,
    data: { count },
  })
})

// @desc    Check if IP has liked content
// @route   GET /api/likes/:contentType/:contentId/check
// @access  Public
export const checkLike = asyncHandler(async (req: Request, res: Response) => {
  const { contentType, contentId } = req.params
  const ipAddress = req.ip || req.headers["x-forwarded-for"] || "unknown"

  // Validate content type
  if (!["blog", "project"].includes(contentType)) {
    return res.status(400).json({
      success: false,
      error: "Invalid content type",
    })
  }

  const like = await Like.findOne({ contentType, contentId, ipAddress })

  res.status(200).json({
    success: true,
    data: { liked: !!like },
  })
})

// @desc    Toggle like for a content
// @route   POST /api/likes/:contentType/:contentId/toggle
// @access  Public
export const toggleLike = asyncHandler(async (req: Request, res: Response) => {
  const { contentType, contentId } = req.params
  const ipAddress = req.ip || req.headers["x-forwarded-for"] || "unknown"

  // Validate content type
  if (!["blog", "project"].includes(contentType)) {
    return res.status(400).json({
      success: false,
      error: "Invalid content type",
    })
  }

  // Check if already liked
  const existingLike = await Like.findOne({ contentType, contentId, ipAddress })

  if (existingLike) {
    // Unlike
    await existingLike.deleteOne()

    const count = await Like.countDocuments({ contentType, contentId })

    return res.status(200).json({
      success: true,
      data: { liked: false, count },
    })
  }

  // Like
  await Like.create({ contentType, contentId, ipAddress })

  const count = await Like.countDocuments({ contentType, contentId })

  res.status(200).json({
    success: true,
    data: { liked: true, count },
  })
})
