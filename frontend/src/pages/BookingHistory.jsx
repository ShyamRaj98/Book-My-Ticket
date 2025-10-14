import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchBookingHistory } from "../redux/slices/bookingSlice";

const BookingHistory = ({ userId }) => {
  const dispatch = useDispatch();
  const { bookings, loading, error } = useSelector((state) => state.booking);

  useEffect(() => {
    dispatch(fetchBookingHistory(userId));
  }, [dispatch, userId]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <h2>📜 Booking History</h2>
      {bookings.length === 0 ? (
        <p>No bookings found</p>
      ) : (
        <ul>
          {bookings.map((b) => (
            <li key={b._id}>
              🎬 <b>{b.movie.title}</b> at {b.theater.name} ({b.seats.join(", ")})  
              — <b>Status:</b> {b.status} — <b>₹{b.totalPrice}</b>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default BookingHistory;