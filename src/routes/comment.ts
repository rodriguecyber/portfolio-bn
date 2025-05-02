import express from "express"
import { getComments, addComment, approveComment, deleteComment } from "../controllers/comment"
import { protect, authorize } from "../middleware/auth"

const router = express.Router()

router.route("/:contentType/:contentId").get(getComments).post(addComment)

router.route("/:id/approve").put(protect, authorize("admin"), approveComment)

router.route("/:id").delete(protect, authorize("admin"), deleteComment)

export default router
