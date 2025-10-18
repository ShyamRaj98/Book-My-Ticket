import express from "express";
import User from "../../models/User.js";
import { requireAdmin } from "../../middlewares/admin.js";

const router = express.Router();

router.use(requireAdmin);

// GET all users
router.get("/", async (req, res) => {
  try {
    const users = await User.find().select("-password"); // exclude password
    res.json({ users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// PATCH update roles in bulk
router.patch("/roles", async (req, res) => {
  try {
    const updates = req.body; // [{ userId, role }]
    for (let u of updates) {
      await User.findByIdAndUpdate(u.userId, { role: u.role });
    }
    res.json({ message: "Roles updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE user
router.delete("/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
