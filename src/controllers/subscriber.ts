import type { Request, Response } from "express"
import mongoose from "mongoose"
import Subscriber from "../models/Subscriber"
import { asyncHandler } from "../utils/errorHandler"

// @desc    Get all subscribers
// @route   GET /api/subscribers
// @access  Private (Admin)
export const getSubscribers = asyncHandler(async (req: Request, res: Response) => {
  const page = Number.parseInt(req.query.page as string) || 1
  const limit = Number.parseInt(req.query.limit as string) || 10
  const startIndex = (page - 1) * limit
  const endIndex = page * limit
  const total = await Subscriber.countDocuments()

  const subscribers = await Subscriber.find().sort({ createdAt: -1 }).skip(startIndex).limit(limit)

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
    count: subscribers.length,
    pagination,
    data: subscribers,
  })
})

// @desc    Subscribe to newsletter
// @route   POST /api/subscribers
// @access  Public
export const subscribe = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body

  if (!email) {
    return res.status(400).json({
      success: false,
      error: "Please provide an email",
    })
  }

  // Check if already subscribed
  const existingSubscriber = await Subscriber.findOne({ email })

  if (existingSubscriber) {
    // If inactive, reactivate
    if (!existingSubscriber.active) {
      existingSubscriber.active = true
      await existingSubscriber.save()

      return res.status(200).json({
        success: true,
        data: existingSubscriber,
        message: "Subscription reactivated",
      })
    }

    return res.status(400).json({
      success: false,
      error: "Email already subscribed",
    })
  }

  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    const subscriber = await Subscriber.create([{ email }], { session })

    await session.commitTransaction()
    session.endSession()

    res.status(201).json({
      success: true,
      data: subscriber[0],
    })
  } catch (error) {
    await session.abortTransaction()
    session.endSession()
    throw error
  }
})

// @desc    Unsubscribe from newsletter
// @route   DELETE /api/subscribers/:email
// @access  Public
export const unsubscribe = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.params

  const subscriber = await Subscriber.findOne({ email })

  if (!subscriber) {
    return res.status(404).json({
      success: false,
      error: "Subscriber not found",
    })
  }

  // Soft delete (mark as inactive)
  subscriber.active = false
  await subscriber.save()

  res.status(200).json({
    success: true,
    data: {},
    message: "Successfully unsubscribed",
  })
})

// @desc    Delete subscriber
// @route   DELETE /api/subscribers/:id
// @access  Private (Admin)
export const deleteSubscriber = asyncHandler(async (req: Request, res: Response) => {
  const subscriber = await Subscriber.findById(req.params.id)

  if (!subscriber) {
    return res.status(404).json({
      success: false,
      error: "Subscriber not found",
    })
  }

  await subscriber.deleteOne()

  res.status(200).json({
    success: true,
    data: {},
  })
})
