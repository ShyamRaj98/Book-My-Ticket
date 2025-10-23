import express from "express";
import multer from "multer";
import { auth as authMiddleware } from "../../middlewares/auth.js";
import { requireAdmin } from "../../middlewares/admin.js";
import adminController from "../../controllers/adminController.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// Protect all admin routes
router.use(authMiddleware);
router.use(requireAdmin);

/** Movies */
router.post("/movies", adminController.addMovie);
router.get("/movies", adminController.listMovies);
router.put("/movies/:id", adminController.updateMovie);
router.delete("/movies/:id", adminController.deleteMovie);

/** Theaters */
router.post("/theaters", adminController.addTheater);
router.get("/theaters-list", adminController.listTheaters);
router.get("/theaters/:id", adminController.getTheater);
router.put("/theaters/:id", adminController.updateTheater);
router.delete("/theaters/:id", adminController.deleteTheater);

/** Screens */
router.post("/screens/:theaterId", adminController.addScreen);
router.put("/screens/:theaterId", adminController.updateScreen);
router.put("/screens/:theaterId/:screenName", adminController.updateScreenTemplate);
router.delete("/screens/:theaterId/:screenName", adminController.deleteScreen);

/** Showtimes */
router.get("/showtimes/:id", adminController.getShowtime);

/** Seat CSV */
router.post("/upload-seat-csv", upload.single("file"), adminController.uploadSeatCSV);
router.post("/parse-seat-csv", adminController.parseSeatCSV);
router.post(
  "/screens/upload-csv/:theaterId/:screenName",
  upload.single("file"),
  adminController.uploadScreenCSV
);

export default router;
