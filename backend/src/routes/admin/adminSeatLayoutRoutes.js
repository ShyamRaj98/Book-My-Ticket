// routes/admin/adminSeatLayouts.js
// server/routes/admin.js (partial — seat-layouts and screens endpoints)
import express from "express";
import SeatLayout from "../../models/SeatLayout.js";
import { auth as authMiddleware } from "../../middlewares/auth.js";
import { requireAdmin } from "../../middlewares/admin.js";

const router = express.Router();


// protect admin
router.use(authMiddleware);
router.use(requireAdmin);
// import {
//   getLayouts,
//   createLayout,
//   deleteLayout,
//   applyLayoutToScreen,
// } from "../../controllers/seatLayoutController.js";

// CRUD for seat layouts
// router.get("/seat-layouts", getLayouts);
// router.post("/seat-layouts", createLayout);
// router.delete("/seat-layouts/:id", deleteLayout);

// Apply layout to theater screen
// router.post("/screens/:theaterId", applyLayoutToScreen);

/**
 * Seat Layouts CRUD
 */

// Create a layout
router.post("/seat-layouts", async (req, res) => {
  try {
    const { name, seats } = req.body;
    if (!name) return res.status(400).json({ error: "name required" });
    const layout = await SeatLayout.create({ name, seats: seats || [] });
    res.json({ layout });
  } catch (err) {
    console.error("create layout", err);
    res.status(500).json({ error: err.message || "failed to create layout" });
  }
});

// List layouts
router.get("/seat-layouts", async (req, res) => {
  try {
    const layouts = await SeatLayout.find().sort({ createdAt: -1 });
    res.json(layouts);
  } catch (err) {
    console.error("list layouts", err);
    res.status(500).json({ error: "failed to fetch layouts" });
  }
});

// Get single layout
router.get("/seat-layouts/:id", async (req, res) => {
  try {
    const layout = await SeatLayout.findById(req.params.id);
    if (!layout) return res.status(404).json({ error: "layout not found" });
    res.json(layout);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed" });
  }
});

// Update layout
router.put("/seat-layouts/:id", async (req, res) => {
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
    console.error("update layout", err);
    res.status(500).json({ error: "failed to update layout" });
  }
});

// Delete layout
router.delete("/seat-layouts/:id", async (req, res) => {
  try {
    await SeatLayout.findByIdAndDelete(req.params.id);
    res.json({ message: "layout deleted" });
  } catch (err) {
    console.error("delete layout", err);
    res.status(500).json({ error: "failed to delete layout" });
  }
});

export default router;
