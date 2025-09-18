import User from "../models/userModels.js";
import Profile from "../models/profileModels.js";
import Booking from "../models/bookingmodels.js";

// ===================== GET ALL USERS (ADMIN) =====================
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: "user" }).populate("profile").lean();

    //add booking information
    const usersWithBookings = await Promise.all(
      users.map(async (u) => {
        const totalBookings = await Booking.countDocuments({ userId: u._id });
        const confirmedBookings = await Booking.countDocuments({
          userId: u._id,
          status: "confirmed",
        });
        const pendingBookings = await Booking.countDocuments({
          userId: u._id,
          status: "pending",
        });
        const cancelBookings = await Booking.countDocuments({
          userId: u._id,
          status: "cancelled",
        });

        return {
          _id: u._id,
          name: u.name,
          email: u.email,
          role: u.role,
          isBlocked: u.isBlocked || false,
          avatar: u.profile?.avatar || "",
          phone: u.profile?.phone || "", // <- add this
          totalBookings,
          confirmedBookings,
          pendingBookings,
          cancelBookings,
        };
      })
    );
    res.status(200).json(usersWithBookings);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ===================== PUT BLOCK USERS (ADMIN) =====================
export const blockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isBlocked = true;
    await user.save();
    res.json({ ...user.toObject() });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ===================== PUT UNBLOCK USERS (ADMIN) =====================
export const unblockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isBlocked = false;
    await user.save();
    res.json({ ...user.toObject() });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ===================== DELETE USERS (ADMIN) =====================
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    await Profile.deleteOne({ userId: user._id });
    await Booking.deleteMany({ userId: user._id });
    await User.deleteOne({ _id: user._id });

    res.json({ userId: req.params.id, message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
