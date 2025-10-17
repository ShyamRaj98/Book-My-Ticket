import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios.js";

const tokenFromStorage = localStorage.getItem("token") || null;

export const register = createAsyncThunk("auth/register", async (payload, thunkAPI) => {
  try {
    const { data } = await api.post("/auth/register", payload);
    return data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data || { error: "register failed" });
  }
});

export const login = createAsyncThunk("auth/login", async (payload, thunkAPI) => {
  try {
    const { data } = await api.post("/auth/login", payload);
    return data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data || { error: "login failed" });
  }
});

export const fetchProfile = createAsyncThunk("auth/fetchProfile", async (_, thunkAPI) => {
  try {
    const { data } = await api.get("/auth/profile");
    return data.user;
  } catch (err) {
    if (err.response?.status === 401) localStorage.removeItem("token");
    return thunkAPI.rejectWithValue(err.response?.data || { error: "fetch profile failed" });
  }
});

export const updateProfile = createAsyncThunk("auth/updateProfile", async (payload, thunkAPI) => {
  try {
    const { data } = await api.put("/auth/profile", payload);
    return data.user;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data || { error: "update failed" });
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    token: tokenFromStorage,
    loading: false,
    error: null,
  },
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      localStorage.removeItem("token");
    },
    setToken(state, action) {
      state.token = action.payload;
      if (action.payload) localStorage.setItem("token", action.payload);
      else localStorage.removeItem("token");
    },
  },
  extraReducers: (builder) => {
    builder
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

      .addCase(login.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(login.fulfilled, (s, a) => {
        s.loading = false;
        s.user = a.payload.user;
        s.token = a.payload.token;
        localStorage.setItem("token", a.payload.token);
      })
      .addCase(login.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload?.error;
      })

      .addCase(fetchProfile.fulfilled, (s, a) => {
        s.user = a.payload;
      })

      .addCase(updateProfile.pending, (s) => {
        s.loading = true;
      })
      .addCase(updateProfile.fulfilled, (s, a) => {
        s.loading = false;
        s.user = a.payload;
      })
      .addCase(updateProfile.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload?.error;
      });
  },
});

export const { logout, setToken } = authSlice.actions;
export default authSlice.reducer;
