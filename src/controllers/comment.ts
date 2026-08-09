import type { Request, Response } from "express"
import mongoose from "mongoose"
import Comment from "../models/Comment"
import { asyncHandler } from "../utils/errorHandler"
import { isContentType, type ContentType } from "../utils/contentType"

// @desc    Get comments for a content
// @route   GET /api/comments/:contentType/:contentId
// @access  Public
export const getComments = asyncHandler(async (req: Request, res: Response) => {
  const { contentType, contentId } = req.params

  // Validate content type
  if (!isContentType(contentType) || typeof contentId !== "string") {
    return res.status(400).json({
      success: false,
      error: "Invalid content type",
    })
  }

  const query: { contentType: ContentType; contentId: string; approved?: boolean } = { contentType, contentId }

  // For public access, only show approved comments. Admins see all of them.
  if (!(req.user && req.user.role === "admin")) {
    query.approved = true
  }

  // Get top-level comments (no parentId)
  const comments = await Comment.find({ ...query, parentId: { $exists: false } }).sort({ createdAt: -1 })

  // Get replies for each comment
  const commentsWithReplies = await Promise.all(
    comments.map(async (comment) => {
      const replies = await Comment.find({
        ...query,
        parentId: comment._id,
      }).sort({ createdAt: 1 })

      return {
        ...comment.toObject(),
        replies,
      }
    }),
  )

  res.status(200).json({
    success: true,
    count: commentsWithReplies.length,
    data: commentsWithReplies,
  })
})

// @desc    Add comment
// @route   POST /api/comments/:contentType/:contentId
// @access  Public
export const addComment = asyncHandler(async (req: Request, res: Response) => {
  const { contentType, contentId } = req.params
  const { parentId, author, content } = req.body

  // Validate content type
  if (!isContentType(contentType) || typeof contentId !== "string") {
    return res.status(400).json({
      success: false,
      error: "Invalid content type",
    })
  }

  // Validate required fields
  if (!author || !author.name || !content) {
    return res.status(400).json({
      success: false,
      error: "Please provide author name and content",
    })
  }

  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    // Create comment
    const comment = await Comment.create(
      [
        {
          contentType,
          contentId,
          parentId,
          author,
          content,
          // Auto-approve if admin is adding comment
          approved: req.user && req.user.role === "admin",
        },
      ],
      { session },
    )

    await session.commitTransaction()
    session.endSession()

    res.status(201).json({
      success: true,
      data: comment[0],
    })
  } catch (error) {
    await session.abortTransaction()
    session.endSession()
    throw error
  }
})

// @desc    Approve comment
// @route   PUT /api/comments/:id/approve
// @access  Private (Admin)
export const approveComment = asyncHandler(async (req: Request, res: Response) => {
  const comment = await Comment.findById(req.params.id)

  if (!comment) {
    return res.status(404).json({
      success: false,
      error: "Comment not found",
    })
  }

  comment.approved = true
  await comment.save()

  res.status(200).json({
    success: true,
    data: comment,
  })
})

// @desc    Delete comment
// @route   DELETE /api/comments/:id
// @access  Private (Admin)
export const deleteComment = asyncHandler(async (req: Request, res: Response) => {
  const comment = await Comment.findById(req.params.id)

  if (!comment) {
    return res.status(404).json({
      success: false,
      error: "Comment not found",
    })
  }

  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    // Delete comment
    await comment.deleteOne({ session })

    // Delete all replies
    await Comment.deleteMany({ parentId: comment._id }, { session })

    await session.commitTransaction()
    session.endSession()

    res.status(200).json({
      success: true,
      data: {},
    })
  } catch (error) {
    await session.abortTransaction()
    session.endSession()
    throw error
  }
})
