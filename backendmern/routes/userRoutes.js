import express from "express";

import {
  getUsers,
  getUserById,
} from "../controllers/userController.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/users
router.get("/", protect, getUsers);

// GET /api/users/:id
router.get("/:id", protect, getUserById);

export default router;