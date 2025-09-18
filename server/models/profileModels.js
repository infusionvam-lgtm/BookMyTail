import mongoose from "mongoose";

const profileSchema = new mongoose.Schema({
    userId: {type: mongoose.Schema.Types.ObjectId, ref:"User", required: true, unique: true},
    phone: {type: String},
    age: {type: Number},
    gender: {type: String, enum: ["Male", "Female", "Other"]},
    avatar : {type: String},
    dob: {type: Date}
},{timestamps: true})

const Profile = mongoose.model("Profile", profileSchema)
export default Profile