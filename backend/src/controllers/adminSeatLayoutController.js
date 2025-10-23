import SeatLayout from "../models/SeatLayout.js";

/**
 * ===============================
 * 🎟️ CREATE LAYOUT
 * POST /api/admin/seat-layouts
 * ===============================
 */
export const createLayout = async (req, res) => {
  try {
    const { name, seats } = req.body;
    if (!name) return res.status(400).json({ error: "name required" });

    const layout = await SeatLayout.create({ name, seats: seats || [] });
    res.json({ layout });
  } catch (err) {
    console.error("❌ createLayout error:", err);
    res.status(500).json({ error: err.message || "failed to create layout" });
  }
};

/**
 * ===============================
 * 🎟️ LIST LAYOUTS
 * GET /api/admin/seat-layouts
 * ===============================
 */
export const getLayouts = async (req, res) => {
  try {
    const layouts = await SeatLayout.find().sort({ createdAt: -1 });
    res.json(layouts);
  } catch (err) {
    console.error("❌ getLayouts error:", err);
    res.status(500).json({ error: "failed to fetch layouts" });
  }
};

/**
 * ===============================
 * 🎟️ GET SINGLE LAYOUT
 * GET /api/admin/seat-layouts/:id
 * ===============================
 */
export const getLayoutById = async (req, res) => {
  try {
    const layout = await SeatLayout.findById(req.params.id);
    if (!layout) return res.status(404).json({ error: "layout not found" });
    res.json(layout);
  } catch (err) {
    console.error("❌ getLayoutById error:", err);
    res.status(500).json({ error: "failed to fetch layout" });
  }
};

/**
 * ===============================
 * 🎟️ UPDATE LAYOUT
 * PUT /api/admin/seat-layouts/:id
 * ===============================
 */
export const updateLayout = async (req, res) => {
  try {
    const { name, seats } = req.body;
    const updated = await SeatLayout.findByIdAndUpdate(
      req.params.id,
      { name, seats },
      { new: true, runValidators: true }
    );

    if (!updated) return res.status(404).json({ error: "layout not found" });
    res.json({ layout: updated });
  } catch (err) {
    console.error("❌ updateLayout error:", err);
    res.status(500).json({ error: "failed to update layout" });
  }
};

/**
 * ===============================
 * 🎟️ DELETE LAYOUT
 * DELETE /api/admin/seat-layouts/:id
 * ===============================
 */
export const deleteLayout = async (req, res) => {
  try {
    await SeatLayout.findByIdAndDelete(req.params.id);
    res.json({ message: "layout deleted" });
  } catch (err) {
    console.error("❌ deleteLayout error:", err);
    res.status(500).json({ error: "failed to delete layout" });
  }
};
