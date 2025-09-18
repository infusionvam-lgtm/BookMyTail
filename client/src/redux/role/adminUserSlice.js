import api from "../api.js";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Fetch all users
export const fetchAllUsers = createAsyncThunk(
  "adminUsers/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/admin/users");
      return data; // array of users
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Block user
export const blockUser = createAsyncThunk(
  "adminUsers/block",
  async (userId, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/admin/users/block/${userId}`);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Unblock user
export const unblockUser = createAsyncThunk(
  "adminUsers/unblock",
  async (userId, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/admin/users/unblock/${userId}`);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Delete user
export const deleteUser = createAsyncThunk(
  "adminUsers/delete",
  async (userId, { rejectWithValue }) => {
    try {
      const { data } = await api.delete(`/admin/users/${userId}`);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const adminUserSlice = createSlice({
  name: "adminUsers",
  initialState: { users: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetch
      .addCase(fetchAllUsers.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchAllUsers.fulfilled, (state, action) => { state.loading = false; state.users = action.payload; })
      .addCase(fetchAllUsers.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      // block/unblock
      .addCase(blockUser.fulfilled, (state, action) => {
        state.users = state.users.map(u => u._id === action.payload._id ? { ...u, isBlocked: true } : u);
      })
      .addCase(unblockUser.fulfilled, (state, action) => {
        state.users = state.users.map(u => u._id === action.payload._id ? { ...u, isBlocked: false } : u);
      })

      // delete
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter(u => u._id !== action.payload.userId);
      });
  },
});

export default adminUserSlice.reducer;
