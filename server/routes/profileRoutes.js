    import express from "express"
    import { protect } from "../middleware/authAdmin.js"
    import { createProfile, getMyProfile, updateMyProfile } from "../controllers/profileController.js";
    import { avatarUpload } from "../middleware/upload.js";

    const router = express.Router();

    router.post("/new", protect,avatarUpload.single("avatar"), createProfile)
    router.get("/me", protect, getMyProfile)
    router.put("/me", protect,avatarUpload.single("avatar"), updateMyProfile)

    export default router;