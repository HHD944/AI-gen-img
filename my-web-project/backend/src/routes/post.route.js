import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  getAllPosts,
  createPost,
  likeUnlikePost,
} from "../controllers/post.controllers.js";

const router = express.Router();

router.get("/all", protectRoute, getAllPosts);
router.post("/create", protectRoute, createPost);
router.post("/like/:id", protectRoute, likeUnlikePost);

export default router;
