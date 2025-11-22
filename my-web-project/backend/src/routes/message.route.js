import express from "express"
import { protectRoute } from "../middleware/auth.middleware.js"
import { getFriendList, getMessages, sendMessage } from "../controllers/message.controller.js";
const router = express.Router()

router.get("/users", protectRoute, getFriendList);
router.get("/:id", protectRoute, getMessages);
router.post("/send/:id",protectRoute, sendMessage);

export default router;

