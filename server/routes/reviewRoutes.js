import express from "express";
import { protect } from "../middleware/authAdmin.js";
import { createReview, getAllReviews } from "../controllers/reviewController.js";

const router = express.Router();

router.post("/", protect, createReview); // user adds review
router.get("/", getAllReviews); // anyone (admin/frontend) can fetch reviews

export default router;
