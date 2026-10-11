import express from "express";

import {
  getMessages,
  sendMessage,
  markMessagesAsRead,
} from "../controllers/messageController.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.get(
  "/:conversationId",
  protect,
  getMessages
);

router.post(
  "/",
  protect,
  sendMessage
);

router.patch(
  "/:conversationId/read",
  protect,
  markMessagesAsRead
);

export default router;