import type { Request, Response } from "express"
import mongoose from "mongoose"
import Blog from "../models/Blog"
import { asyncHandler } from "../utils/errorHandler"
// import { deleteFile } from "../utils/cloudinary"

// @desc    Get all blogs
// @route   GET /api/blogs
// @access  Public
export const getBlogs = asyncHandler(async (req: Request, res: Response) => {
  const page = Number.parseInt(req.query.page as string) || 1
  const limit = Number.parseInt(req.query.limit as string) || 10
  const startIndex = (page - 1) * limit
  const endIndex = page * limit
  const total = await Blog.countDocuments({ published: true })

  // Only show published blogs for public access
  const query = { published: true }

  // If admin is requesting, show all blogs
  if (req.user && req.user.role === "admin") {
    //@ts-expect-error error
    delete query.published
  }

  const blogs = await Blog.find(query).populate("author", "name").sort({ createdAt: -1 }).skip(startIndex).limit(limit)

  const pagination: any = {}

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit,
    }
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit,
    }
  }

  res.status(200).json({
    success: true,
    count: blogs.length,
    pagination,
    data: blogs,
  })
})

// @desc    Get single blog
// @route   GET /api/blogs/:id
// @access  Public
export const getBlog = asyncHandler(async (req: Request, res: Response) => {
  const blog = await Blog.findOne({
    $or: [{ _id: req.params.id }, { slug: req.params.id }],
  }).populate("author", "name")

  if (!blog) {
    return res.status(404).json({
      success: false,
      error: "Blog not found",
    })
  }

  // Check if blog is published or user is admin
  if (!blog.published && (!req.user || req.user.role !== "admin")) {
    return res.status(404).json({
      success: false,
      error: "Blog not found",
    })
  }

  res.status(200).json({
    success: true,
    data: blog,
  })
})

// @desc    Create new blog
// @route   POST /api/blogs
// @access  Private (Admin)
export const createBlog = asyncHandler(async (req: Request, res: Response) => {
  // Add author to req.body
  req.body.author = req.user.id 

  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    const blog = await Blog.create([req.body], { session })

    await session.commitTransaction()
    session.endSession()

    res.status(201).json({
      success: true,
      data: blog[0],
    })
  } catch (error) {
    await session.abortTransaction()
    session.endSession()
    throw error
  }
})

// @desc    Update blog
// @route   PUT /api/blogs/:id
// @access  Private (Admin)
export const updateBlog = asyncHandler(async (req: Request, res: Response) => {
  let blog = await Blog.findById(req.params.id)

  if (!blog) {
    return res.status(404).json({
      success: false,
      error: "Blog not found",
    })
  }

  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    blog = await Blog.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
      session,
    })

    await session.commitTransaction()
    session.endSession()

    res.status(200).json({
      success: true,
      data: blog,
    })
  } catch (error) {
    await session.abortTransaction()
    session.endSession()
    throw error
  }
})

// @desc    Delete blog
// @route   DELETE /api/blogs/:id
// @access  Private (Admin)
export const deleteBlog = asyncHandler(async (req: Request, res: Response) => {
  const blog = await Blog.findById(req.params.id)

  if (!blog) {
    return res.status(404).json({
      success: false,
      error: "Blog not found",
    })
  }

  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    // Delete image from cloudinary if it exists
    if (blog.image && blog.image.includes("cloudinary")) {
      const publicId = blog.image.split("/").pop()?.split(".")[0]
      if (publicId) {
        // await deleteFile(`portfolio/${publicId}`)
      }
    }

    // Delete gallery images if they exist
    if (blog.gallery && blog.gallery.length > 0) {
      for (const item of blog.gallery) {
        if (item.url && item.url.includes("cloudinary")) {
          const publicId = item.url.split("/").pop()?.split(".")[0]
          if (publicId) {
            // await deleteFile(`portfolio/${publicId}`)
          }
        }
      }
    }

    await blog.deleteOne({ session })

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

// @desc    Upload blog image
// @route   POST /api/blogs/:id/image
// @access  Private (Admin)
export const uploadBlogImage = asyncHandler(async (req: any, res: Response) => {
  const blog = await Blog.findById(req.params.id)

  if (!blog) {
    return res.status(404).json({
      success: false,
      error: "Blog not found",
    })
  }

  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: "Please upload a file",
    })
  }

  // Update blog with new image
  blog.image = req.file.path
  await blog.save()

  res.status(200).json({
    success: true,
    data: blog,
  })
})

// @desc    Add gallery item
// @route   POST /api/blogs/:id/gallery
// @access  Private (Admin)
export const addGalleryItem = asyncHandler(async (req: any, res: Response) => {
  const { type, caption } = req.body
  const blog = await Blog.findById(req.params.id)

  if (!blog) {
    return res.status(404).json({
      success: false,
      error: "Blog not found",
    })
  }

  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: "Please upload a file",
    })
  }

  if (!type || !caption) {
    return res.status(400).json({
      success: false,
      error: "Please provide type and caption",
    })
  }

  // Add gallery item
  blog.gallery = blog.gallery || []
  blog.gallery.push({
    type,
    url: req.file.path,
    caption,
  })

  await blog.save()

  res.status(200).json({
    success: true,
    data: blog,
  })
})

// @desc    Remove gallery item
// @route   DELETE /api/blogs/:id/gallery/:itemId
// @access  Private (Admin)
export const removeGalleryItem = asyncHandler(async (req: Request, res: Response) => {
  const blog = await Blog.findById(req.params.id)

  if (!blog) {
    return res.status(404).json({
      success: false,
      error: "Blog not found",
    })
  }

  // Find gallery item
    //@ts-expect-error error
  const galleryItem = blog.gallery?.find((item) => item._id?.toString() === req.params.itemId)

  if (!galleryItem) {
    return res.status(404).json({
      success: false,
      error: "Gallery item not found",
    })
  }

  // Delete from cloudinary if it exists
  if (galleryItem.url && galleryItem.url.includes("cloudinary")) {
    const publicId = galleryItem.url.split("/").pop()?.split(".")[0]
    if (publicId) {
      // await deleteFile(`portfolio/${publicId}`)
    }
  }

  // Remove gallery item
    //@ts-expect-error error
  blog.gallery = blog.gallery?.filter((item) => item._id?.toString() !== req.params.itemId)

  await blog.save()

  res.status(200).json({
    success: true,
    data: blog,
  })
})
