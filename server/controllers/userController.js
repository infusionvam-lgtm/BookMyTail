import User from "../models/userModels.js";
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import Profile from "../models/profileModels.js";
import { sendEmail } from "../utils/mail.js";
import Review from "../models/reviewModel.js";


// ===================== GENERATE TOKEN FOR USER =====================
const generateToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET, {expiresIn: "7d"})
} 

// ===================== REGISTER USER WITH MAIL =====================
export const registerUser = async(req, res) => {
    const {name, email, password} = req.body;
    const userExists = await User.findOne({email})

    if (userExists) return res.status(400).json({message: "User already exists"});

    const hashedPassword = await bcrypt.hash(password, 6);
    const user = await User.create({name, email, password: hashedPassword})

    await Profile.create({ userId: user._id });

    await sendEmail(
      user.email,
      "Welcome to Opulent Hotel Booking Platform",
      `<h3>Hello ${user.name},</h3>
       <p>Your account has been successfully created!</p>
       <p>Enjoy seamless bookings and stay updates.</p>`
    );

    res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
        
    })
}

// ===================== USER LOGIN AFTER REGISTER =====================
export const loginUser = async (req, res) => {
    const {email, password} = req.body;
    const user = await User.findOne({email})
    if(!user) return res.status(404).json({message:"Please register, you are not authorized."})

    //Check if user is blocked
    if (user.isBlocked) {
        return res.status(403).json({ message: "Your account has been blocked by admin." });
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if(!isMatch) return res.status(404).json({message:"Enter a valid email and password."})

    // only create profile if it's doesn't exist
    const existingProfile = await Profile.findOne({userId: user._id})
    if(!existingProfile){
        await Profile.create({userId: user._id})
    }

    res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id)
    })

}   

// ===================== DELETE USER PROFILE BY USER =====================
export const deleteMyAccount = async (req, res) =>{
   try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: "User not found" });

        await sendEmail(
        user.email,
        "Account Deleted Successfully",
        `<h3>Hello ${user.name},</h3>
        <p>Your account has been successfully deleted from our platform.</p>`
        );

        // Manually delete related profile
        await Profile.deleteOne({ userId: user._id });

        await Review.deleteMany({ userId: user._id });


        // Manually delete user
        await User.deleteOne({ _id: user._id });
        res.json({ message: "User account and related data deleted successfully" });
   } catch (error) {
        res.status(500).json({ message: "Server error" });
   }
}