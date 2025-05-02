import express from "express"
import { getSubscribers, subscribe, unsubscribe, deleteSubscriber } from "../controllers/subscriber"
import { protect, authorize } from "../middleware/auth"

const router = express.Router()

router.route("/").get(protect, authorize("admin"), getSubscribers).post(subscribe)

router.route("/:email").delete(unsubscribe)

router.route("/id/:id").delete(protect, authorize("admin"), deleteSubscriber)

export default router
