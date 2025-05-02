import express from "express"
import {
  getBlogs,
  getBlog,
  createBlog,
  updateBlog, 
  deleteBlog,
  uploadBlogImage,
  addGalleryItem,
  removeGalleryItem,
} from "../controllers/blog"
import { protect, authorize } from "../middleware/auth"
// import upload from "../utils/cloudinary"

const router = express.Router()

router.route("/").get(getBlogs).post(protect, authorize("admin"), createBlog)

router
  .route("/:id")
  .get(getBlog)
  .put(protect, authorize("admin"), updateBlog)
  .delete(protect, authorize("admin"), deleteBlog)

router.route("/:id/image").post(protect, authorize("admin"), uploadBlogImage)

router.route("/:id/gallery").post(protect, authorize("admin"),  addGalleryItem)

router.route("/:id/gallery/:itemId").delete(protect, authorize("admin"), removeGalleryItem)

export default router
