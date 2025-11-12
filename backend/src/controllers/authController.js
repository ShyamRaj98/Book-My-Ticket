import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/User.js";
import Booking from "../models/Booking.js";

dotenv.config();
// Generate JWT
const createToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

// 📌 Register Normal User
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password || !phone)
      return res.status(400).json({ success: false, error: "All fields required" });

    if (!/^\S+@\S+\.\S+$/.test(email))
      return res.status(400).json({ success: false, error: "Invalid email format" });

    if (password.length < 6)
      return res.status(400).json({ success: false, error: "Password must be at least 6 characters" });

    if (!/^[0-9]{10}$/.test(phone))
      return res.status(400).json({ success: false, error: "Invalid phone number" });

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(409).json({ success: false, error: "Email already registered" });

    const salt = await bcrypt.genSalt(Number(process.env.JWT_SALT_ROUNDS));
    const hashed = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashed,
      phone,
      role: "user",
      isApproved: true,
    });

    const token = createToken(user);
    res.json({
      success: true,
      message: "User registered successfully",
      user: { id: user._id, name: user.name, email: user.email, role: user.role, isApproved: user.isApproved },
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Server error during registration" });
  }
};

// 📌 Login User
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, error: "Email and password required" });

    const user = await User.findOne({ email, role: "user" });
    if (!user) return res.status(401).json({ success: false, error: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ success: false, error: "Invalid credentials" });

    const token = createToken(user);
    res.json({
      success: true,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, message: "Server error during login" });
  }
};

// 📌 Get Profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ success: false, error: "User not found" });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 📌 Update Profile
export const updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const updated = await User.findByIdAndUpdate(
      req.user.id,
      { name, phone },
      { new: true }
    ).select("-password");
    res.json({ success: true, user: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: "Update failed" });
  }
};

// 📌 Booking History
export const getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate("showtime")
      .sort({ createdAt: -1 });
    res.json({ success: true, bookings });
  } catch (err) {
    res.status(500).json({ success: false, error: "Error fetching bookings" });
  }
};
