import Booking from "../models/Booking.js";
import Report from "../models/Report.js";

export const generateDailyReport = async () => {
  const today = new Date();
  const start = new Date(today);
  start.setHours(0, 0, 0, 0);
  const end = new Date(today);
  end.setHours(23, 59, 59, 999);

  const result = await Booking.aggregate([
    { $match: { createdAt: { $gte: start, $lt: end }, status: "paid" } },
    {
      $group: {
        _id: null,
        total: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
  ]);

  const data = result[0] || { total: 0, count: 0 };

  await Report.findOneAndUpdate(
    { date: start },
    {
      date: start,
      totalSales: data.total,
      totalBookings: data.count,
    },
    { upsert: true, new: true }
  );

  console.log("✅ Daily Report Updated:", data);
};
