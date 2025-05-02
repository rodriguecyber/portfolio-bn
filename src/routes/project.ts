import express from "express"
import {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  uploadProjectImage,
  uploadProjectScreenshot,
  removeProjectScreenshot,
  addVersionMedia,
  removeVersionMedia,
} from "../controllers/project"
import { protect, authorize } from "../middleware/auth"


const router = express.Router()

router.route("/").get(getProjects).post(protect, authorize("admin"), createProject)

router
  .route("/:id")
  .get(getProject)
  .put(protect, authorize("admin"), updateProject)
  .delete(protect, authorize("admin"), deleteProject)

router.route("/:id/image").post(protect, authorize("admin"),  uploadProjectImage)

router.route("/:id/screenshot").post(protect, authorize("admin"),  uploadProjectScreenshot)

router.route("/:id/screenshot/:index").delete(protect, authorize("admin"), removeProjectScreenshot)

router
  .route("/:id/versions/:versionIndex/media")
  .post(protect, authorize("admin"),  addVersionMedia)

router.route("/:id/versions/:versionIndex/media/:mediaIndex").delete(protect, authorize("admin"), removeVersionMedia)

export default router
