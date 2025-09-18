import express from "express";
import { roomUpload } from "../middleware/upload.js";
import { createRoom, updateRoom, getAllRooms, getRoomById,  deleteRoom} from "../controllers/roomController.js";
import { isAdmin, protect } from "../middleware/authAdmin.js";

const router = express.Router();
router.post("/create", protect, isAdmin, roomUpload.array("images", 5), createRoom)
router.put("/:id/update", protect, isAdmin, roomUpload.array("images", 5), updateRoom);
router.delete("/:id", protect, isAdmin, deleteRoom)
router.get("/getAll", getAllRooms)
router.get("/:id", getRoomById)


export default router