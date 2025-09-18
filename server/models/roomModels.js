import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
  type: { type: String, required: true }, // "Single bed", "Double bed"
  price: { type: Number, required: true, min: 0 },
  capacity: { type: Number, required: true, min: 1 },
  totalRooms: { type: Number, required: true, min: 1 },
  availableRooms: { type: Number, required: true, min: 0 },
  description: { type: String, trim: true },
  images: {
      type: [String],
      validate: [
        (arr) => arr.length <= 5, // max 5 images
        "Maximum 5 images allowed",
      ],
    },
  services: {
    wifi: { type: Boolean, default: true },     // always free
    breakfast: { type: Boolean, default: true },
    ac:{ type: Boolean, default: true },
    tv:{ type: Boolean, default: true },
    lunch: { type: Number, default: 0 },        // per person cost
    dinner: { type: Number, default: 0 },       // per person cost
  }
}, { timestamps: true });

const Room = mongoose.model("Rooms", roomSchema);
export default Room;
