import Booking from "../models/Booking.js";
import Showtime from "../models/Showtime.js";
import Movie from "../models/Movie.js";
import Theater from "../models/Theater.js";
import User from "../models/User.js";
import mongoose from "mongoose";

/** ------------------ DASHBOARD SUMMARY ------------------ **/
export const getDashboardSummary = async (req, res) => {
  try {
    const totalBookings = await Booking.countDocuments({ status: "paid" });
    const totalSalesAgg = await Booking.aggregate([
      { $match: { status: "paid" } },
      { $group: { _id: null, totalSales: { $sum: "$amount" } } },
    ]);
    const totalSales = totalSalesAgg[0]?.totalSales || 0;

    // Average occupancy
    const showtimes = await Showtime.find().select("seats _id").lean();
    const totalSeats = showtimes.reduce((sum, s) => sum + (s.seats?.length || 0), 0);
    const bookedSeatsAgg = await Booking.aggregate([
      { $match: { status: "paid" } },
      { $project: { count: { $size: "$seats" } } },
      { $group: { _id: null, bookedSeats: { $sum: "$count" } } },
    ]);
    const bookedSeats = bookedSeatsAgg[0]?.bookedSeats || 0;
    const avgOccupancy = totalSeats ? (bookedSeats / totalSeats) * 100 : 0;

    res.json({
      success: true,
      data: {
        totalSales,
        totalBookings,
        avgOccupancy: Math.round(avgOccupancy * 100) / 100,
      },
    });
  } catch (err) {
    console.error("getDashboardSummary:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

/** ------------------ SALES REPORT ------------------ **/
export const getSalesReport = async (req, res) => {
  try {
    const { from, to, interval = "daily" } = req.query;
    const match = { status: "paid" };
    if (from || to) match.createdAt = {};
    if (from) match.createdAt.$gte = new Date(from);
    if (to) match.createdAt.$lte = new Date(to);

    const groupId =
      interval === "monthly"
        ? { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } }
        : interval === "weekly"
        ? { year: { $year: "$createdAt" }, week: { $week: "$createdAt" } }
        : {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
          };

    const sales = await Booking.aggregate([
      { $match: match },
      {
        $group: {
          _id: groupId,
          totalSales: { $sum: "$amount" },
          totalBookings: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": -1, "_id.month": -1, "_id.day": -1 } },
    ]);

    res.json({ success: true, data: sales });
  } catch (err) {
    console.error("getSalesReport:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

/** ------------------ POPULAR MOVIES ------------------ **/
export const getPopularMovies = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit || "10", 10);

    const pipeline = [
      { $match: { status: "paid" } },
      {
        $lookup: {
          from: "showtimes",
          localField: "showtime",
          foreignField: "_id",
          as: "showtimeDoc",
        },
      },
      { $unwind: "$showtimeDoc" },
      {
        $group: {
          _id: "$showtimeDoc.movie",
          bookings: { $sum: 1 },
          totalRevenue: { $sum: "$amount" },
        },
      },
      { $sort: { bookings: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: "movies",
          localField: "_id",
          foreignField: "_id",
          as: "movie",
        },
      },
      { $unwind: { path: "$movie", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          bookings: 1,
          totalRevenue: 1,
          "movie.title": 1,
          "movie.posterPath": 1,
        },
      },
    ];

    const result = await Booking.aggregate(pipeline);
    res.json({ success: true, data: result });
  } catch (err) {
    console.error("getPopularMovies:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

/** ------------------ THEATER OCCUPANCY ------------------ **/
export const getTheaterOccupancy = async (req, res) => {
  try {
    const { from, to } = req.query;

    // Filter showtimes by date if provided
    const showtimeMatch = {};
    if (from || to) showtimeMatch.startTime = {};
    if (from) showtimeMatch.startTime.$gte = new Date(from);
    if (to) showtimeMatch.startTime.$lte = new Date(to);

    // Fetch all showtimes
    const showtimes = await Showtime.find(showtimeMatch)
      .select("theater seats _id")
      .populate("theater", "name")
      .lean();

    // Map of showtime -> theater info
    const showtimeMap = {};
    showtimes.forEach((st) => {
      if (!st.theater?._id) return;
      showtimeMap[st._id.toString()] = {
        theaterId: st.theater._id.toString(),
        theaterName: st.theater.name,
        totalSeats: Array.isArray(st.seats) ? st.seats.length : 0,
      };
    });

    // Get total seats booked per showtime
    const bookingAgg = await Booking.aggregate([
      {
        $project: {
          showtime: 1,
          seatsCount: { $size: { $ifNull: ["$seats", []] } },
        },
      },
      {
        $group: {
          _id: "$showtime",
          seatsBooked: { $sum: "$seatsCount" },
        },
      },
    ]);

    // Combine data theater-wise
    const theaterAccum = {};
    bookingAgg.forEach((b) => {
      const st = showtimeMap[b._id?.toString()];
      if (!st) return;

      const tId = st.theaterId;
      if (!theaterAccum[tId])
        theaterAccum[tId] = {
          theaterName: st.theaterName,
          totalSeats: 0,
          seatsBooked: 0,
        };

      theaterAccum[tId].seatsBooked += b.seatsBooked;
      theaterAccum[tId].totalSeats += st.totalSeats;
    });

    // Prepare final data array
    const data = Object.entries(theaterAccum).map(([theaterId, acc]) => {
      const occupancyPct =
        acc.totalSeats > 0
          ? (acc.seatsBooked / acc.totalSeats) * 100
          : 0;

      return {
        theaterId,
        theaterName: acc.theaterName,
        totalSeats: acc.totalSeats,
        seatsBooked: acc.seatsBooked,
        occupancyPct: Math.round(occupancyPct * 100) / 100,
      };
    });

    // Sort descending by occupancy %
    data.sort((a, b) => b.occupancyPct - a.occupancyPct);

    res.json({ success: true, data });
  } catch (err) {
    console.error("getTheaterOccupancy error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

/** ------------------ USER ACTIVITY ------------------ **/
export const getUserActivity = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit || "20", 10);

    const agg = await Booking.aggregate([
      { $match: { status: "paid" } },
      {
        $group: {
          _id: "$user",
          totalBookings: { $sum: 1 },
          totalSpent: { $sum: "$amount" },
        },
      },
      { $sort: { totalSpent: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          totalBookings: 1,
          totalSpent: 1,
          "user.name": 1,
          "user.email": 1,
        },
      },
    ]);

    res.json({ success: true, data: agg });
  } catch (err) {
    console.error("getUserActivity:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};
