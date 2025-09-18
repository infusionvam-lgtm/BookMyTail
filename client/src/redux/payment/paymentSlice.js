import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { createPaymentIntentAPI } from "./paymentAPI.js";

// Create Payment Intent
export const createPaymentIntent = createAsyncThunk(
  "payment/createIntent",
  async (amount) => {
    return await createPaymentIntentAPI(amount);
  }
);


const paymentSlice = createSlice({
  name: "payment",
  initialState: {
    clientSecret: null,
    status: "idle",
    error: null,
  },
  reducers: {
    resetPaymentState: (state) => {
      state.clientSecret = null;
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createPaymentIntent.pending, (state) => {
        state.status = "loading";
      })
      .addCase(createPaymentIntent.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.clientSecret = action.payload.clientSecret;
      })
      .addCase(createPaymentIntent.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
  },
});

export const {resetPaymentState} = paymentSlice.actions;
export default paymentSlice.reducer;