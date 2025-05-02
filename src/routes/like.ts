import express from "express"
import { getLikesCount, checkLike, toggleLike } from "../controllers/like"

const router = express.Router()

router.route("/:contentType/:contentId").get(getLikesCount)

router.route("/:contentType/:contentId/check").get(checkLike)

router.route("/:contentType/:contentId/toggle").post(toggleLike)

export default router
