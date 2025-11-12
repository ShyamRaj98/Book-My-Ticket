import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/User.js";
import Theater from "../models/Theater.js";

dotenv.config();

// JWT generator
const createToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

// 🎭 Register Theater Owner
export const registerTheater = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password)
      return res.status(400).json({ success: false, error: "All fields required" });

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(409).json({ success: false, error: "Email already registered" });

    const salt = await bcrypt.genSalt(Number(process.env.JWT_SALT_ROUNDS));
    const hashed = await bcrypt.hash(password, salt);

    // Step 1: Create Theater User
    const theaterUser = await User.create({
      name,
      email,
      password: hashed,
      phone,
      role: "theater",
    });

    // Step 2: Create linked Theater document
    const theater = await Theater.create({
      name: `${name}'s Theater`,
      location: "Not set yet",
      owner: theaterUser._id,
      isApproved: true,
    });

    // Step 3: Create token
    const token = createToken(theaterUser);

    res.json({
      success: true,
      message: "Theater registered successfully. Waiting for admin approval.",
      user: {
        id: theaterUser._id,
        name: theaterUser.name,
        email: theaterUser.email,
        role: theaterUser.role,
        isApproved: theaterUser.isApproved,
      },
      theater,
      token,
    });
  } catch (err) {
    console.error("🔥 Theater register error:", err.message);
    res.status(500).json({ success: false, error: "Failed to register theater" });
  }
};

// 🎭 Login Theater Owner
export const loginTheater = async (req, res) => {
  try {
    const { email, password } = req.body;

    const theaterUser = await User.findOne({ email, role: "theater" });
    if (!theaterUser)
      return res.status(401).json({ success: false, error: "Invalid theater credentials" });

    const match = await bcrypt.compare(password, theaterUser.password);
    if (!match)
      return res.status(401).json({ success: false, error: "Invalid credentials" });

    const token = createToken(theaterUser);
    res.json({
      success: true,
      user: {
        id: theaterUser._id,
        name: theaterUser.name,
        email: theaterUser.email,
        role: theaterUser.role,
        isApproved: theaterUser.isApproved,
      },
      token,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to login theater" });
  }
};
