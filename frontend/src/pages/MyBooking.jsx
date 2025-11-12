import React, { useEffect, useState } from "react";
import api from "../api/axios.js";
import { useSelector } from "react-redux";
import dayjs from "dayjs";
import Loading from "../components/Loading.jsx";
import { Ticket, Calendar, MapPin, Download, XCircle } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function MyBooking() {
  const { user } = useSelector((s) => s.auth);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      const { data } = await api.get("/bookings/my");
      setBookings(data.bookings || []);
      console.log(bookings);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this booking?"))
      return;
    try {
      await api.post(`/bookings/${id}/cancel`);
      toast.success("Booking cancelled");
      fetchBookings();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Failed to cancel booking");
    }
  };

  const handleDownload = async (id) => {
    try {
      const response = await api.get(`/bookings/${id}/download`, {
        responseType: "blob",
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
      toast.error("Failed to download ticket");
    }
  };

  if (loading) return <Loading loader="load" />;

  if (!bookings.length)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200">
        <Ticket className="w-16 h-16 text-gray-400 mb-4" />
        <p className="text-gray-500 text-lg">No bookings found yet.</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 py-10 px-4">
      <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-xl border border-gray-200 p-8 transition-all hover:shadow-2xl">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-red-600 flex items-center gap-2">
            <Ticket className="w-8 h-8 text-red-600" /> My Bookings
          </h2>
          <p className="text-gray-500 mt-2 sm:mt-0">
            Welcome back, <span className="font-semibold">{user?.name}</span>
          </p>
        </div>

        <div className="grid gap-6">
          {bookings.map((b) => {
            const showStarted = dayjs().isAfter(dayjs(b.showtime.startTime));
            const statusColor =
              b.status === "paid"
                ? "bg-green-100 text-green-700"
                : b.status === "cancelled"
                ? "bg-red-100 text-red-700"
                : "bg-yellow-100 text-yellow-700";

            return (
              <div
                key={b._id}
                className="relative bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all p-6"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                  <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                    🎬 {b.showtime?.movie?.title || "Untitled Movie"}
                  </h3>
                  <span
                    className={`px-4 py-1.5 text-sm font-medium rounded-full ${statusColor}`}
                  >
                    {b.status.toUpperCase()}
                  </span>
                </div>

                {/* Booking Info */}
                <div className="grid sm:grid-cols-2 gap-4 text-sm text-gray-700 mb-4">
                  <p className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span>
                      <strong>Date:</strong>{" "}
                      {dayjs(b.showtime.startTime).format(
                        "DD MMM YYYY, hh:mm A"
                      )}
                    </span>
                  </p>

                  <p className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span>
                      <strong>Theater:</strong>{" "}
                      {b.showtime?.theater?.name || "N/A"}
                    </span>
                  </p>

                  <p className="flex items-center gap-2">
                    <span>
                      <strong>Seats:</strong>{" "}
                      {b.seats.map((s) => s.seatId).join(", ")}
                    </span>
                  </p>

                  <p>
                    <strong>Total:</strong>{" "}
                    <span className="text-green-700 font-semibold">
                      ₹{b.amount}
                    </span>
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap justify-end gap-3">
                  <button
                    onClick={() => handleDownload(b._id)}
                    disabled={b.status !== "paid"}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                      b.status === "paid"
                        ? "bg-blue-600 text-white hover:bg-blue-700 active:scale-95"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    <Download className="w-4 h-4" /> Ticket
                  </button>

                  <button
                    onClick={() => handleCancel(b._id)}
                    disabled={b.status !== "paid" || showStarted}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                      b.status === "paid" && !showStarted
                        ? "bg-red-600 text-white hover:bg-red-700 active:scale-95"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    <XCircle className="w-4 h-4" /> Cancel
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <Toaster position="top-right" />
    </div>
  );
}
