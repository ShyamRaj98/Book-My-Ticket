import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

const tokenFromStorage = localStorage.getItem("token") || null;
const userFromStorage = localStorage.getItem("user")
  ? JSON.parse(localStorage.getItem("user"))
  : null;

/* ================================
   🔹 REGISTER (User, Admin, Theater)
================================= */
export const register = createAsyncThunk(
  "auth/register",
  async (payload, thunkAPI) => {
    try {
      let endpoint = "/auth/register";

      if (payload.role === "admin") endpoint = "/auth/admin/register";
      else if (payload.role === "theater") endpoint = "/auth/theater/register";

      const { data } = await api.post(endpoint, payload);
      return data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data || { error: "Register failed" }
      );
    }
  }
);

/* ================================
   🔹 LOGIN (User, Admin, Theater)
================================= */
export const login = createAsyncThunk(
  "auth/login",
  async (payload, thunkAPI) => {
    try {
      let route = "/auth/login";

      if (payload.role === "admin") route = "/auth/admin/login";
      else if (payload.role === "theater") route = "/auth/theater/login";

      const { data } = await api.post(route, payload);
      return data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data || { error: "Login failed" }
      );
    }
  }
);

/* ================================
   🔹 FETCH PROFILE
================================= */
export const fetchProfile = createAsyncThunk(
  "auth/fetchProfile",
  async (_, thunkAPI) => {
    try {
      const { data } = await api.get("/auth/profile");
      return data.user;
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
      return thunkAPI.rejectWithValue(
        err.response?.data || { error: "Fetch profile failed" }
      );
    }
  }
);

/* ================================
   🔹 PASSWORD FLOWS
================================= */
export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (email, thunkAPI) => {
    try {
      const { data } = await api.post("/auth/forgot-password", { email });
      return data.message;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.error || "Email send failed"
      );
    }
  }
);

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async ({ token, newPassword }, thunkAPI) => {
    try {
      const { data } = await api.post(`/auth/reset-password/${token}`, {
        newPassword,
      });
      return data.message;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.error || "Reset failed"
      );
    }
  }
);

/* ================================
   🔹 UPDATE PROFILE
================================= */
export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (payload, thunkAPI) => {
    try {
      const { data } = await api.put("/auth/profile", payload);
      return data.user;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data || { error: "Update failed" }
      );
    }
  }
);

/* ================================
   🔹 SLICE
================================= */
const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: userFromStorage,
    token: tokenFromStorage,
    loading: false,
    error: null,
    successMessage: null,
  },
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
    setToken(state, action) {
      state.token = action.payload;
      if (action.payload) localStorage.setItem("token", action.payload);
      else localStorage.removeItem("token");
    },
  },
  extraReducers: (builder) => {
    builder
      // 🔹 Register
      .addCase(register.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(register.fulfilled, (s, a) => {
        s.loading = false;
        s.user = a.payload.user;
        s.token = a.payload.token;
        localStorage.setItem("token", a.payload.token);
        localStorage.setItem("user", JSON.stringify(a.payload.user));
      })
      .addCase(register.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload?.error;
      })

      // 🔹 Login
      .addCase(login.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(login.fulfilled, (s, a) => {
        s.loading = false;
        s.user = a.payload.user;
        s.token = a.payload.token;
        localStorage.setItem("token", a.payload.token);
        localStorage.setItem("user", JSON.stringify(a.payload.user));
      })
      .addCase(login.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload?.error;
      })

      // 🔹 Forgot Password
      .addCase(forgotPassword.fulfilled, (s, a) => {
        s.loading = false;
        s.successMessage = a.payload;
      })
      .addCase(forgotPassword.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })

      // 🔹 Reset Password
      .addCase(resetPassword.fulfilled, (s, a) => {
        s.loading = false;
        s.successMessage = a.payload;
      })
      .addCase(resetPassword.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })

      // 🔹 Fetch Profile
      .addCase(fetchProfile.fulfilled, (s, a) => {
        s.user = a.payload;
      })

      // 🔹 Update Profile
      .addCase(updateProfile.fulfilled, (s, a) => {
        s.loading = false;
        s.user = a.payload;
        localStorage.setItem("user", JSON.stringify(a.payload));
      })
      .addCase(updateProfile.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload?.error;
      });
  },
});

export const { logout, setToken } = authSlice.actions;
export default authSlice.reducer;
