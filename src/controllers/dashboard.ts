import type { Request, Response } from "express"
import { asyncHandler } from "../utils/errorHandler"
import Blog from "../models/Blog"
import Project from "../models/Project"
import Comment from "../models/Comment"
import Contact from "../models/Contact"
import Subscriber from "../models/Subscriber"
import Like from "../models/Like"
import ServerHealth from "../models/ServerHealth"

// @desc    Get dashboard stats
// @route   GET /api/dashboard/stats
// @access  Private (Admin)
export const getDashboardStats = asyncHandler(async (req: Request, res: Response) => {
  // Get counts
  const blogCount = await Blog.countDocuments()
  const publishedBlogCount = await Blog.countDocuments({ published: true })
  const projectCount = await Project.countDocuments()
  const publishedProjectCount = await Project.countDocuments({ published: true })
  const commentCount = await Comment.countDocuments()
  const pendingCommentCount = await Comment.countDocuments({ approved: false })
  const contactCount = await Contact.countDocuments()
  const unreadContactCount = await Contact.countDocuments({ read: false })
  const subscriberCount = await Subscriber.countDocuments({ active: true })
  const likeCount = await Like.countDocuments()

  // Get recent items
  const recentBlogs = await Blog.find().sort({ createdAt: -1 }).limit(5).select("title slug published createdAt")

  const recentProjects = await Project.find().sort({ createdAt: -1 }).limit(5).select("title slug published createdAt")

  const recentComments = await Comment.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .select("author content approved createdAt")

  const recentContacts = await Contact.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .select("name email subject read createdAt")

  // Get server health data
  const serverHealth = await ServerHealth.find().sort({ timestamp: -1 }).limit(24) // Last 24 records (assuming 1 per hour)

  res.status(200).json({
    success: true,
    data: {
      counts: {
        blogs: {
          total: blogCount,
          published: publishedBlogCount,
          draft: blogCount - publishedBlogCount,
        },
        projects: {
          total: projectCount,
          published: publishedProjectCount,
          draft: projectCount - publishedProjectCount,
        },
        comments: {
          total: commentCount,
          pending: pendingCommentCount,
          approved: commentCount - pendingCommentCount,
        },
        contacts: {
          total: contactCount,
          unread: unreadContactCount,
          read: contactCount - unreadContactCount,
        },
        subscribers: subscriberCount,
        likes: likeCount,
      },
      recent: {
        blogs: recentBlogs,
        projects: recentProjects,
        comments: recentComments,
        contacts: recentContacts,
      },
      serverHealth,
    },
  })
})
