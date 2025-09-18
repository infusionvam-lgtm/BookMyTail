import Profile from "../models/profileModels.js";
import User from "../models/userModels.js";
import Booking from "../models/bookingmodels.js";
import fs from "fs";
import path from "path";
import { calculateTotals } from "./helpers/bookingHelper.js";

// ===================== CREATE PROFILE FOR USER =====================
export const createProfile = async (req, res) => {
  try {
    const existingProfile = await Profile.findOne({ userId: req.user._id });
    if (existingProfile) {
      return res.status(400).json({ message: "Profile already exists" });
    }

    const { phone, age, gender, dob } = req.body;
    const avatar = req.file ? `avatars/${req.file.filename}` : undefined; // <-- get from multer

    const profile = await Profile.create({
      userId: req.user._id,
      phone,
      age,
      gender,
      dob,
      avatar,
    });

    const user = await User.findById(req.user._id).populate(profile);
    res.status(201).json({ user, message: "Profile created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ===================== GET USER WITH PROFILE =====================
export const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("profile");
    if (!user) return res.status(404).json({ message: "User not found" });

    // Get all bookings
    const bookings = await Booking.find({ userId: req.user._id })
      .populate("rooms.roomType")
      .sort({ createdAt: -1 });

    // Stats
    const totalBookings = bookings.length;
    const confirmedBookings = bookings.filter((b) => b.status === "confirmed").length;
    const pendingBookings = bookings.filter((b) => b.status === "pending").length;
    const cancelBookings = bookings.filter((b) => b.status === "cancelled").length;

    // Recent bookings (with calculateTotals)
    const recentBookings = bookings.slice(0, 5).map((b) => {
      const { sanitizedRooms, totalGuests, gst, grandTotal } = calculateTotals({
        rooms: b.rooms,
        nights: b.rooms[0]?.nights || 1, // if nights not stored at booking-level
      });

      return {
        _id: b._id,
        rooms: sanitizedRooms,
        checkInDate: b.checkInDate,
        checkOutDate: b.checkOutDate,
        guests: totalGuests,
        status: b.status,
        paymentStatus: b.paymentStatus,
        gst,
        grandTotal,
      };
    });

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profile: {
        ...user.profile.toObject(),
        totalBookings,
        confirmedBookings,
        pendingBookings,
        cancelBookings,
        recentBookings,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};


// ===================== PUT UPDATE USER PROFILE =====================
export const updateMyProfile = async (req, res) => {
  try {
    const { name, email, phone, age, gender, dob } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (name) user.name = name;
    if (email) user.email = email;
    await user.save();

    let profile = await Profile.findOne({ userId: req.user._id });
    if (!profile) profile = new Profile({ userId: req.user._id });

    if (phone !== undefined) profile.phone = phone;
    if (age !== undefined) profile.age = age;
    if (gender !== undefined) profile.gender = gender;
    if (dob !== undefined) profile.dob = dob;
    if (req.file) {
      // Delete old avatar
      if (profile.avatar) {
        const oldPath = path.join(
          "images",
          "upload",
          "avatars",
          path.basename(profile.avatar)
        );
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }

      profile.avatar = `avatars/${req.file.filename}`;
    }

    await profile.save();

    const updatedUser = await User.findById(req.user._id).populate("profile");
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
