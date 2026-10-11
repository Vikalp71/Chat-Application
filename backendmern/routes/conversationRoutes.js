import express from "express";

import {
  createOrGetConversation,
  getConversations,
} from "../controllers/conversationController.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.get(
  "/",
  protect,
  getConversations
);

router.post(
  "/",
  protect,
  createOrGetConversation
);

export default router;