import express from "express"
import { saveCart, getCart, clearCart, removeRoom} from "../controllers/CartContoller.js"
import { protect } from "../middleware/authAdmin.js"

const router = express.Router();

router.post("/save", protect, saveCart)
router.get("/get", protect, getCart)
router.delete("/delete", protect, clearCart)
router.delete("/remove/:roomId", protect, removeRoom);

export default router       