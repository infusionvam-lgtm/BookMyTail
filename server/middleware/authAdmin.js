import jwt from "jsonwebtoken"
import User from "../models/userModels.js"

export const protect = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
            token = req.headers.authorization.split(' ')[1];
        } 

        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id).select("_id name email role isBlocked"); // ✅ include isBlocked
        if (!user) return res.status(401).json({ message: "User not found" });

        // ✅ Check if user is blocked
        if (user.isBlocked) {
            return res.status(403).json({ message: "Your account has been blocked by admin." });
        }

        req.user = user; // set user for next middleware/routes
        next();
        
    } catch (error) {
        res.status(401).json({message:"Invalid token"})
    }
}

export const isAdmin = (req,res,next) => {
    if(req.user && req.user.role === "admin"){
        next();
    }else{
        res.status(403).json({message:"Access denied: Admin only"})
    }
}