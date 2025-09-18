import express from "express";
import { protect, isAdmin} from "../middleware/authAdmin.js";
import { getAllUsers, blockUser, unblockUser, deleteUser } from "../controllers/adminUserController.js";

const router = express.Router();

router.use(protect);     // protected routes
router.use(isAdmin);   // only admin can access

router.get("/users", getAllUsers);
router.put("/users/block/:id", blockUser);
router.put("/users/unblock/:id", unblockUser);
router.delete("/users/:id", deleteUser);

export default router;