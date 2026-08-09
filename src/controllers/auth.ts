import type { Request, Response } from "express"
import User from "../models/User"
import { asyncHandler } from "../utils/errorHandler"
import { generateToken } from "../utils/jwt"

// @desc    Register a user
// @route   POST /api/auth/register
// @access  Public
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body

  // Check if user already exists
  const userExists = await User.findOne({ email })

  if (userExists) {
    return res.status(400).json({
      success: false,
      error: "User already exists",
    })
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    role: "admin",
  })

  // Generate token
  const token = generateToken(user)

  res.status(201).json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    token,
  })
})

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body

  // Check for user
  const user = await User.findOne({ email }).select("+password")

  if (!user) {
    return res.status(401).json({
      success: false,
      error: "Invalid credentials", 
    })
  }

  // Check if password matches
  const isMatch = await user.comparePassword(password)

  if (!isMatch) {
    return res.status(401).json({
      success: false,
      error: "Invalid credentials",
    })
  }

  // Generate token
  const token = generateToken(user)

  // Set cookie
  const cookieOptions = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: true,
  }

  res.cookie("token", token, cookieOptions)

  res.status(200).json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    token,
  })
})

// @desc    Logout user / clear cookie
// @route   GET /api/auth/logout
// @access  Private
export const logout = asyncHandler(async (req: Request, res: Response) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  })

  res.status(200).json({
    success: true,
    data: {},
  })
})

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user.id)

  res.status(200).json({
    success: true,
    data: user,
  })
})
