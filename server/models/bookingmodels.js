import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    email: { type: String, required: true },
    rooms: [
      {
        roomType: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Rooms",
          required: true,
        },
        count: { type: Number, required: true },
        image: { type: String },
        lunch: { type: Number, default: 0 },   // store lunch price per room
        dinner: { type: Number, default: 0 }, 

        //  Store cost breakdown per room block
        nights: { type: Number,default: 1 }, // number of nights booked
        roomTotal: { type: Number }, // subtotal for this roomType (price * count * nights)
        serviceCost: { type: Number }, // meals/services cost for guests in this room
      },
    ],

    checkInDate: { type: Date, required: true },
    checkOutDate: { type: Date, required: true },
    mobileNum: { type: String, required: true },

    totalGuests: { type: Number, required: true },

    totalPrice: { type: Number, required: true }, // subtotal (rooms + services, before GST)
    gst: { type: Number, required: true },
    grandTotal: { type: Number, required: true }, // final price

    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "refunded"],
      default: "unpaid",
    },

    paymentIntentId: { type: String }, // Stripe PaymentIntent ID
    refundId: { type: String }, // Stripe Refund ID
    isRefunded: { type: Boolean, default: false },
    refundPending: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Booking =
  mongoose.models.Booking || mongoose.model("Booking", bookingSchema);
export default Booking;
