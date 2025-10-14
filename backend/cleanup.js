// after mongoose.connect(...).then(...)
import mongoose from "mongoose";
import Booking from "./models/Booking.js";
import Showtime from "./models/Showtime.js";

const RESERVATION_TIMEOUT_MIN = 8; // minutes
const MONGODB_URI = `mongodb+srv://shyamdeepu1998_db_user:SmXraqiDppajpM0l@moviebooking.joshwfq.mongodb.net/MovieTicketBooking?retryWrites=true&w=majority&appName=movieBooking`;
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    app.listen(PORT, () =>
      console.log(`Server running http://localhost:${PORT}`)
    );

    // Start cleanup interval
    setInterval(async () => {
      try {
        const cutoff = new Date(
          Date.now() - RESERVATION_TIMEOUT_MIN * 60 * 1000
        );
        // Find pending bookings reservedAt < cutoff
        const staleBookings = await Booking.find({
          status: "pending",
          reservedAt: { $lt: cutoff },
        });
        for (const b of staleBookings) {
          const session = await mongoose.startSession();
          session.startTransaction();
          try {
            const showtime = await Showtime.findById(b.showtime).session(
              session
            );
            if (showtime) {
              // release seats
              showtime.seats = showtime.seats.map((s) => {
                if (b.seats.includes(s.code) && s.status === "reserved") {
                  return {
                    ...(s.toObject ? s.toObject() : s),
                    status: "available",
                    reservedBy: undefined,
                    reservedAt: undefined,
                  };
                }
                return s;
              });
              await showtime.save({ session });
            }
            b.status = "cancelled";
            b.cancelledAt = new Date();
            await b.save({ session });
            await session.commitTransaction();
            session.endSession();
            console.log(`Released stale booking ${b._id}`);
          } catch (err) {
            await session.abortTransaction();
            session.endSession();
            console.error("Failed to cleanup booking", b._id, err.message);
          }
        }
      } catch (err) {
        console.error("Cleanup err", err.message);
      }
    }, 60 * 1000); // run every minute
  })
  .catch((err) => console.error("MongoDB connection error:", err));
