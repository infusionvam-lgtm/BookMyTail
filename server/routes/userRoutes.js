import express from "express";
import { registerUser, loginUser, deleteMyAccount } from "../controllers/userController.js";
import { protect } from "../middleware/authAdmin.js";

const router = express.Router()

router.post("/register", registerUser)
router.post("/login", loginUser)
router.delete("/delete", protect, deleteMyAccount)
export default router