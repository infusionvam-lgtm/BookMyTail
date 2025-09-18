import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  createOrUpdateBookingAPI,
  getMyBookingsAPI,
  cancelBookingAPI,
  deleteBookingAdminAPI,
  confirmBookingAPI,
  getAllBookingsAPI,
  getMetricsAPI,
  adminCancelBookingAPI,
  markBookingPaidAPI,
  approveRefundAPI,
} from "./bookingAPI.js";

// ---------- User Actions ----------
export const updateCartBooking = createAsyncThunk(
  "bookings/update",
  async (bookingData) => {
    const data = await createOrUpdateBookingAPI(bookingData);
    return data.booking || data;
  }
);

export const confirmBooking = createAsyncThunk(
  "bookings/confirm",
  async (bookingData) => {
    const data = await confirmBookingAPI(bookingData);
    return data.booking || data;
  }
);

export const loadMyBookings = createAsyncThunk(
  "bookings/loadMy",
  async () => await getMyBookingsAPI()
);

export const cancelBooking = createAsyncThunk(
  "bookings/cancel",
  async (id) => {
    const data = await cancelBookingAPI(id);
    return data.booking;
  }
);

// ---------- Admin Actions ----------
export const loadAllBookings = createAsyncThunk(
  "bookings/loadAll",
  async (filters = {}) => {
    return await getAllBookingsAPI(filters);
  }
);
export const loadMetrics = createAsyncThunk(
  "bookings/loadMetrics",
  async (filters = {}) => {
    return await getMetricsAPI(filters);
  }
);

export const deleteBookingAdmin = createAsyncThunk(
  "bookings/adminDeleteBooking",
  async (id) => {
    await deleteBookingAdminAPI(id);
    return id;
  }
);

export const adminCancelBooking = createAsyncThunk(
  "bookings/adminCancel",
  async (id) => {
    const data = await adminCancelBookingAPI(id);
    return data.booking;
  }
);

export const markBookingPaid = createAsyncThunk(
  "bookings/markPaid",
  async ({ id, status }) => {
    const data = await markBookingPaidAPI(id, status);
    return data.booking;
  }
);

export const approveRefund = createAsyncThunk(
  "bookings/approveRefund",
  async (id) => {
    const data = await approveRefundAPI(id);
    return data.booking;
  }
);

// Helper function to immutably update bookings in state
const updateBookingInState = (state, updatedBooking) => {
  if (!updatedBooking || !updatedBooking._id) return;
  // Update user bookings
  const myIndex = state.myBookings.findIndex(b => b._id === updatedBooking._id);
  if (myIndex !== -1) state.myBookings[myIndex] = updatedBooking;

  // Update admin bookings
  const adminIndex = state.allBookings.findIndex(b => b._id === updatedBooking._id);
  if (adminIndex !== -1) state.allBookings[adminIndex] = updatedBooking;
};

const bookingSlice = createSlice({
  name: "bookings",
  initialState: {
    myBookings: [],
    allBookings: [],
    status: "idle",
    error: null,
    metrics: {},
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // ---------- User Actions ----------
      .addCase(updateCartBooking.fulfilled, (state, action) => {
        const newBooking = action.payload;
        if (!newBooking) return;

        // Add or update user bookings
        const myIndex = state.myBookings.findIndex(b => b._id === newBooking._id);
        if (myIndex !== -1) state.myBookings[myIndex] = newBooking;
        else state.myBookings.push(newBooking);

        // Add or update admin bookings
        const adminIndex = state.allBookings.findIndex(b => b._id === newBooking._id);
        if (adminIndex !== -1) state.allBookings[adminIndex] = newBooking;
        else state.allBookings.push(newBooking);
      })
      .addCase(confirmBooking.fulfilled, (state, action) => {
        updateBookingInState(state, action.payload);
      })
      .addCase(loadMyBookings.fulfilled, (state, action) => {
        state.myBookings = action.payload;
        
      })
      .addCase(cancelBooking.fulfilled, (state, action) => {
        updateBookingInState(state, action.payload);  
      })

      // ---------- Admin Actions ----------
      .addCase(loadAllBookings.fulfilled, (state, action) => {
        state.allBookings = action.payload.bookings;
  state.metrics.totalBookings = action.payload.totalBookings;
      })
      .addCase(loadMetrics.fulfilled, (state, action) => {
        state.metrics = action.payload;
      })
      .addCase(deleteBookingAdmin.fulfilled, (state, action) => {
        const deletedId = action.payload;
        state.myBookings = state.myBookings.filter(b => b._id !== deletedId);
        state.allBookings = state.allBookings.filter(b => b._id !== deletedId);
        
      })
      .addCase(adminCancelBooking.fulfilled, (state, action) => {
        if (!action.payload) return;
        updateBookingInState(state, action.payload);
      })
      .addCase(markBookingPaid.fulfilled, (state, action) => {
        if (!action.payload) return;
        updateBookingInState(state, action.payload);
      })
      .addCase(approveRefund.fulfilled, (state, action) => {
        if (!action.payload) return;
        updateBookingInState(state, action.payload);
      });
  },
});

export default bookingSlice.reducer;
