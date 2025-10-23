import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import connectDB from "./src/config/db.js";
import moviesRoute from "./src/routes/public/movies.js";
import showtimesRoute from "./src/routes/public/showtimes.js";
import adminRoute from "./src/routes/admin/admin.js";
import adminUsersRoutes from "./src/routes/admin/adminUsers.js";
import authRoute from "./src/routes/auth.js";
import bookingsRoute from "./src/routes/bookings.js";
import paymentsRoute from "./src/routes/payments.js";
import webhookRoute from "./src/routes/webhook.js";
import adminReportRoutes from "./src/routes/admin/adminReportRoutes.js";
import { generateDailyReport } from "./src/utils/generateDailyReport.js";
import adminSeatLayouts from "./src/routes/admin/adminSeatLayoutRoutes.js";
import adminShowtimeRoute from "./src/routes/admin/AdminShowtimeRoutes.js";
// import adminAuthRoutes from "./src/routes/admin/adminAuth.js";

dotenv.config();
const app = express();

// mount webhook route at /webhook (it uses express.raw inside)
app.use("/api/webhooks", webhookRoute);
// Middleware to parse JSON bodies
app.use(express.json());
app.use(helmet());
app.use(morgan("dev"));

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  })
);

// db
connectDB();
generateDailyReport();
app.get("/", (req, res) => {
  res.send("Server running...");
});

// mount api
app.use("/api/movies", moviesRoute);
app.use("/api/showtimes", showtimesRoute);
app.use("/api/admin", adminRoute);
app.use("/api/auth", authRoute);
app.use("/api/admin", adminSeatLayouts);
app.use("/api/admin/users", adminUsersRoutes);
app.use("/api/admin/showtimes", adminShowtimeRoute);
app.use("/api/bookings", bookingsRoute);
// after app.use(express.json()) and mounting API routes
app.use("/api/payments", paymentsRoute);

app.use("/api/admin/reports", adminReportRoutes);

// global error handler (simple)
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "internal_server_error" });
});

const PORT = process.env.PORT || 8060;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
