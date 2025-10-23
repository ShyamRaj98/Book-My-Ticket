import express from "express";
import { auth as authMiddleware } from "../../middlewares/auth.js";
import { requireAdmin } from "../../middlewares/admin.js";
import {
  getAllUsers,
  updateUserRolesBulk,
  deleteUser,
} from "../../controllers/adminUserController.js";

const router = express.Router();

// Protect admin routes
router.use(authMiddleware);
router.use(requireAdmin);

// GET all users
router.get("/", getAllUsers);

// PATCH update user roles in bulk
router.patch("/roles", updateUserRolesBulk);

// DELETE a specific user
router.delete("/:id", deleteUser);

export default router;
