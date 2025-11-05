import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchBookingHistory } from "../redux/slices/bookingSlice";
import Loading from "../components/Loading";
import Error from "../components/Error.jsx";

const BookingHistory = ({ userId }) => {
  const dispatch = useDispatch();
  const { bookings, loading, error } = useSelector((state) => state.booking);

  useEffect(() => {
    dispatch(fetchBookingHistory(userId));
  }, [dispatch, userId]);

  if (loading) return <Loading loader="load" />;
  if (error) return <Error message={error} />;

  return (
    <div>
      <h2>📜 Booking History</h2>
      {bookings.length === 0 ? (
        <p>No bookings found</p>
      ) : (
        <ul>
          {bookings.map((b) => (
            <li key={b._id}>
              🎬 <b>{b.movie.title}</b> at {b.theater.name} (
              {b.seats.join(", ")}) — <b>Status:</b> {b.status} —{" "}
              <b>₹{b.totalPrice}</b>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default BookingHistory;
