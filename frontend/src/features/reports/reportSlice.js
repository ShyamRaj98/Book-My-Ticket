import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

export const fetchSummary = createAsyncThunk("reports/fetchSummary", async () => {
  const res = await api.get("/admin/reports/summary");
  return res.data.data;
});

export const fetchSales = createAsyncThunk("reports/fetchSales", async (params = {}) => {
  const res = await api.get("/admin/reports/sales", { params });
  return res.data.data;
});

export const fetchPopularMovies = createAsyncThunk("reports/fetchPopular", async () => {
  const res = await api.get("/admin/reports/popular-movies");
  return res.data.data;
});

export const fetchOccupancy = createAsyncThunk("reports/fetchOccupancy", async () => {
  const res = await api.get("/admin/reports/theater-occupancy");
  return res.data.data;
});

export const fetchUserActivity = createAsyncThunk("reports/fetchUsers", async () => {
  const res = await api.get("/admin/reports/user-activity");
  return res.data.data;
});

const reportSlice = createSlice({
  name: "reports",
  initialState: {
    summary: {},
    sales: [],
    popular: [],
    occupancy: [],
    users: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addMatcher((a) => a.type.startsWith("reports/") && a.type.endsWith("/pending"), (s) => {
        s.loading = true;
      })
      .addMatcher((a) => a.type.startsWith("reports/") && a.type.endsWith("/fulfilled"), (s, a) => {
        s.loading = false;
        const key = a.type.split("/")[1].replace("fetch", "").toLowerCase();
        s[key] = a.payload;
      })
      .addMatcher((a) => a.type.startsWith("reports/") && a.type.endsWith("/rejected"), (s, a) => {
        s.loading = false;
        s.error = a.error.message;
      });
  },
});

export default reportSlice.reducer;
