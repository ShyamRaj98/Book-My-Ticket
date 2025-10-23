import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios"; // adjust path if needed

const tokenFromStorage = localStorage.getItem("token") || null;
const userFromStorage = localStorage.getItem("user")
  ? JSON.parse(localStorage.getItem("user"))
  : null;

/* ================================
   🔹 USER & ADMIN REGISTER / LOGIN
================================= */

export const register = createAsyncThunk("auth/register", async (payload, thunkAPI) => {
  try {
    const endpoint = payload.role === "admin" ? "auth/admin/register" : "/auth/register";
    const { data } = await api.post(endpoint, payload);
    return data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data || { error: "Register failed" });
  }
});

// ✅ Login (Single page for both user/admin)
export const login = createAsyncThunk("auth/login", async (payload, thunkAPI) => {
  try {
    // backend auto-detects role (user or admin) based on route
    const route = payload.role === "admin" ? "auth/admin/login" : "/auth/login";
    const { data } = await api.post(route, payload);
    return data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data || { error: "Login failed" });
  }
});

// ✅ Fetch Profile (after login)
export const fetchProfile = createAsyncThunk("auth/fetchProfile", async (_, thunkAPI) => {
  try {
    const { data } = await api.get("/auth/profile");
    return data.user;
  } catch (err) {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    return thunkAPI.rejectWithValue(err.response?.data || { error: "Fetch profile failed" });
  }
});

/* ================================
   🔹 PASSWORD RESET FLOWS
================================= */

// ✅ Forgot Password (send email)
export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (email, thunkAPI) => {
    try {
      const { data } = await api.post("/auth/forgot-password", { email });
      return data.message;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.error || "Email send failed");
    }
  }
);

// ✅ Reset Password (set new password)
export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async ({ token, newPassword }, thunkAPI) => {
    try {
      const { data } = await api.post(`/auth/reset-password/${token}`, { newPassword });
      return data.message;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.error || "Reset failed");
    }
  }
);

/* ================================
   🔹 PROFILE UPDATE
================================= */

export const updateProfile = createAsyncThunk("auth/updateProfile", async (payload, thunkAPI) => {
  try {
    const { data } = await api.put("/auth/profile", payload);
    return data.user;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data || { error: "Update failed" });
  }
});

/* ================================
   🔹 AUTH SLICE
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

      /* -------- Register User & admin -------- */
      .addCase(register.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(register.fulfilled, (s, a) => {
        s.loading = false;
        s.user = a.payload.user;
        s.token = a.payload.token;
        localStorage.setItem("token", a.payload.token);
      })
      .addCase(register.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload?.error;
      })

      /* -------- Login -------- */
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

      /* -------- Forgot Password -------- */
      .addCase(forgotPassword.pending, (s) => {
        s.loading = true;
        s.error = null;
        s.successMessage = null;
      })
      .addCase(forgotPassword.fulfilled, (s, a) => {
        s.loading = false;
        s.successMessage = a.payload;
      })
      .addCase(forgotPassword.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })

      /* -------- Reset Password -------- */
      .addCase(resetPassword.pending, (s) => {
        s.loading = true;
        s.error = null;
        s.successMessage = null;
      })
      .addCase(resetPassword.fulfilled, (s, a) => {
        s.loading = false;
        s.successMessage = a.payload;
      })
      .addCase(resetPassword.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })

      /* -------- Fetch Profile -------- */
      .addCase(fetchProfile.fulfilled, (s, a) => {
        s.user = a.payload;
      })

      /* -------- Update Profile -------- */
      .addCase(updateProfile.pending, (s) => {
        s.loading = true;
      })
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
