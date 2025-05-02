import express from "express"
import { getDashboardStats } from "../controllers/dashboard"
import { protect, authorize } from "../middleware/auth"

const router = express.Router()

router.route("/stats").get(protect, authorize("admin"), getDashboardStats)

export default router
