import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import multer from "multer";

import connectDB from "./config/db.js";
import createAdmin from "./utils/createAdmin.js";

import userRouter from "./routes/userRoutes.js";
import roomRouter from "./routes/roomRoutes.js";
import profileRouter from "./routes/profileRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";
import cartRouter from "./routes/CartRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import adminUserRouter from "./routes/adminUserRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js"

import { protect } from "./middleware/authAdmin.js";

dotenv.config();
connectDB();

const app = express();
app.use(
  cors({
    origin: "http://localhost:5173", // your frontend (vite) runs here
    credentials: true, // allow cookies/auth headers if needed
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use("/upload", express.static(path.join("images", "upload")));
// Allow larger body for base64 images
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


createAdmin();

app.get("/", (req, res) => {res.send("successfully working api")});

app.use("/users", userRouter);

app.use("/rooms", roomRouter);

app.use("/profile", protect, profileRouter);

app.use("/bookings", protect, bookingRouter);

app.use("/cart", protect, cartRouter);

app.use("/payments", paymentRoutes);

app.use("/admin", adminUserRouter)

app.use("/reviews", reviewRoutes)




// Multer error handler
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: err.message });
  } else if (err) {
    return res.status(400).json({ message: err.message });
  }
  next();
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
