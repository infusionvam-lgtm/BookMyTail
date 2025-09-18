import BookingCart from "../models/CartModels.js";
import Room from "../models/roomModels.js";
import { calculateTotals } from "./helpers/bookingHelper.js";

// ===================== POST SAVE CART =====================
export const saveCart = async (req, res) => {
  try {
    const { rooms, checkInDate, checkOutDate, guests, mobileNum } = req.body;
    const userId = req.user._id;

    // Handle empty cart case: Clear cart and return empty rooms array
    if (!rooms || !Array.isArray(rooms) || rooms.length === 0) {
      await BookingCart.findOneAndDelete({ userId });
      return res.status(200).json({ message: "Cart cleared", rooms: [] });
    }

    // Check if check-in and check-out dates are provided
    if (!checkInDate || !checkOutDate) {
      return res.status(400).json({ message: "Check-in and Check-out dates are required" });
    }

    const nights = Math.max(
      1,
      Math.ceil((new Date(checkOutDate) - new Date(checkInDate)) / (1000 * 60 * 60 * 24))
    );

    // Populate rooms from DB and store per-room guests (capacity), not capacity * count
    const populatedRooms = await Promise.all(
      rooms.map(async (r) => {
        if (!r.roomType) throw new Error("Room type is required");
        const roomData = await Room.findById(r.roomType);
        if (!roomData) throw new Error(`Room not found: ${r.roomType}`);

        return {
          ...r,
          roomType: roomData,                 // we keep roomData so calculateTotals can use .price/.capacity
          count: r.count || 1,
          // <-- store guests per room (capacity), not multiplied by count
          guests: r.guests || roomData.capacity,
          lunch: r.lunch ? roomData.services.lunch : 0,
          dinner: r.dinner ? roomData.services.dinner : 0,
          nights: r.nights || nights,
        };
      })
    );

    // Calculate totals (backend)
    const { sanitizedRooms, totalGuests, totalPrice, gst, grandTotal } = calculateTotals({
      rooms: populatedRooms,
      nights,
    });

    // Find existing cart
    let cart = await BookingCart.findOne({ userId });

    // Update existing cart or create a new one
    if (cart) {
      // If cart exists, update its rooms and other details
      cart.rooms = sanitizedRooms;
      cart.checkInDate = checkInDate;
      cart.checkOutDate = checkOutDate;
      cart.guests = guests || totalGuests;
      cart.totalGuests = totalGuests;
      cart.mobileNum = mobileNum || cart.mobileNum;
      cart.totalPrice = totalPrice;
      cart.gst = gst;
      cart.grandTotal = grandTotal;
      await cart.save();
    } else {
      // Create a new cart if no existing cart
      cart = await BookingCart.create({
        userId,
        rooms: sanitizedRooms,
        checkInDate,
        checkOutDate,
        guests: guests || totalGuests,
        totalGuests,
        mobileNum,
        totalPrice,
        gst,
        grandTotal,
      });
    }

    // Return the final cart with populated room details
    const finalCart = await BookingCart.findById(cart._id).populate("rooms.roomType");
    res.status(200).json(finalCart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ===================== GET CART (FOR ALREDAY SELECTED BY USER) =====================
export const getCart = async (req, res) => {
  try {
    const cart = await BookingCart.findOne({ userId: req.user._id }).populate("rooms.roomType");
    if (!cart) {
      return res.json({ rooms: [] });  // Return empty cart (rooms: [])
    }
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===================== DELETE ALL CART ITEMS =====================
export const clearCart = async (req, res) => {
  try {
    await BookingCart.findOneAndDelete({ userId: req.user._id });
    res.json({ message: "Cart cleared", rooms: [] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===================== DELETE SINGLE CART ITEMS (FOR CART MANAGMENT) =====================
export const removeRoom = async (req, res) => {
  try {
    const userId = req.user._id;
    const { roomId } = req.params;

    let cart = await BookingCart.findOne({ userId }).populate("rooms.roomType");
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    // Remove room
cart.rooms = cart.rooms.filter(r => {
  const id = r.roomType?._id?.toString() || r.roomType.toString();
  return id !== roomId;
});

    // If last room removed, delete cart
    if (cart.rooms.length === 0) {
      await BookingCart.findOneAndDelete({ userId });
      return res.status(200).json({ message: "Cart cleared", rooms: [] });
    }

    // Recalculate totals
    const checkIn = cart.checkInDate ? new Date(cart.checkInDate) : new Date();
    const checkOut = cart.checkOutDate ? new Date(cart.checkOutDate) : new Date(Date.now() + 24*60*60*1000);

    const nights = Math.max(
      1,
      Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24))
    );

    const { sanitizedRooms, totalGuests, totalPrice, gst, grandTotal } = calculateTotals({
      rooms: cart.rooms,
      nights,
    });

    cart.rooms = sanitizedRooms;
    cart.totalGuests = totalGuests;
    cart.totalPrice = totalPrice;
    cart.gst = gst;
    cart.grandTotal = grandTotal;

    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


