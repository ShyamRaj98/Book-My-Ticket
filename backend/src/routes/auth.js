// server/routes/auth.js
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/User.js";
import Booking from "../models/Booking.js"; // used for protected booking history
import { auth } from "../middlewares/auth.js";

dotenv.config();
const router = express.Router();

/**
 * POST /api/auth/register
 * body: { name, email, password, phone }
 */
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "email and password required" });

    // check exists
    const exists = await User.findOne({ email });
    if (exists)
      return res.status(409).json({ error: "email already registered" });

    const salt = await bcrypt.genSalt(Number(process.env.JWT_SALT_ROUNDS));
    const hashed = await bcrypt.hash(password, salt);
    const user = await User.create({ name, email, password: hashed, phone });
    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (err) {
    console.error("register error", err);
    res.status(500).json({ error: "failed to register" });
  }
});

/**
 * POST /api/auth/login
 * body: { email, password }
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "email and password required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "invalid credentials" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: "invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (err) {
    console.error("login error", err);
    res.status(500).json({ error: "failed to login" });
  }
});

/**
 * GET /api/auth/profile
 * protected -> returns user info
 */

router.get("/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ error: "user not found" });
    res.json({ user });
  } catch (err) {
    console.error("profile error", err);
    res.status(500).json({ error: "failed to get profile" });
  }
});

/**
 * GET /api/auth/bookings
 * protected -> returns booking history for the logged-in user
 */
router.get("/bookings", auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate("showtime")
      .sort({ createdAt: -1 });
    res.json({ bookings });
  } catch (err) {
    console.error("bookings error", err);
    res.status(500).json({ error: "failed to fetch bookings" });
  }
});

export default router;
