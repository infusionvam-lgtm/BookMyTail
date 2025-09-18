import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api.js"; // your axios instance

// --- Login User ---
export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/users/login", credentials);
      // Save token and role in localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role.toLowerCase());
      return data;
    } catch (err) {
      const message =
        err.response && err.response.data && err.response.data.message
          ? err.response.data.message
          : "Login failed";
      return rejectWithValue(message);
    }
  }
);

// --- Register User ---
export const registerUser = createAsyncThunk(
  "auth/register",
  async (userData, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/users/register", userData);
      // Optional: Automatically log in after registration
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role.toLowerCase());
      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Registration failed"
      );
    }
  }
);

// --- Logout User ---
export const logoutUser = createAsyncThunk("auth/logout", async () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
});
export const deleteProfile = createAsyncThunk(
  "auth/deleteProfile",
  async (_, { rejectWithValue }) => {
    try {
      await api.delete("/users/delete"); // token auto-attached
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      return true;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to delete account"
      );
    }
  }
);
// --- Auth Slice ---
const authSlice = createSlice({
  name: "auth",
  initialState: {
    loggedIn: !!localStorage.getItem("token"), // keep logged in on refresh
    role: localStorage.getItem("role") || null,
    user: null,
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // --- Login ---
      .addCase(loginUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.loggedIn = true;
        state.role = action.payload.role.toLowerCase();
        state.user = action.payload.user;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
        state.loggedIn = false;
      })

      // --- Register ---
      .addCase(registerUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.loggedIn = true; // automatically logged in after register
        state.role = action.payload.role.toLowerCase();
        state.user = action.payload.user;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
        state.loggedIn = false;
      })

      // --- Logout ---
      .addCase(logoutUser.fulfilled, (state) => {
        state.loggedIn = false;
        state.role = null;
        state.user = null;
        state.status = "idle";
        state.error = null;
      })
      .addCase(deleteProfile.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(deleteProfile.fulfilled, (state) => {
        state.status = "succeeded";
        state.loggedIn = false;
        state.role = null;
        state.user = null;
      })
      .addCase(deleteProfile.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export default authSlice.reducer;
