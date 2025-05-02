import express from "express"
import { register, login, logout, getMe } from "../controllers/auth"
import { protect } from "../middleware/auth"

const router = express.Router()

router.post("/register", register)
router.post("/login", login)
router.get("/logout", logout)
router.get("/me", protect, getMe)

export default router
