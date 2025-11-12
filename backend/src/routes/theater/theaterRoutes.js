// routes/theaterRoutes.js
import express from "express";
import { auth } from "../../middlewares/auth.js";
import { requireTheater } from "../../middlewares/admin.js";
import theaterController from "../../controllers/theaterController.js";
import adminController from "../../controllers/adminController.js";

const router = express.Router();

// Protect all routes
router.use(auth);
router.use(requireTheater);

/** 🎭 Theater profile */
router.get("/profile", theaterController.getMyTheaterProfile);

/** 🎥 Movie APIs */
router.post("/movies", adminController.addMovie);
router.get("/movies", adminController.listMovies);
router.put("/movies/:id", adminController.updateMovie);
router.delete("/movies/:id", adminController.deleteMovie);

/** 🎥 Theater APIs */
router.get("/my-theaters", theaterController.listMyTheaters);
router.post("/my-theaters", theaterController.addMyTheater);
router.put("/my-theaters/:id", theaterController.updateMyTheater);
router.delete("/my-theaters/:id", theaterController.deleteMyTheater);

/** TheaterLayout APIs */
router.post("/seat-layouts", theaterController.createLayout);
router.get("/seat-layouts", theaterController.getLayouts);
router.put("/seat-layouts/:id", theaterController.updateLayout);
router.delete("/seat-layouts/:id", theaterController.deleteLayout);

/** Theater Screen APIs */
router.post("/screens/:theaterId", theaterController.addScreen);
router.put("/screens/:theaterId", theaterController.updateScreen);
router.put(
  "/screens/:theaterId/:screenName",
  theaterController.updateScreenTemplate
);
router.delete(
  "/screens/:theaterId/:screenName",
  theaterController.deleteScreen
);

/** Showtime APIs */
router.get("/showtimes", theaterController.getMyShowtimes);
router.post("/showtimes", theaterController.createMyShowtime);
router.patch("/showtimes/:id", theaterController.updateMyShowtime);
router.delete("/showtimes/:id", theaterController.deleteMyShowtime);

/** 🎟 Sales Report for Theater Admin */
router.get("/reports/summary", theaterController.getTheaterSummary);
router.get("/reports/sales", theaterController.getTheaterSales);
router.get("/reports/popular-movies",theaterController.getTheaterPopularMovies);
router.get("/reports/occupancy", theaterController.getTheaterOccupancy);

export default router;
