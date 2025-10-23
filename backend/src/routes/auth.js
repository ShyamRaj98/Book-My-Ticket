import express from "express";
import { auth } from "../middlewares/auth.js";
import {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  getBookings,
} from "../controllers/authController.js";
import {
  requestPasswordReset,
  resetPassword,
} from "../controllers/passwordController.js";
import { registerAdmin, loginAdmin } from "../controllers/adminAuthController.js";

const router = express.Router();

// public routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/admin/register", registerAdmin);
router.post("/admin/login", loginAdmin);
router.post("/forgot-password", requestPasswordReset);
router.post("/reset-password/:token", resetPassword);

// protected routes
router.get("/profile", auth, getProfile);
router.put("/profile", auth, updateProfile);
router.get("/bookings", auth, getBookings);

export default router;
