import Room from "../models/roomModels.js";
import BookingCart from "../models/CartModels.js";
import Booking from "../models/bookingmodels.js";
import path from "path";
import fs from "fs";

const getFilePath = (file) => `rooms/${file.filename}`;

// ===================== POST ADD ROOMS (ADMIN) =====================
export const createRoom = async (req, res) => {
  try {
    const { type, price, capacity, totalRooms, description, services } =
      req.body;

    // Validate required fields
    if (!totalRooms || !type || !price || !capacity) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    let room = await Room.findOne({ type });

    if (room) {
      room.totalRooms += Number(totalRooms);
      room.availableRooms += Number(totalRooms);

      // update services if provided
      if (services) room.services = { ...room.services, ...services };

      await room.save();
      return res.status(200).json({
        message: `Added ${totalRooms} more rooms to type "${type}"`,
        room,
      });
    }

    // Convert images to base64
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.slice(0, 5).map(getFilePath);
    }

    // Create room
    const newRoom = await Room.create({
      type,
      price,
      capacity,
      totalRooms,
      availableRooms: totalRooms,
      description,
      images,
      services: {
        wifi: services?.wifi ?? true,
        breakfast: services?.breakfast ?? true,
        lunch: services?.lunch ?? 0,
        ac: services?.ac ?? true,
        tv: services?.tv ?? true,
        dinner: services?.dinner ?? 0,
      },
    });

    res
      .status(201)
      .json({ message: "Room created successfully", room: newRoom });
  } catch (error) {
    res.status(500).json({ message: "No room created", error: error.message });
  }
};

// ===================== PUT UPDATE ROOMS (ADMIN) =====================
export const updateRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      type,
      price,
      capacity,
      totalRooms,
      description,
      services,
      deletedImages,
    } = req.body;

    const room = await Room.findById(id);
    if (!room) return res.status(404).json({ message: "Room not found" });

    // Remove deleted images
    if (deletedImages && Array.isArray(deletedImages)) {
      deletedImages.forEach((filePath) => {
        // Extract filename from full URL or relative path
        const filename = path.basename(filePath);

        // Construct server path to the file
        const imgPath = path.join("images", "upload", "rooms", filename);

        // Delete file if it exists
        if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);

        // Remove from room.images array
        room.images = room.images.filter((img) => !img.includes(filename));
      });
    }

    if (type) room.type = type;
    if (price !== undefined) room.price = price;
    if (capacity !== undefined) room.capacity = capacity;
    if (description) room.description = description;
    //  Add new images
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(getFilePath);
      room.images = [...room.images, ...newImages].slice(0, 5);
    }
    if (services) room.services = { ...room.services, ...services };

    // If totalRooms is updated, adjust availableRooms proportionally
    if (totalRooms !== undefined) {
      // Get confirmed bookings for this room
      const bookedAgg = await Booking.aggregate([
        { $match: { status: "confirmed" } },
        { $unwind: "$rooms" },
        { $match: { "rooms.roomType": room._id } },
        {
          $group: {
            _id: "$rooms.roomType",
            totalBooked: { $sum: "$rooms.count" },
          },
        },
      ]);
      const bookedCount = bookedAgg.length > 0 ? bookedAgg[0].totalBooked : 0;

      // Get pending carts for this room
      const pendingAgg = await BookingCart.aggregate([
        { $match: { status: "pending" } },
        { $unwind: "$rooms" },
        { $match: { "rooms.roomType": room._id } },
        {
          $group: {
            _id: "$rooms.roomType",
            totalInCart: { $sum: "$rooms.count" },
          },
        },
      ]);
      const pendingCount =
        pendingAgg.length > 0 ? pendingAgg[0].totalInCart : 0;

      // Prevent admin from reducing totalRooms below booked + pending
      const minTotalRooms = bookedCount + pendingCount;
      if (totalRooms < minTotalRooms) {
        return res.status(400).json({
          message: `Cannot reduce total rooms below booked + pending (${minTotalRooms})`,
        });
      }

      // Update room
      room.totalRooms = totalRooms;
      room.availableRooms = totalRooms - bookedCount - pendingCount;
    }

    await room.save();
    res.json({ message: "Room updated successfully", room });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to update room", error: error.message });
  }
};

// ===================== DELETE ROOM =====================
export const deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const { count } = req.body;

    const room = await Room.findById(id);
    if (!room) return res.status(404).json({ message: "Room not found" });

    // how many are already booked (future) or pending
    const now = new Date();
    const bookings = await Booking.aggregate([
      { $match: { status: "confirmed", checkOutDate: { $gt: now } } },
      { $unwind: "$rooms" },
      { $match: { "rooms.roomType": room._id } },
      {
        $group: {
          _id: "$rooms.roomType",
          totalBooked: { $sum: "$rooms.count" },
        },
      },
    ]);
    const bookedCount = bookings.length > 0 ? bookings[0].totalBooked : 0;

    const carts = await BookingCart.aggregate([
      { $unwind: "$rooms" },
      { $match: { "rooms.roomType": room._id, status: "pending" } },
      {
        $group: {
          _id: "$rooms.roomType",
          totalInCart: { $sum: "$rooms.count" },
        },
      },
    ]);
    const cartCount = carts.length > 0 ? carts[0].totalInCart : 0;

    const minTotalRooms = bookedCount + cartCount;
    if (room.totalRooms - count < minTotalRooms) {
      return res.status(400).json({
        message: `Cannot delete rooms below booked (${bookedCount}) + pending (${cartCount}) = ${minTotalRooms}`,
      });
    }

    room.totalRooms -= count;
    await room.save();

    res.status(200).json({ message: "Room(s) deleted successfully", room });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete room", error: error.message });
  }
};

// ===================== GET ALL ROOMS =====================
export const getAllRooms = async (req, res) => {
  try {
    const { checkIn, checkOut, adminView } = req.query;
    const isAdmin = adminView === "true";

    let checkInDate = checkIn ? new Date(checkIn) : new Date();
    let checkOutDate = checkOut ? new Date(checkOut) : new Date();
    if (!checkIn || !checkOut) checkOutDate.setDate(checkOutDate.getDate() + 1);

    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      return res.status(400).json({ message: "Invalid dates" });
    }

    const rooms = await Room.find({}); // ❌ no skip/limit

    const enrichedRooms = await Promise.all(
      rooms.map(async (room) => {
        const bookings = await Booking.aggregate([
          { $match: { status: "confirmed" } },
          { $unwind: "$rooms" },
          {
            $match: {
              "rooms.roomType": room._id,
              checkInDate: { $lt: checkOutDate },
              checkOutDate: { $gt: checkInDate },
            },
          },
          {
            $group: {
              _id: "$rooms.roomType",
              totalBooked: { $sum: "$rooms.count" },
            },
          },
        ]);
        const bookedCount = bookings.length > 0 ? bookings[0].totalBooked : 0;

        const carts = await BookingCart.aggregate([
          { $unwind: "$rooms" },
          {
            $match: {
              "rooms.roomType": room._id,
              status: "pending",
              checkInDate: { $lt: checkOutDate },
              checkOutDate: { $gt: checkInDate },
            },
          },
          {
            $group: {
              _id: "$rooms.roomType",
              totalInCart: { $sum: "$rooms.count" },
            },
          },
        ]);
        const cartCount = carts.length > 0 ? carts[0].totalInCart : 0;

        return {
          ...room._doc,
          availableRooms: Math.max(
            room.totalRooms - bookedCount - cartCount,
            0
          ),
        };
      })
    );

    const filteredRooms = isAdmin
      ? enrichedRooms
      : enrichedRooms.filter((r) => r.availableRooms > 0);

    res.status(200).json({
      totalRooms: filteredRooms.length,
      rooms: filteredRooms,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch rooms" });
  }
};


// ===================== GET ALL ROOMS BY ID =====================
export const getRoomById = async (req, res) => {
  try {
    const { id } = req.params;
    const { checkIn, checkOut, adminView } = req.query;
    const isAdmin = adminView === "true";

    const room = await Room.findById(id);
    if (!room) return res.status(404).json({ message: "Room not found" });

    let checkInDate, checkOutDate;
    if (checkIn && checkOut) {
      checkInDate = new Date(checkIn);
      checkOutDate = new Date(checkOut);

      if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
        return res
          .status(400)
          .json({ message: "Invalid check-in or check-out date" });
      }
    } else {
      // default: today → tomorrow
      checkInDate = new Date();
      checkOutDate = new Date();
      checkOutDate.setDate(checkOutDate.getDate() + 1);
    }

    // confirmed bookings overlapping this date range
    const bookings = await Booking.aggregate([
      { $match: { status: "confirmed" } },
      { $unwind: "$rooms" },
      {
        $match: {
          "rooms.roomType": room._id,
          checkInDate: { $lt: checkOutDate },
          checkOutDate: { $gt: checkInDate },
        },
      },
      {
        $group: {
          _id: "$rooms.roomType",
          totalBooked: { $sum: "$rooms.count" },
        },
      },
    ]);
    const bookedCount = bookings.length > 0 ? bookings[0].totalBooked : 0;

    // pending carts overlapping this date range
    const carts = await BookingCart.aggregate([
      { $unwind: "$rooms" },
      {
        $match: {
          "rooms.roomType": room._id,
          status: "pending",
          checkInDate: { $lt: checkOutDate },
          checkOutDate: { $gt: checkInDate },
        },
      },
      {
        $group: {
          _id: "$rooms.roomType",
          totalInCart: { $sum: "$rooms.count" },
        },
      },
    ]);
    const cartCount = carts.length > 0 ? carts[0].totalInCart : 0;

    const availableRooms = Math.max(
      room.totalRooms - bookedCount - cartCount,
      0
    );

    res.status(200).json({
      _id: room._id,
      type: room.type,
      price: room.price,
      capacity: room.capacity,
      totalRooms: room.totalRooms,
      availableRooms,
      images: room.images,
      description: room.description,
      services: room.services,
    });
  } catch (error) {
    res
    .status(500)
    .json({ message: "Failed to fetch room", error: error.message });
  }
};


