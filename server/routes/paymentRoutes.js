import express from "express";
import { createPaymentIntent} from "../controllers/paymentController.js";
import { protect } from "../middleware/authAdmin.js";

const router = express.Router();

router.post("/create-intent",protect, createPaymentIntent); // returns clientSecret

export default router;