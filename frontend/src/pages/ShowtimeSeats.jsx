import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios"; // your axios instance
import SeatMap from "../components/SeatMap";
import { useSelector, useDispatch } from "react-redux";
import { clearSelection } from "../features/seats/seatsSlice";

export default function ShowtimeSeats() {
  const { id } = useParams(); // showtime id from route
  const [showtime, setShowtime] = useState(null);
  const [loading, setLoading] = useState(true);
  const selected = useSelector((s) => s.seats.selected);
  const auth = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Load showtime details
  useEffect(() => {
    async function loadShowtime() {
      setLoading(true);
      try {
        const res = await api.get(`/showtimes/${id}`);
        setShowtime(res.data);
        dispatch(clearSelection());
      } catch (err) {
        console.error("Failed to load showtime:", err);
        alert("Failed to load showtime details.");
      } finally {
        setLoading(false);
      }
    }
    loadShowtime();
  }, [id, dispatch]);

  if (loading) return <div className="p-6 text-center">Loading showtime…</div>;
  if (!showtime)
    return <div className="p-6 text-center">Showtime not found</div>;

  // Compute total price based on selected seats
  const total = selected.reduce((sum, sid) => {
    const seat = showtime.seats.find((s) => s.seatId === sid);
    return sum + (seat ? seat.price : 0);
  }, 0);

  // Hold seats before checkout
  const onHoldSeats = async () => {
    if (!auth?.token) return alert("Please login to continue");
    if (selected.length === 0) return alert("Please select at least one seat");

    try {
      const res = await api.post(
        "/bookings/hold",
        {
          showtimeId: showtime._id,
          seats: selected,
        },
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );

      if (res.data?.bookingId) {
        navigate(`/checkout/${res.data.bookingId}`);
      } else {
        alert("Failed to hold seats. Try again.");
      }
    } catch (err) {
      console.error("Hold seats error:", err);
      alert(err.response?.data?.message || "Failed to hold seats");
    }
  };

  return (
    <div className="container mx-auto px-4">
      <div className="py-4">
        <h2 className="text-2xl font-semibold mb-1">
          {showtime.movie?.title} - ({showtime.language})
        </h2>
        <p className="text-gray-500 mb-4 font-semibold text-md">
          {showtime.theater?.name} •{" "}
          {new Date(showtime.startTime).toLocaleString()}
        </p>
      </div>
      <div className="flex flex-col md:flex-row gap-6 shadow-lg">
        {/* Left: Seat Layout */}
        <div className="flex-1">
          <SeatMap screen={showtime.screenName} seats={showtime.seats} />
        </div>

        {/* Right: Summary */}
        <div className="h-full bg-white rounded-xl shadow-md p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-2">Your Selection</h3>

            <div className="mb-2 text-sm">
              <div>Selected Seats:</div>
              <div className="font-mono text-gray-800 mt-1">
                <div className="font-mono text-gray-800 mt-1">
                  {selected.length
                    ? selected
                        .map((sid) => {
                          const seat = showtime.seats.find(
                            (s) => s.seatId === sid
                          );
                          return seat ? seat.label : sid;
                        })
                        .join(", ")
                    : "—"}
                </div>
              </div>
            </div>

            <div className="mb-4 text-base font-semibold">
              Total: <span className="text-green-700">₹{total}</span>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <button
              onClick={onHoldSeats}
              className="w-full py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              Hold & Proceed to Checkout
            </button>
            <button
              onClick={() => dispatch(clearSelection())}
              className="w-full py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Clear Selection
            </button>
          </div>

          <div className="text-xs text-gray-500 mt-4">
            Held seats are reserved for 15 minutes before expiry.
          </div>
        </div>
      </div>
    </div>
  );
}
