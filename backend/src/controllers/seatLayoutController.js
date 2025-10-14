// controllers/seatLayoutController.js
import SeatLayout from "../models/SeatLayout.js";
import Theater from "../models/Theater.js"; // assumes your Theater model has screens[]

/**
 * GET /admin/seat-layouts
 * Get all saved seat layout templates
 */
export const getLayouts = async (req, res) => {
  try {
    const layouts = await SeatLayout.find().sort({ createdAt: -1 });
    res.json(layouts);
  } catch (err) {
    console.error("getLayouts error:", err);
    res.status(500).json({ message: "Failed to load layouts" });
  }
};

/**
 * POST /admin/seat-layouts
 * Create or update a seat layout
 */
export const createLayout = async (req, res) => {
  try {
    const { name, seats } = req.body;
    if (!name || !Array.isArray(seats))
      return res.status(400).json({ message: "Invalid layout data" });

    let layout = await SeatLayout.findOne({ name });
    if (layout) {
      layout.seats = seats;
      await layout.save();
    } else {
      layout = new SeatLayout({ name, seats });
      await layout.save();
    }

    res.status(200).json({ message: "Layout saved", layout });
  } catch (err) {
    console.error("createLayout error:", err);
    res.status(500).json({ message: "Failed to save layout" });
  }
};

/**
 * DELETE /admin/seat-layouts/:id
 * Delete a seat layout template
 */
export const deleteLayout = async (req, res) => {
  try {
    const { id } = req.params;
    await SeatLayout.findByIdAndDelete(id);
    res.json({ message: "Layout deleted" });
  } catch (err) {
    console.error("deleteLayout error:", err);
    res.status(500).json({ message: "Failed to delete layout" });
  }
};

/**
 * POST /admin/screens/:theaterId
 * Apply layout to a theater screen
 */
export const applyLayoutToScreen = async (req, res) => {
  try {
    const { theaterId } = req.params;
    const { name, layoutName } = req.body;

    const layout = await SeatLayout.findOne({ name: layoutName });
    if (!layout)
      return res.status(404).json({ message: "Layout not found" });

    const theater = await Theater.findById(theaterId);
    if (!theater) return res.status(404).json({ message: "Theater not found" });

    // Check if screen exists
    const screenIndex = theater.screens.findIndex((s) => s.name === name);
    if (screenIndex >= 0) {
      // update
      theater.screens[screenIndex].seats = layout.seats;
    } else {
      // add new screen
      theater.screens.push({
        name,
        seats: layout.seats,
      });
    }

    await theater.save();

    res.status(200).json({ message: "Layout applied to screen", theater });
  } catch (err) {
    console.error("applyLayoutToScreen error:", err);
    res.status(500).json({ message: "Failed to apply layout" });
  }
};

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