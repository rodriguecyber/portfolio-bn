import type { Request, Response, NextFunction } from "express"
import { verifyToken } from "../utils/jwt"
import { AppError, asyncHandler } from "../utils/errorHandler"
import User from "../models/User"

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: any
    }
  }
}

export const protect = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  let token

  // Get token from header
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1]
  } else if (req.cookies?.token) {
    // Get token from cookie
    token = req.cookies.token
  }

  // Check if token exists
  if (!token) {
    return next(new AppError("Not authorized to access this route", 401))
  }

  try {
    // Verify token
    const decoded = verifyToken(token)

    // Get user from token
    const user = await User.findById(decoded.id)

    if (!user) {
      return next(new AppError("User not found", 404))
    }

    req.user = user
    next()
  } catch (error) {
    return next(new AppError("Not authorized to access this route", 401))
  }
})

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError("Not authorized to access this route", 401))
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError(`User role ${req.user.role} is not authorized to access this route`, 403))
    }
    next()
  }
}
