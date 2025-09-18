import mongoose from "mongoose";

const bookingCartSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rooms: [
      {
        roomType: { type: mongoose.Schema.Types.ObjectId, ref: "Rooms", required: true },
        count: { type: Number, default: 1, min: 1 },
        lunch: { type: Number, default: 0 },  // lunch price per room
        dinner: { type: Number, default: 0 }, // dinner price per room
      },
    ],
    checkInDate: Date,
    checkOutDate: Date,
    guests: {type: Number, min:1},
    totalGuests: { type: Number, min: 1 },
    totalPrice: { type: Number, default: 0 },
    gst: { type: Number, default: 0 },
    grandTotal: { type: Number, default: 0 },
    mobileNum: String,
  },
  { timestamps: true }
);

const BookingCart = mongoose.model("BookingCart", bookingCartSchema);
export default BookingCart;