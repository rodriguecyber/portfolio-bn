import express from "express"
import { getContacts, getContact, createContact, toggleReadStatus, deleteContact } from "../controllers/contact"
import { protect, authorize } from "../middleware/auth"

const router = express.Router()

router.route("/").get(protect, authorize("admin"), getContacts).post(createContact)

router.route("/:id").get(protect, authorize("admin"), getContact).delete(protect, authorize("admin"), deleteContact)

router.route("/:id/read").put(protect, authorize("admin"), toggleReadStatus)

export default router
