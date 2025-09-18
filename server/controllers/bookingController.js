
import Stripe from "stripe";
import Booking from "../models/bookingmodels.js";
import User from "../models/userModels.js";
import Room from "../models/roomModels.js";
import { calculateTotals } from "./helpers/bookingHelper.js";
import { sendEmail } from "../utils/mail.js";


// ---------- Helper ----------
const populateRooms = async (booking) => {
  await booking.populate("rooms.roomType");
  return booking;
};

// ---------- User Booking ----------
export const createOrUpdatePendingBooking = async (req, res) => {
  try {
    const userId = req.user._id;
    const { rooms, checkInDate, checkOutDate, mobileNum, bookingId } = req.body;

    if (!rooms || !checkInDate || !checkOutDate || !mobileNum) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const nights = Math.max(
      1,
      Math.ceil((new Date(checkOutDate) - new Date(checkInDate)) / (1000 * 60 * 60 * 24))
    );

    const populatedRooms = await Promise.all(
      rooms.map(async (r) => {
        const roomData = await Room.findById(r.roomType);
        if (!roomData) throw new Error("Room not found");
        return {
          ...r,
          roomType: roomData,
          lunch: r.lunch || 0,
          dinner: r.dinner || 0,
        };
      })
    );

    const { sanitizedRooms, totalGuests, totalPrice, gst, grandTotal } = calculateTotals({
      rooms: populatedRooms,
      nights,
    });

    let booking;
    if (bookingId) {
      booking = await Booking.findOne({ _id: bookingId, userId });
    }

    if (booking) {
      booking.rooms = sanitizedRooms;
      booking.checkInDate = checkInDate;
      booking.checkOutDate = checkOutDate;
      booking.mobileNum = mobileNum;
      booking.totalGuests = totalGuests;
      booking.totalPrice = totalPrice;
      booking.gst = gst;
      booking.grandTotal = grandTotal;
      await booking.save();
    } else {
      booking = await Booking.create({
        userId,
        email: req.user.email,
        rooms: sanitizedRooms,
        checkInDate,
        checkOutDate,
        mobileNum,
        totalGuests,
        totalPrice,
        gst,
        grandTotal,
        status: "pending",
        paymentStatus: "unpaid",
      });
    }

    res.status(201).json({ booking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---------- Confirm Booking ----------
export const confirmBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { checkInDate, checkOutDate, mobileNum, email, paymentIntentId } = req.body;

    const booking = await Booking.findOne({ _id: id, userId: req.user._id });
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    booking.checkInDate = checkInDate;
    booking.checkOutDate = checkOutDate;
    booking.mobileNum = mobileNum;
    booking.email = email || booking.email;
    booking.status = "confirmed";
    booking.paymentStatus = "paid";
    booking.paymentIntentId = paymentIntentId;

    // Ensure meals remain stored
    booking.rooms = booking.rooms.map((r) => ({
      ...r,
      lunch: r.lunch || 0,
      dinner: r.dinner || 0,
    }));

    

    await booking.save();

        const html = `
      <h2>Booking Confirmed!</h2>
      <p>Hi ${req.user.name}, your booking is confirmed.</p>
      <p>Booking Details:</p>
      <ul>
        <li>Room(s): ${booking.rooms.map(r => r.roomType.name).join(", ")}</li>
        <li>Check-in: ${booking.checkInDate.toDateString()}</li>
        <li>Check-out: ${booking.checkOutDate.toDateString()}</li>
        <li>Total Guests: ${booking.totalGuests}</li>
        <li>Total Price: ₹${booking.grandTotal}</li>
      </ul>
    `;
    await sendEmail(booking.email, "Booking Confirmation", html);
    res.json({ booking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id }).populate("rooms.roomType");
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (booking.status === "cancelled") {
      return res.status(400).json({ message: "Booking already cancelled" });
    }
    booking.status = "cancelled";

    if (
      booking.paymentStatus === "paid" &&
      booking.paymentIntentId &&
      !booking.isRefunded
    ) {
      booking.refundPending = true;
      booking.isRefunded = false; // Admin must approve
    }
    await booking.save();
    await populateRooms(booking);

        // Send email to guest
    const html = `
      <h2>Booking Cancelled</h2>
      <p>Hi ${req.user.name}, your booking has been cancelled.</p>
      <p>${booking.paymentStatus === "paid" && !booking.isRefunded ? "Refund will be processed by admin shortly." : ""}</p>
      <p>Booking Details:</p>
      <ul>
        <li>Room(s): ${booking.rooms.map(r => r.roomType.type).join(", ")}</li>
        <li>Check-in: ${booking.checkInDate.toDateString()}</li>
        <li>Check-out: ${booking.checkOutDate.toDateString()}</li>
        <li>Total Price: ₹${booking.grandTotal}</li>
      </ul>
    `;
    await sendEmail(booking.email, "Booking Cancelled", html);

    res.json({
      message: "Booking cancelled (refund pending if paid)",
      booking,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



// ---------- Admin actions ----------
export const getAllBookings = async (req, res) => {
  try {
    const { name, email, guests, status, paymentStatus, startDate, endDate, page,perPage  } = req.query;
    

    const filter = {};

    if (email) {
      filter.email = { $regex: email, $options: "i" };
    }
    if (guests) {
      filter.totalGuests = { $gte: Number(guests) };
    }
    if (status && status !== "all") {
      filter.status = status;
    }
    if (paymentStatus && paymentStatus !== "all") {
      filter.paymentStatus = paymentStatus;
    }
if (startDate && endDate) {
  filter.checkInDate = { $gte: new Date(startDate) };
  filter.checkOutDate = { $lte: new Date(endDate) };
}
    // Mongo query for pagination
    let query = Booking.find(filter)
      .populate("rooms.roomType")
      .populate("userId", "name email")
      .sort({ createdAt: -1 }) // latest first
      .skip((Number(page) - 1) * Number(perPage))
      .limit(Number(perPage));

    let bookings = await query;

    // Name filter (must happen after population)
    if (name) {
      bookings = bookings.filter(b =>
        b.userId?.name?.toLowerCase().includes(name.toLowerCase())
      );
    }

    // Total count (for pagination)
    const totalBookings = await Booking.countDocuments(filter);

    res.json({bookings, totalBookings});
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteBookingAdmin = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    await populateRooms(booking);
    res.json({ message: "Booking deleted successfully", booking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getMetrics = async (req, res) => {
  try {
    const { name, email, guests, status, paymentStatus, startDate, endDate } = req.query;

    const filter = {};

    if (email) {
      filter.email = { $regex: email, $options: "i" };
    }
    if (guests) {
      filter.totalGuests = { $gte: Number(guests) };
    }
    if (status && status !== "all") {
      filter.status = status;
    }
    if (paymentStatus && paymentStatus !== "all") {
      filter.paymentStatus = paymentStatus;
    }
    if (startDate && endDate) {
      filter.checkInDate = { $gte: new Date(startDate) };
      filter.checkOutDate = { $lte: new Date(endDate) };
    }

    // 🔹 Filtered bookings
    let bookings = await Booking.find(filter).populate("userId", "name email");

    if (name) {
      bookings = bookings.filter((b) =>
        b.userId?.name?.toLowerCase().includes(name.toLowerCase())
      );
    }

    // --- Totals
    const totalBookings = bookings.length;
    const confirmedBookings = bookings.filter((b) => b.status === "confirmed").length;
    const pendingBookings = bookings.filter((b) => b.status === "pending").length;
    const totalUsers = await User.countDocuments();

    let totalRevenue = bookings.reduce((sum, b) => sum + (b.grandTotal || 0), 0);
    totalRevenue = Number(totalRevenue.toFixed(2));

    // --- Daily stats (for charting)
    const dailyStats = {};
    bookings.forEach((b) => {
      const local = new Date(b.checkInDate);
      const date = `${local.getFullYear()}-${String(local.getMonth() + 1).padStart(2, "0")}-${String(local.getDate()).padStart(2, "0")}`;

      if (!dailyStats[date]) {
        dailyStats[date] = { count: 0, revenue: 0 };
      }
      dailyStats[date].count += 1;
      dailyStats[date].revenue += b.grandTotal || 0;
    });

    const bookingChartData = Object.entries(dailyStats).map(([date, v]) => ({
      date,
      count: v.count,
    }));

    const revenueChartData = Object.entries(dailyStats).map(([date, v]) => ({
      date,
      revenue: v.revenue,
    }));

    let todayStats = { count: 0, revenue: 0 };

    const isFilterApplied = name || email || guests || (status && status !== "all") || (paymentStatus && paymentStatus !== "all") || (startDate && endDate);

    if (isFilterApplied) {
      todayStats.count = bookings.length;
      todayStats.revenue = bookings.reduce((sum, b) => sum + (b.grandTotal || 0), 0);
    } else {
      // filters clear → all bookings stats
      const totalBookingsCount = bookings.length;
      const totalRevenueSum = bookings.reduce((sum, b) => sum + (b.grandTotal || 0), 0);
      todayStats = { count: totalBookingsCount, revenue: totalRevenueSum };
    }

    res.json({
      totalBookings,
      confirmedBookings,
      pendingBookings,
      totalUsers,
      totalRevenue,
      bookingChartData,
      revenueChartData,
      todayRevenue: todayStats.revenue,
      todayBookings: todayStats.count,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin cancel booking
export const adminCancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.status === "cancelled")
      return res.status(400).json({ message: "Already cancelled" });

    booking.status = "cancelled";
    if (
      booking.paymentStatus === "paid" &&
      booking.paymentIntentId &&
      !booking.isRefunded
    ) {
      booking.refundPending = true;
      booking.isRefunded = false;
    }

    await booking.save();
      await populateRooms(booking);
    res.status(200).json({ message: "Booking cancelled by admin", booking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// Admin mark booking paid/unpaid
export const markBookingPaid = async (req, res) => {
  try {
    const { status } = req.body; // expect "paid" or "unpaid"
    if (!["paid", "unpaid"].includes(status)) {
      return res.status(400).json({ message: "Invalid payment status" });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    booking.paymentStatus = status;
    if (status === "unpaid") {
      booking.paymentIntentId = undefined;
    }

    await booking.save();
    await populateRooms(booking);
    res.json({ message: `Booking marked ${status}`, booking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// Admin approve refund
export const approveRefund = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (!booking.refundPending) {
      return res
        .status(400)
        .json({ message: "No refund pending for this booking" });
    }
    if (booking.isRefunded) {
      return res.status(400).json({ message: "Already refunded" });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const refund = await stripe.refunds.create({
      payment_intent: booking.paymentIntentId,
    });

    booking.refundId = refund.id;
    booking.isRefunded = true;
    booking.refundPending = false;
    booking.paymentStatus = "refunded";

    await booking.save();
    await populateRooms(booking);

    // Send email to guest
    const html = `
      <h2>Refund Processed!</h2>
      <p>Hi ${booking.userName || "Guest"}, your refund has been successfully processed.</p>
      <p>Booking Details:</p>
      <ul>
        <li>Room(s): ${booking.rooms.map(r => r.roomType.name).join(", ")}</li>
        <li>Check-in: ${booking.checkInDate.toDateString()}</li>
        <li>Check-out: ${booking.checkOutDate.toDateString()}</li>
        <li>Total Refund: ₹${booking.grandTotal}</li>
      </ul>
    `;
    await sendEmail(booking.email, "Refund Processed", html);
    res.json({ message: "Refund processed successfully", booking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
