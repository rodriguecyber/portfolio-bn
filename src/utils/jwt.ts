import jwt from "jsonwebtoken"
import type { User } from "../types"

export const generateToken = (user: User): string => {
  return jwt.sign({ id: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET as string, {
    expiresIn:  "30d",
  })
}

export const verifyToken = (token: string): any => {
  return jwt.verify(token, process.env.JWT_SECRET as string)
}
