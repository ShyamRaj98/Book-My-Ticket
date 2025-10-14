import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import seatsReducer from "../features/seats/seatsSlice";
// import moviesReducer from "../features/movies/movieSlice";
// import theaterReducer from "../features/theaters/theaterSlice";
// import bookingReducer from "../features/booking/bookingSlice";
// import showtimesReducer from "../features/showtime/showtimeSlice.js";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    seats: seatsReducer
    // movies: moviesReducer,
    // theater: theaterReducer,
    // showtimes: showtimesReducer,
    // bookings: bookingReducer,
  },
});
