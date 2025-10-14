/**
 * scripts/seed.js
 * usage: NODE_ENV=development node scripts/seed.js
 */
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import Theater from "../src/models/Theater.js";
import Movie from "../src/models/Movie.js";
import Showtime from "../src/models/Showtime.js";

async function connect() {
  if (!process.env.MONGO_URI) {
    console.error("MONGO_URI not set in .env");
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGO_URI, { dbName: "MovieTicketBooking" });
  console.log("Mongo connected for seed");
}

// Build seat layout for a screen
function buildSeatGrid(rows = ["A", "B", "C", "D", "E", "F"], cols = 10) {
  const seats = [];
  for (const r of rows) {
    for (let c = 1; c <= cols; c++) {
      const seatId = `${r}${c}`;
      const isPremium = r === "A" || r === "B"; // first 2 rows premium
      seats.push({
        seatId,
        row: r,
        number: c,
        type: isPremium ? "premium" : "regular",
        price: isPremium ? 300 : 150,
      });
    }
  }
  return seats;
}

async function seed() {
  try {
    await connect();

    // Clean collections
    await Showtime.deleteMany({});
    await Theater.deleteMany({});
    await Movie.deleteMany({});

    // --- Create Theaters ---
    const theaters = await Theater.insertMany([
      {
        name: "Starplex Cinemas - Mall Road",
        location: "Sector 12, City",
        screens: [
          { name: "Screen 1", rows: 6, cols: 10, seats: buildSeatGrid() },
          { name: "Screen 2", rows: 6, cols: 10, seats: buildSeatGrid() },
        ],
      },
      {
        name: "Galaxy Multiplex - Downtown",
        location: "City Center, City",
        screens: [
          { name: "Screen 1", rows: 6, cols: 10, seats: buildSeatGrid() },
        ],
      },
    ]);
    console.log(`Created ${theaters.length} theaters`);

    // --- Create Movies ---
    const movies = await Movie.insertMany([
      {
        title: "The Great Adventure",
        genres: ["Action", "Adventure"],
        runtime: 125,
        posterPath: "",
        releaseDate: new Date("2025-08-15"),
        overview: "An action-packed adventure across continents.",
      },
      {
        title: "Mystery Island",
        genres: ["Thriller", "Mystery"],
        runtime: 110,
        posterPath: "",
        releaseDate: new Date("2025-09-01"),
        overview: "Unravel secrets on a mysterious island.",
      },
      {
        title: "Romance in Paris",
        genres: ["Romance", "Drama"],
        runtime: 100,
        posterPath: "",
        releaseDate: new Date("2025-07-20"),
        overview: "A love story set in the city of lights.",
      },
      {
        title: "Comedy Nights",
        genres: ["Comedy"],
        runtime: 90,
        posterPath: "",
        releaseDate: new Date("2025-08-01"),
        overview: "Laugh out loud with this hilarious film.",
      },
      {
        title: "Sci-Fi Odyssey",
        genres: ["Sci-Fi", "Adventure"],
        runtime: 140,
        posterPath: "",
        releaseDate: new Date("2025-09-10"),
        overview: "A journey across galaxies and time.",
      },
    ]);
    console.log(`Created ${movies.length} movies`);

    // --- Create Showtimes ---
    const now = new Date();
    for (const theater of theaters) {
      for (const screen of theater.screens) {
        // Each screen has 3 showtimes: 4h, 7h, 10h from now
        const showOffsets = [4, 7, 10];
        for (const offset of showOffsets) {
          const movie = movies[Math.floor(Math.random() * movies.length)];
          const seatsCopy = screen.seats.map((s) => ({
            seatId: s.seatId,
            row: s.row,
            number: s.number,
            type: s.type,
            price: s.price,
            status: "available",
          }));
          await Showtime.create({
            movie: movie._id,
            theater: theater._id,
            screenName: screen.name,
            startTime: new Date(now.getTime() + offset * 60 * 60 * 1000),
            seats: seatsCopy,
            language: "English",
            format: "2D",
          });
        }
      }
    }

    console.log("✅ Seed complete — multiple theaters, movies, and showtimes created.");
    process.exit(0);
  } catch (err) {
    console.error("Seed failed", err);
    process.exit(1);
  }
}

seed();
