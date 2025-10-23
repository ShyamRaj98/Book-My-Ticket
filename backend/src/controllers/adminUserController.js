import User from "../models/User.js";

/**
 * @desc Get all users (admin only)
 * @route GET /api/admin/users
 */
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password"); // exclude password
    res.json({ users });
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

/**
 * @desc Update roles in bulk (admin only)
 * @route PATCH /api/admin/users/roles
 */
export const updateUserRolesBulk = async (req, res) => {
  try {
    const updates = req.body; // Expecting [{ userId, role }]
    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ message: "No updates provided" });
    }

    const bulkOps = updates.map((u) => ({
      updateOne: {
        filter: { _id: u.userId },
        update: { $set: { role: u.role } },
      },
    }));

    await User.bulkWrite(bulkOps);
    res.json({ message: "Roles updated successfully" });
  } catch (err) {
    console.error("Error updating roles:", err);
    res.status(500).json({ message: "Failed to update roles" });
  }
};

/**
 * @desc Delete a user (admin only)
 * @route DELETE /api/admin/users/:id
 */
export const deleteUser = async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({ message: "User not found" });

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ message: "Failed to delete user" });
  }
};
