import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

// Generate JWT
const createToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

// 📌 Register Admin
export const registerAdmin = async (req, res) => {
  try {
    const { name, email, password, phone, secretKey } = req.body;
    if (!name || !email || !password || !phone || !secretKey)
      return res
        .status(400)
        .json({ success: false, error: "All fields required" });

    if (secretKey !== process.env.ADMIN_SECRET_KEY)
      return res
        .status(403)
        .json({ success: false, error: "Invalid secret key" });

    const exists = await User.findOne({ email });
    if (exists)
      return res
        .status(409)
        .json({ success: false, error: "Email already registered" });

    const salt = await bcrypt.genSalt(Number(process.env.JWT_SALT_ROUNDS));
    const hashed = await bcrypt.hash(password, salt);

    const admin = await User.create({
      name,
      email,
      password: hashed,
      phone,
      role: "admin",
      isApproved: true,
    });

    const token = createToken(admin);
    res.json({
      success: true,
      message: "Admin registered successfully",
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        isApproved: admin.isApproved,
      },
      token,
    });
  } catch (err) {
    console.error("🔥 Admin register error:", err.message);
    res
      .status(500)
      .json({ success: false, message: "Failed to register admin" });
  }
};

// 📌 Login Admin
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await User.findOne({ email, role: "admin" });
    if (!admin)
      return res
        .status(401)
        .json({ success: false, error: "Invalid admin credentials" });

    const match = await bcrypt.compare(password, admin.password);
    if (!match)
      return res
        .status(401)
        .json({ success: false, error: "Invalid credentials" });

    const token = createToken(admin);
    res.json({
      success: true,
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        isApproved: admin.isApproved,
      },
      token,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to login admin" });
  }
};
