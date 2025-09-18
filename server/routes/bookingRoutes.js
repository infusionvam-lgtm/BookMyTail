import express from "express";
import {
  createOrUpdatePendingBooking,
  getMyBookings,
  cancelBooking,
  deleteBookingAdmin,
  confirmBooking,
  getAllBookings,
  getMetrics,
  adminCancelBooking,
  markBookingPaid,
  approveRefund
} from "../controllers/bookingController.js";
import { protect,isAdmin  } from "../middleware/authAdmin.js";

const router = express.Router();

router.post("/cart", protect, createOrUpdatePendingBooking); // confirm booking
router.put("/:id/confirm", protect, confirmBooking);
router.get("/my", protect, getMyBookings); // get my bookings
router.put("/:id/cancel", protect, cancelBooking);// cancel booking

// --- New admin routes ---
router.get("/all", protect, getAllBookings); // GET all bookings
router.get("/metrics", protect, getMetrics); // GET metrics for dashboard
router.put("/:id/admin-cancel", protect, isAdmin, adminCancelBooking);
router.put("/:id/mark-paid", protect, isAdmin, markBookingPaid);
router.put("/:id/refund", protect, isAdmin, approveRefund);
router.delete("/:id/admin-delete", protect, isAdmin, deleteBookingAdmin);

export default router;
