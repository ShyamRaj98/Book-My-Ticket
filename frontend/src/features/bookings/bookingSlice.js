import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchMyBookings = createAsyncThunk(
  "booking/fetchMyBookings",
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const { data } = await axios.get("/api/bookings/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return data.bookings;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.error || "Failed to load bookings"
      );
    }
  }
);

export const cancelBooking = createAsyncThunk(
  "booking/cancelBooking",
  async (bookingId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const { data } = await axios.post(`/api/bookings/${bookingId}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      thunkAPI.dispatch(fetchMyBookings());
      return { bookingId, message: data.message };
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.error || "Failed to cancel booking"
      );
    }
  }
);

const bookingSlice = createSlice({
  name: "booking",
  initialState: { bookings: [], loading: false, error: null, cancelingId: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch bookings
      .addCase(fetchMyBookings.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMyBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = action.payload;
      })
      .addCase(fetchMyBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Cancel booking
      .addCase(cancelBooking.pending, (state, action) => {
        state.cancelingId = action.meta.arg;
      })
      .addCase(cancelBooking.fulfilled, (state) => {
        state.cancelingId = null;
      })
      .addCase(cancelBooking.rejected, (state, action) => {
        state.cancelingId = null;
        state.error = action.payload;
      });
  },
});

export default bookingSlice.reducer;
