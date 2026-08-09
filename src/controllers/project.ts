import type { Request, Response } from "express"
import mongoose from "mongoose"
import Project from "../models/Project"
import { asyncHandler } from "../utils/errorHandler"
// import { deleteFile } from "../utils/cloudinary"

// @desc    Get all projects
// @route   GET /api/projects
// @access  Public
export const getProjects = asyncHandler(async (req: Request, res: Response) => {
  const page = Number.parseInt(req.query.page as string) || 1
  const limit = Number.parseInt(req.query.limit as string) || 10
  const startIndex = (page - 1) * limit
  const endIndex = page * limit
  const total = await Project.countDocuments({ published: true })

  // Only show published projects for public access
  const query = { published: true }

  // If admin is requesting, show all projects
  if (req.user && req.user.role === "admin") {
    //@ts-expect-error error
    delete query.published
  }

  const projects = await Project.find(query).sort({ createdAt: -1 }).skip(startIndex).limit(limit)

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
    count: projects.length,
    pagination,
    data: projects,
  })
})

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Public
export const getProject = asyncHandler(async (req: Request, res: Response) => {
  const project = await Project.findOne({
    $or: [{ _id: req.params.id }, { slug: req.params.id }],
  })

  if (!project) {
    return res.status(404).json({
      success: false,
      error: "Project not found",
    })
  }

  // Check if project is published or user is admin
  if (!project.published && (!req.user || req.user.role !== "admin")) {
    return res.status(404).json({
      success: false,
      error: "Project not found",
    })
  }

  res.status(200).json({
    success: true,
    data: project,
  })
})

// @desc    Create new project
// @route   POST /api/projects
// @access  Private (Admin)
export const createProject = asyncHandler(async (req: Request, res: Response) => {
  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    const project = await Project.create([req.body], { session })

    await session.commitTransaction()
    session.endSession()

    res.status(201).json({
      success: true,
      data: project[0],
    })
  } catch (error) {
    await session.abortTransaction()
    session.endSession()
    throw error
  }
})

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private (Admin)
export const updateProject = asyncHandler(async (req: Request, res: Response) => {
  let project = await Project.findById(req.params.id)

  if (!project) {
    return res.status(404).json({
      success: false,
      error: "Project not found",
    })
  }

  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
      session,
    })

    await session.commitTransaction()
    session.endSession()

    res.status(200).json({
      success: true,
      data: project,
    })
  } catch (error) {
    await session.abortTransaction()
    session.endSession()
    throw error
  }
})

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private (Admin)
export const deleteProject = asyncHandler(async (req: Request, res: Response) => {
  const project = await Project.findById(req.params.id)

  if (!project) {
    return res.status(404).json({
      success: false,
      error: "Project not found",
    })
  }

  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    // Delete image from cloudinary if it exists
    if (project.image && project.image.includes("cloudinary")) {
      const publicId = project.image.split("/").pop()?.split(".")[0]
      if (publicId) {
        // await deleteFile(`portfolio/${publicId}`)
      }
    }

    // Delete screenshots if they exist
    if (project.screenshots && project.screenshots.length > 0) {
      for (const screenshot of project.screenshots) {
        if (screenshot && screenshot.includes("cloudinary")) {
          const publicId = screenshot.split("/").pop()?.split(".")[0]
          if (publicId) {
            // await deleteFile(`portfolio/${publicId}`)
          }
        }
      }
    }

    // Delete version media if they exist
    if (project.versions && project.versions.length > 0) {
      for (const version of project.versions) {
        if (version.media && version.media.length > 0) {
          for (const media of version.media) {
            if (media.url && media.url.includes("cloudinary")) {
              const publicId = media.url.split("/").pop()?.split(".")[0]
              if (publicId) {
                // await deleteFile(`portfolio/${publicId}`)
              }
            }
          }
        }
      }
    }

    await project.deleteOne({ session })

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

// @desc    Upload project image
// @route   POST /api/projects/:id/image
// @access  Private (Admin)
export const uploadProjectImage = asyncHandler(async (req: any, res: Response) => {
  const project = await Project.findById(req.params.id)

  if (!project) {
    return res.status(404).json({
      success: false,
      error: "Project not found",
    })
  }

  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: "Please upload a file",
    })
  }

  // Update project with new image
  project.image = req.file.path
  await project.save()

  res.status(200).json({
    success: true,
    data: project,
  })
})

// @desc    Upload project screenshot
// @route   POST /api/projects/:id/screenshot
// @access  Private (Admin)
export const uploadProjectScreenshot = asyncHandler(async (req: any, res: Response) => {
  const project = await Project.findById(req.params.id)

  if (!project) {
    return res.status(404).json({
      success: false,
      error: "Project not found",
    })
  }

  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: "Please upload a file",
    })
  }

  // Add screenshot
  project.screenshots = project.screenshots || []
  project.screenshots.push(req.file.path)

  await project.save()

  res.status(200).json({
    success: true,
    data: project,
  })
})

// @desc    Remove project screenshot
// @route   DELETE /api/projects/:id/screenshot/:index
// @access  Private (Admin)
export const removeProjectScreenshot = asyncHandler(async (req: Request, res: Response) => {
  const project = await Project.findById(req.params.id)
  const index = Number.parseInt(String(req.params.index))

  if (!project) {
    return res.status(404).json({
      success: false,
      error: "Project not found",
    })
  }

  if (!project.screenshots || index >= project.screenshots.length) {
    return res.status(404).json({
      success: false,
      error: "Screenshot not found",
    })
  }

  // Delete from cloudinary if it exists
  const screenshot = project.screenshots[index]
  if (screenshot && screenshot.includes("cloudinary")) {
    const publicId = screenshot.split("/").pop()?.split(".")[0]
    if (publicId) {
      // await deleteFile(`portfolio/${publicId}`)
    }
  }

  // Remove screenshot
  project.screenshots.splice(index, 1)
  await project.save()

  res.status(200).json({
    success: true,
    data: project,
  })
})

// @desc    Add version media
// @route   POST /api/projects/:id/versions/:versionIndex/media
// @access  Private (Admin)
export const addVersionMedia = asyncHandler(async (req: any, res: Response) => {
  const { type, caption } = req.body
  const project = await Project.findById(req.params.id)
  const versionIndex = Number.parseInt(req.params.versionIndex)

  if (!project) {
    return res.status(404).json({
      success: false,
      error: "Project not found",
    })
  }

  if (!project.versions || versionIndex >= project.versions.length) {
    return res.status(404).json({
      success: false,
      error: "Version not found",
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

  // Add media to version
  project.versions[versionIndex].media = project.versions[versionIndex].media || []
  project.versions[versionIndex].media.push({
    type,
    url: req.file.path,
    caption,
  })

  await project.save()

  res.status(200).json({
    success: true,
    data: project,
  })
})

// @desc    Remove version media
// @route   DELETE /api/projects/:id/versions/:versionIndex/media/:mediaIndex
// @access  Private (Admin)
export const removeVersionMedia = asyncHandler(async (req: Request, res: Response) => {
  const project = await Project.findById(req.params.id)
  const versionIndex = Number.parseInt(String(req.params.versionIndex))
  const mediaIndex = Number.parseInt(String(req.params.mediaIndex))

  if (!project) {
    return res.status(404).json({
      success: false,
      error: "Project not found",
    })
  }

  if (!project.versions || versionIndex >= project.versions.length) {
    return res.status(404).json({
      success: false,
      error: "Version not found",
    })
  }

  if (!project.versions[versionIndex].media || mediaIndex >= project.versions[versionIndex].media.length) {
    return res.status(404).json({
      success: false,
      error: "Media not found",
    })
  }

  // Delete from cloudinary if it exists
  const media = project.versions[versionIndex].media[mediaIndex]
  if (media.url && media.url.includes("cloudinary")) {
    const publicId = media.url.split("/").pop()?.split(".")[0]
    if (publicId) {
      // await deleteFile(`portfolio/${publicId}`)
    }
  }

  // Remove media
  project.versions[versionIndex].media.splice(mediaIndex, 1)
  await project.save()

  res.status(200).json({
    success: true,
    data: project,
  })
})
