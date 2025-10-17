import React, { useEffect, useState } from "react";
import api from "../api/axios.js";
import { useSelector } from "react-redux";
import dayjs from "dayjs";

export default function MyBooking() {
  const { user } = useSelector((s) => s.auth);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      const { data } = await api.get("/bookings/my");
      setBookings(data.bookings || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this booking?")) return;
    try {
      await api.post(`/bookings/${id}/cancel`);
      fetchBookings();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Failed to cancel booking");
    }
  };

  const handleDownload = async (id) => {
    try {
      const response = await api.get(`/bookings/${id}/download`, {
        responseType: "blob", // important for downloading PDF
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `ticket-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Failed to download ticket");
    }
  };

  if (loading)
    return <p className="text-center mt-10 text-gray-500">Loading your bookings...</p>;

  if (!bookings.length)
    return <p className="text-center mt-10 text-gray-500">No bookings found.</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-md p-6">
        <h2 className="text-3xl font-bold text-red-600 mb-6 text-center">
          My Bookings
        </h2>

        <div className="space-y-5">
          {bookings.map((b) => {
            const showStarted = dayjs().isAfter(dayjs(b.showtime.startTime));
            return (
              <div
                key={b._id}
                className="border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition bg-white p-5"
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {b.showtime?.movie?.title || "Untitled Movie"}
                  </h3>
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      b.status === "paid"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {b.status}
                  </span>
                </div>

                <p className="text-sm text-gray-600 mb-1">
                  <strong>Showtime:</strong>{" "}
                  {dayjs(b.showtime.startTime).format("DD MMM YYYY, hh:mm A")}
                </p>

                <p className="text-sm text-gray-600 mb-1">
                  <strong>Seats:</strong> {b.seats.map((s) => s.seatId).join(", ")}
                </p>

                <p className="text-sm text-gray-600 mb-2">
                  <strong>Total:</strong> ₹{b.amount}
                </p>

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => handleCancel(b._id)}
                    disabled={b.status !== "paid" || showStarted}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                      b.status === "paid" && !showStarted
                        ? "bg-red-600 text-white hover:bg-red-700"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    Booking Cancel
                  </button>

                  {b.status === "paid" && (
                    <button
                      onClick={() => handleDownload(b._id)}
                      className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition"
                    >
                      Download PDF
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
