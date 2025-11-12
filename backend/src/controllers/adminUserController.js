import User from "../models/User.js";
import Theater from "../models/Theater.js";

/**
 * Get all users
 * @route GET /api/admin/users
 */
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json({ users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

/**
 * Get all theaters
 * @route GET /api/admin/theaters
 */
export const getAllTheaters = async (req, res) => {
  try {
    const theaters = await Theater.find().populate("owner", "name email");
    res.json({ theaters });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch theaters" });
  }
};

/**
 * Approve/unapprove a user
 * @route PATCH /api/admin/users/:id/approve
 */
export const toggleUserApproval = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isApproved = !user.isApproved;
    await user.save();
    res.json({ message: `User ${user.isApproved ? "approved" : "unapproved"}`, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update user approval" });
  }
};

/**
 * Approve/unapprove a theater
 * @route PATCH /api/admin/theaters/:id/approve
 */
export const toggleTheaterApproval = async (req, res) => {
  try {
    const theater = await Theater.findById(req.params.id);
    if (!theater) return res.status(404).json({ message: "Theater not found" });

    theater.isApproved = !theater.isApproved;
    await theater.save();
    res.json({ message: `Theater ${theater.isApproved ? "approved" : "unapproved"}`, theater });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update theater approval" });
  }
};

/**
 * Delete a user
 * @route DELETE /api/admin/users/:id
 */
export const deleteUser = async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete user" });
  }
};
