import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

// 🎯 Helper to safely extract response data
const safeData = (res, fallback) => {
  if (!res || !res.data) return fallback;
  const data = res.data.data;
  if (Array.isArray(fallback)) return Array.isArray(data) ? data : fallback;
  if (typeof fallback === "object")
    return data && typeof data === "object" ? data : fallback;
  return fallback;
};

// 🎭 API Calls

export const fetchTheaterSummary = createAsyncThunk(
  "theaterReports/fetchSummary",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/theater/reports/summary");
      return safeData(res, {});
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchTheaterSales = createAsyncThunk(
  "theaterReports/fetchSales",
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await api.get("/theater/reports/sales", { params });
      return safeData(res, []);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchTheaterPopularMovies = createAsyncThunk(
  "theaterReports/fetchPopularMovies",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/theater/reports/popular-movies");
      return safeData(res, []);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchTheaterOccupancy = createAsyncThunk(
  "theaterReports/fetchOccupancy",
  async (_, { rejectWithValue }) => {
    try {
      // 🪑 Some routes differ (/occupancy vs /theater-occupancy)
      const res = await api.get("/theater/reports/occupancy");
      return safeData(res, []);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// 🎬 Slice
const theaterReportSlice = createSlice({
  name: "theaterReports",
  initialState: {
    summary: {},
    sales: [],
    popular: [],
    occupancy: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    // ✅ addCase FIRST
    builder
      .addCase(fetchTheaterSummary.fulfilled, (state, action) => {
        state.loading = false;
        state.summary = action.payload || {};
      })
      .addCase(fetchTheaterSales.fulfilled, (state, action) => {
        state.loading = false;
        state.sales = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchTheaterPopularMovies.fulfilled, (state, action) => {
        state.loading = false;
        state.popular = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchTheaterOccupancy.fulfilled, (state, action) => {
        state.loading = false;
        state.occupancy = Array.isArray(action.payload) ? action.payload : [];
      })

      // ✅ Then addMatchers
      .addMatcher(
        (action) =>
          action.type.startsWith("theaterReports/") &&
          action.type.endsWith("/pending"),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) =>
          action.type.startsWith("theaterReports/") &&
          action.type.endsWith("/rejected"),
        (state, action) => {
          state.loading = false;
          state.error = action.payload || action.error.message;
        }
      );
  },
});

export default theaterReportSlice.reducer;
