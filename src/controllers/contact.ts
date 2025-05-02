import type { Request, Response } from "express"
import mongoose from "mongoose"
import Contact from "../models/Contact"
import { asyncHandler } from "../utils/errorHandler"

// @desc    Get all contacts
// @route   GET /api/contacts
// @access  Private (Admin)
export const getContacts = asyncHandler(async (req: Request, res: Response) => {
  const page = Number.parseInt(req.query.page as string) || 1
  const limit = Number.parseInt(req.query.limit as string) || 10
  const startIndex = (page - 1) * limit
  const endIndex = page * limit
  const total = await Contact.countDocuments()

  const contacts = await Contact.find().sort({ createdAt: -1 }).skip(startIndex).limit(limit)

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
    count: contacts.length,
    pagination,
    data: contacts,
  })
})

// @desc    Get single contact
// @route   GET /api/contacts/:id
// @access  Private (Admin)
export const getContact = asyncHandler(async (req: Request, res: Response) => {
  const contact = await Contact.findById(req.params.id)

  if (!contact) {
    return res.status(404).json({
      success: false,
      error: "Contact not found",
    })
  }

  // Mark as read if not already
  if (!contact.read) {
    contact.read = true
    await contact.save()
  }

  res.status(200).json({
    success: true,
    data: contact,
  })
})

// @desc    Create new contact
// @route   POST /api/contacts
// @access  Public
export const createContact = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, subject, message } = req.body

  // Validate required fields
  if (!name || !email || !subject || !message) {
    return res.status(400).json({
      success: false,
      error: "Please provide all required fields",
    })
  }

  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    const contact = await Contact.create([{ name, email, subject, message }], { session })

    await session.commitTransaction()
    session.endSession()

    res.status(201).json({
      success: true,
      data: contact[0],
    })
  } catch (error) {
    await session.abortTransaction()
    session.endSession()
    throw error
  }
})

// @desc    Mark contact as read/unread
// @route   PUT /api/contacts/:id/read
// @access  Private (Admin)
export const toggleReadStatus = asyncHandler(async (req: Request, res: Response) => {
  const contact = await Contact.findById(req.params.id)

  if (!contact) {
    return res.status(404).json({
      success: false,
      error: "Contact not found",
    })
  }

  contact.read = !contact.read
  await contact.save()

  res.status(200).json({
    success: true,
    data: contact,
  })
})

// @desc    Delete contact
// @route   DELETE /api/contacts/:id
// @access  Private (Admin)
export const deleteContact = asyncHandler(async (req: Request, res: Response) => {
  const contact = await Contact.findById(req.params.id)

  if (!contact) {
    return res.status(404).json({
      success: false,
      error: "Contact not found",
    })
  }

  await contact.deleteOne()

  res.status(200).json({
    success: true,
    data: {},
  })
})
