import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import seatsReducer from "../features/seats/seatsSlice";
import bookingReducer from "../features/bookings/bookingSlice";
import reportReducer from "../features/reports/reportSlice";
// import moviesReducer from "../features/movies/movieSlice";
// import theaterReducer from "../features/theaters/theaterSlice";
// import showtimesReducer from "../features/showtime/showtimeSlice.js";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    seats: seatsReducer,
    booking: bookingReducer,
    reports: reportReducer,
    // movies: moviesReducer,
    // theater: theaterReducer,
    // showtimes: showtimesReducer,
  },
});
