import express from "express";
import { auth as authMiddleware } from "../../middlewares/auth.js";
import { requireAdmin } from "../../middlewares/admin.js";
import {
  getAllUsers,
  deleteUser,
  toggleUserApproval,
  toggleTheaterApproval,
  getAllTheaters,
} from "../../controllers/adminUserController.js";

const router = express.Router();

// Protect admin routes
router.use(authMiddleware);
router.use(requireAdmin);

router.get("/", getAllUsers);
router.get("/theaters", getAllTheaters);
router.patch("/:id/approve", toggleUserApproval);
router.patch("/theaters/:id/approve", toggleTheaterApproval);
router.delete("/:id", deleteUser);

export default router;
