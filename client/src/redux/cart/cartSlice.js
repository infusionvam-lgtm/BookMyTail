import { createSlice, createAsyncThunk, createSelector } from "@reduxjs/toolkit";
import { saveCartAPI, getCartAPI, clearCartAPI } from "./cartAPI.js";

// Load cart from backend
export const loadCart = createAsyncThunk("cart/load", async (_, { rejectWithValue }) => {
  try {
    return await getCartAPI();
  } catch (err) {
    return rejectWithValue(err.message || "Failed to load cart");
  }
});

// Save cart to backend
export const saveCart = createAsyncThunk("cart/save", async (cartData, { rejectWithValue }) => {
  try {
    return await saveCartAPI(cartData);
  } catch (err) {
    return rejectWithValue(err.message || "Failed to save cart");
  }
});

// Clear cart
export const clearCartReducer = createAsyncThunk("cart/clear", async (_, { rejectWithValue }) => {
  try {
    return await clearCartAPI();
  } catch (err) {
    return rejectWithValue(err.message || "Failed to clear cart");
  }
});

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    cart: null,
    bookingId: null,
    status: "idle",
    error: null,
  },
  reducers: {
    setBookingId: (state, action) => {
      if (!state.cart) state.cart = {};
      state.bookingId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Load cart
      .addCase(loadCart.pending, (state) => {
         state.status = "loading";
          state.loading = true; 
        })
      .addCase(loadCart.fulfilled, (state, action) => {
        state.cart = action.payload?.rooms?.length ? action.payload : null;
        state.status = "succeeded";
        state.loading = false;
      })
      .addCase(loadCart.rejected, (state, action) => {
        state.status = "failed";
        state.loading = false;
        state.error = action.payload; 
      })
      // Save cart
      .addCase(saveCart.pending, (state) => {
        state.status = "loading";
        state.loading = true; // Set loading to true for the save action
      })
      .addCase(saveCart.fulfilled, (state, action) => {
        state.cart = action.payload?.rooms?.length ? action.payload : null;
        state.status = "succeeded";
        state.loading = false; // Set loading to false after the action is completed
      })
      .addCase(saveCart.rejected, (state, action) => {
        state.status = "failed";
        state.loading = false;
        state.error = action.payload;
      })
      // Clear cart
      .addCase(clearCartReducer.fulfilled, (state) => {
        state.cart = null;
        state.bookingId = null;
        state.status = "idle";
      })
      .addCase(clearCartReducer.rejected, (state, action) => { state.status = "failed"; state.error = action.payload; });
  },
});

export const { setBookingId } = cartSlice.actions;
export default cartSlice.reducer;

// -----------------
// Memoized Selectors
// -----------------
const selectCartState = (state) => state.cart;
export const selectCart = createSelector([selectCartState], (cartState) => cartState.cart);

export const selectBookingId = createSelector([selectCartState], (cartState) => cartState.bookingId || null);

export const selectCartTotals = createSelector([selectCart], (cart) => {
  if (!cart) {
    return { totalRooms: 0, totalGuests: 0, totalPrice: 0, gst: 0, grandTotal: 0 };
  }
  return {
    totalRooms: cart.rooms?.reduce((sum, r) => sum + r.count, 0) || 0,
    totalGuests: cart.totalGuests || 0,
    totalPrice: cart.totalPrice || 0,
    gst: cart.gst || 0,
    grandTotal: cart.grandTotal || 0,
  };
});
