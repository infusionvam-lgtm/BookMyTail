import { configureStore } from "@reduxjs/toolkit";
import roomsReducer from "./room/roomsSlice.js";
import bookingReducer from "./booking/bookingSlice.js";
import paymentReducer from "./payment/paymentSlice.js"
import profileReducer  from "./role/profileSlice.js"
import cartReducer from "./cart/cartSlice.js"
import authReducer from "./role/authSlice.js"
import adminUserReducer from "./role/adminUserSlice.js";
import reviewReducer from "./reviewSlice.js";

export const store = configureStore({
  reducer: {
    rooms: roomsReducer,
    bookings: bookingReducer, 
    cart: cartReducer,
    payment: paymentReducer, 
    profile : profileReducer,
    auth: authReducer,
    adminUsers: adminUserReducer,
     reviews: reviewReducer,
  },
});